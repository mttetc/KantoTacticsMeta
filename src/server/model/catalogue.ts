import "server-only";
import type { ApiData, Item, Seal, Trait } from "@/lib/types";
import type { Texts } from "./texts";

/** Items, traits and seals: the game data file's catalogue, in the language of `tx`. */
export function buildItems(data: ApiData, tx: Texts): Record<string, Item> {
  return Object.fromEntries(
    Object.entries(data.items).map(([id, i]) => {
      const t = tx.lang?.items[id];
      return [id, { id, name: t?.name || i.en, kind: i.k, stat: i.stat ?? null, recipe: i.recipe ?? null, text: t?.text || tx.pick(i.text), short: t?.short || (i.short ? tx.pick(i.short) : null) }];
    }),
  );
}

export function buildTraits(data: ApiData, tx: Texts): Record<string, Trait> {
  return Object.fromEntries(
    Object.entries(data.traits).map(([id, t]) => [id, { id, name: tx.lang?.types[id] || tx.pick({ es: t.es ?? t.en, en: t.en }), thresholds: t.th, values: t.values, desc: tx.lang?.traits[id]?.desc || tx.pick(t.desc) }]),
  );
}

/** The word the game uses for a type, per language, for the "{T} Heart" seal templates. */
const TYPE_WORD: Record<string, string> = { en: "Type", fr: "Type", es: "Tipo" };

/** "{T} Heart" is one seal per type; the catalogue shows it once, with the placeholder spelled out. */
export function buildSeals(data: ApiData, tx: Texts): Seal[] {
  const typeWord = TYPE_WORD[tx.locale] ?? TYPE_WORD.en;
  const fillT = (s: string) => s.replace(/\{T\}/g, typeWord);
  return Object.entries(data.seals ?? {}).map(([id, s]) => {
    const ts = tx.lang?.seals?.[id];
    return {
      id,
      code: s.code ?? "",
      rarity: s.rarity,
      cat: s.cat ?? "",
      rounds: s.rounds ?? [],
      hero: s.hero ?? null,
      types: s.template === "type" ? (s.types ?? []) : [],
      name: fillT(ts?.name || tx.pick(s.name)),
      text: s.text.map((t, i) => {
        const tt = ts?.text?.find((x) => (x.round ?? "") === (t.round ?? "")) ?? ts?.text?.[i];
        return { round: t.round ?? "", line: fillT(tt?.line || tx.pick(t.line)), detail: tt?.detail || t.detail?.en ? fillT(tt?.detail || tx.pick(t.detail)) : null };
      }),
    };
  });
}
