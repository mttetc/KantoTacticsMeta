import "server-only";
import type { ApiData, Item, Seal, Trait } from "@/lib/types";

/** Items, traits and seals: the game data file's catalogue, flattened to English. */
export function buildItems(data: ApiData): Record<string, Item> {
  return Object.fromEntries(
    Object.entries(data.items).map(([id, i]) => [
      id,
      { id, name: i.en, kind: i.k, stat: i.stat ?? null, recipe: i.recipe ?? null, text: i.text.en, short: i.short?.en ?? null },
    ]),
  );
}

export function buildTraits(data: ApiData): Record<string, Trait> {
  return Object.fromEntries(
    Object.entries(data.traits).map(([id, t]) => [id, { id, name: t.en, thresholds: t.th, values: t.values, desc: t.desc.en }]),
  );
}

/** "{T} Heart" is one seal per type; the catalogue shows it once, with the placeholder spelled out. */
const fillT = (s: string) => s.replace(/\{T\}/g, "Type");
export function buildSeals(data: ApiData): Seal[] {
  return Object.entries(data.seals ?? {}).map(([id, s]) => ({
    id,
    code: s.code ?? "",
    rarity: s.rarity,
    cat: s.cat ?? "",
    rounds: s.rounds ?? [],
    hero: s.hero ?? null,
    types: s.template === "type" ? (s.types ?? []) : [],
    name: fillT(s.name.en),
    text: s.text.map((t) => ({ round: t.round ?? "", line: fillT(t.line?.en ?? ""), detail: t.detail?.en ? fillT(t.detail.en) : null })),
  }));
}
