import "server-only";
import { FALLBACK_LINES } from "@/lib/fallback-lines";
import { moveTextEn } from "@/lib/move-text-en";
import type { ApiData, ApiMeta, Line, MoveCategory } from "@/lib/types";
import type { Texts } from "./texts";

interface I18n {
  es: string;
  en: string;
}

const category = (scale: { atk: number; spa: number } | null | undefined): MoveCategory => (!scale || (!scale.atk && !scale.spa) ? "utility" : scale.atk && scale.spa ? "mixed" : scale.atk ? "physical" : "special");

/** Pokémon lines from the game data file, completed by the changelog fallbacks and by whatever the Meta still names. Names and texts in `tx`'s language. */
export function buildLines(data: ApiData, meta: ApiMeta, tx: Texts): Record<string, Line> {
  const lines: Record<string, Line> = {};
  for (const [id, l] of Object.entries(data.lines)) {
    const last = l.stars[l.stars.length - 1];
    const tl = tx.lang?.lines[id];
    const passive = tl?.passive || (l.passive == null ? null : tx.pick(l.passive) || null);
    const moveOf = (star: number) => tl?.stars?.find((s) => s.star === star)?.move;
    const text = (star: number, fallback: I18n) => {
      const en = tx.locale === "en" ? moveTextEn(id, star, fallback.en, fallback.es) : null;
      return moveOf(star)?.text || en || tx.pick(fallback);
    };
    lines[id] = {
      id,
      cost: l.c,
      types: l.t,
      range: l.range ?? null,
      names: l.stars.map((s) => tx.lang?.pokemon[String(s.dex)] || s.name),
      dex: l.stars.map((s) => s.dex),
      move: last ? { name: moveOf(last.star)?.name || tx.pick(last.move.name), type: last.move.type, text: text(last.star, last.move.text), category: category(last.move.scale) } : null,
      passive,
      fromChangelog: false,
    };
  }
  for (const [id, l] of Object.entries(FALLBACK_LINES)) lines[id] ??= l;
  for (const u of meta.units) {
    lines[u.line] ??= { id: u.line, cost: null, types: [], range: null, names: [u.line], dex: [], move: null, passive: null, fromChangelog: true };
  }
  return lines;
}
