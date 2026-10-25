import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { traitSlug } from "@/lib/format";
import { metaCacheLife } from "@/lib/freshness";
import { entityTier } from "@/lib/tiers";
import type { Meta } from "@/lib/types";
import { fetchDataRaw, fetchMetaRaw, META_TAG } from "./api";
import { buildItems, buildSeals, buildTraits } from "./model/catalogue";
import { buildComps } from "./model/comps";
import { buildLines } from "./model/lines";

/**
 * The whole normalised model, shared by every page: the one cache boundary over the API. Its life ends right
 * after the API's next daily run (see `metaCacheLife`), with a hard expiry, so the first render after that
 * fetches the day's data instead of serving the old copy while refreshing.
 */
export async function getMeta(): Promise<Meta> {
  "use cache";
  cacheTag(META_TAG);
  const [m, d] = await Promise.all([fetchMetaRaw(), fetchDataRaw()]);
  const meta = m.value, data = d.value;
  const fromSnapshot = m.source === "snapshot" || d.source === "snapshot";
  cacheLife(metaCacheLife(meta.generated, fromSnapshot));
  const lines = buildLines(data, meta);
  const itemData = buildItems(data);
  const traitData = buildTraits(data);
  return {
    source: m.source === "snapshot" || d.source === "snapshot" ? "snapshot" : "api",
    snapshotAt: m.snapshotAt ?? d.snapshotAt,
    generated: meta.generated,
    rules: meta.rules,
    dataRules: data.rules,
    from: meta.from,
    to: meta.to,
    seats: meta.seats,
    games: Math.round(meta.seats / 8),
    ref: meta.ref,
    versions: meta.versions,
    thresholds: meta.thresholds,
    units: meta.units.map((u) => ({ ...u, tier: entityTier(u.tier, u.avg, meta.ref) })),
    items: meta.items.map((i) => ({ ...i, tier: entityTier(i.tier, i.avg, meta.ref) })),
    traits: meta.traits.map((t) => ({ ...t, tier: entityTier(t.tier, t.avg, meta.ref), slug: traitSlug(t.type, t.level) })),
    comps: buildComps(meta, lines, itemData, traitData),
    lines,
    itemData,
    traitData,
    recipes: data.recipes,
    seals: buildSeals(data),
    sealRules: data.pvp.seals ?? null,
    pvp: data.pvp,
  };
}

/* ---- selectors: memoised per request so metadata and page share one read ---- */

export const getUnit = cache(async (line: string) => {
  const m = await getMeta();
  const unit = m.units.find((u) => u.line === line);
  return unit ? { meta: m, unit, line: m.lines[line] } : null;
});

export const getComp = cache(async (slug: string) => {
  const m = await getMeta();
  const comp = m.comps.find((c) => c.slug === slug);
  return comp ? { meta: m, comp } : null;
});

export const getItem = cache(async (id: string) => {
  const m = await getMeta();
  const stat = m.items.find((i) => i.id === id);
  const item = m.itemData[id];
  return stat && item ? { meta: m, stat, item } : null;
});

export const getTrait = cache(async (slug: string) => {
  const m = await getMeta();
  const stat = m.traits.find((t) => t.slug === slug);
  const trait = stat ? m.traitData[stat.type] : undefined;
  return stat && trait ? { meta: m, stat, trait } : null;
});

/* ---- small pure helpers over the model ---- */

export const lineName = (m: Meta, line: string) => m.lines[line]?.names.at(-1) ?? line;
export const unitName = (m: Meta, line: string, star: number | null | undefined) => {
  const l = m.lines[line];
  if (!l) return line;
  const i = Math.min(Math.max((star ?? 1) - 1, 0), l.names.length - 1);
  return l.names[i] ?? l.names.at(-1) ?? line;
};
export const unitDex = (m: Meta, line: string, star: number | null | undefined) => {
  const l = m.lines[line];
  if (!l || !l.dex.length) return null;
  const i = Math.min(Math.max((star ?? 1) - 1, 0), l.dex.length - 1);
  return l.dex[i] ?? null;
};
export const lineDex = (m: Meta, line: string) => m.lines[line]?.dex.at(-1) ?? null;
export const itemName = (m: Meta, id: string) => m.itemData[id]?.name ?? id;
export const typeName = (m: Meta, t: string) => m.traitData[t]?.name ?? t;
