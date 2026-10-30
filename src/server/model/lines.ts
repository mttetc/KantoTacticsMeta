import "server-only";
import { FALLBACK_LINES } from "@/lib/fallback-lines";
import { moveTextEn } from "@/lib/move-text-en";
import type { ApiData, ApiLine, ApiMeta, Line, MoveCategory } from "@/lib/types";
import type { Texts } from "./texts";

interface I18n {
  es: string;
  en: string;
}

const category = (scale: { atk: number; spa: number } | null | undefined): MoveCategory => (!scale || (!scale.atk && !scale.spa) ? "utility" : scale.atk && scale.spa ? "mixed" : scale.atk ? "physical" : "special");

/**
 * Since rules 40 the Meta names a unit kept in an earlier form apart from its line: `oddish-a1` is the Oddish line
 * anchored as Gloom (form 1), `zubat-a0` a Zubat that never became Golbat, and `pikachu-partner` the Partner
 * Seal's Pikachu, which never evolves. The game data file only describes the line, so these are derived from it.
 */
const VARIANT = /^(.+)-(?:a(\d)|(partner))$/;

export function lineVariant(id: string): Line["variant"] {
  const m = VARIANT.exec(id);
  if (!m) return null;
  return m[3] ? { kind: "partner", base: m[1], form: 0 } : { kind: "anchored", base: m[1], form: Number(m[2]) };
}

/** A line of the game data file; with a variant, every star keeps the anchored form and uses that form's move. */
function fromData(id: string, l: ApiLine, tx: Texts, variant: Line["variant"]): Line {
  const base = variant?.base ?? id;
  const cap = variant ? l.s[Math.min(variant.form, l.s.length - 1)] : null;
  const formOf = (dex: number) => l.s.indexOf(dex);
  const dexAt = (s: ApiLine["stars"][number]) => (cap != null && formOf(s.dex) > formOf(cap) ? cap : s.dex);
  const last = l.stars[l.stars.length - 1];
  const card = cap != null ? (l.stars.find((s) => s.dex === cap) ?? last) : last;
  const tl = tx.lang?.lines[base];
  const passive = tl?.passive || (l.passive == null ? null : tx.pick(l.passive) || null);
  const moveOf = (star: number) => tl?.stars?.find((s) => s.star === star)?.move;
  const text = (star: number, fallback: I18n) => {
    const en = tx.locale === "en" ? moveTextEn(base, star, fallback.en, fallback.es) : null;
    return moveOf(star)?.text || en || tx.pick(fallback);
  };
  return {
    id,
    cost: l.c,
    types: l.t,
    range: l.range ?? null,
    names: l.stars.map((s) => {
      const dex = dexAt(s);
      return tx.lang?.pokemon[String(dex)] || l.stars.find((x) => x.dex === dex)?.name || s.name;
    }),
    dex: l.stars.map(dexAt),
    move: card ? { name: moveOf(card.star)?.name || tx.pick(card.move.name), type: card.move.type, text: text(card.star, card.move.text), category: category(card.move.scale) } : null,
    passive,
    variant,
    fromChangelog: false,
  };
}

/** Pokémon lines from the game data file, completed by the changelog fallbacks and by whatever the Meta still names. Names and texts in `tx`'s language. */
export function buildLines(data: ApiData, meta: ApiMeta, tx: Texts): Record<string, Line> {
  const lines: Record<string, Line> = {};
  for (const [id, l] of Object.entries(data.lines)) lines[id] = fromData(id, l, tx, null);
  for (const [id, l] of Object.entries(FALLBACK_LINES)) lines[id] ??= l;
  for (const u of meta.units) {
    if (lines[u.line]) continue;
    const variant = lineVariant(u.line);
    const base = variant ? data.lines[variant.base] : undefined;
    lines[u.line] = base ? fromData(u.line, base, tx, variant) : { id: u.line, cost: null, types: [], range: null, names: [u.line], dex: [], move: null, passive: null, variant: null, fromChangelog: true };
  }
  return lines;
}
