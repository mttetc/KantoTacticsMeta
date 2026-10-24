import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { assignRoles } from "@/lib/carry";
import { FALLBACK_LINES } from "@/lib/fallback-lines";
import { compSlug, traitSlug } from "@/lib/format";
import { bestSetup, buildTypicalCells } from "@/lib/placement";
import { compScore, compTier, entityTier, MIN_NE } from "@/lib/tiers";
import type { ApiData, ApiMeta, Comp, Item, Line, Meta, Seal, Trait } from "@/lib/types";
import { fetchDataRaw, fetchMetaRaw, META_TAG } from "./api";

function buildLines(data: ApiData, meta: ApiMeta): Record<string, Line> {
  const lines: Record<string, Line> = {};
  for (const [id, l] of Object.entries(data.lines)) {
    const last = l.stars[l.stars.length - 1];
    const passive = typeof l.passive === "string" ? l.passive : (l.passive?.en ?? null);
    lines[id] = {
      id,
      cost: l.c,
      types: l.t,
      range: l.range ?? null,
      names: l.stars.map((s) => s.name),
      dex: l.stars.map((s) => s.dex),
      move: last ? { name: last.move.name.en, type: last.move.type, text: last.move.text.en } : null,
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

function buildItems(data: ApiData): Record<string, Item> {
  return Object.fromEntries(
    Object.entries(data.items).map(([id, i]) => [
      id,
      { id, name: i.en, kind: i.k, stat: i.stat ?? null, recipe: i.recipe ?? null, text: i.text.en, short: i.short?.en ?? null },
    ]),
  );
}

function buildTraits(data: ApiData): Record<string, Trait> {
  return Object.fromEntries(
    Object.entries(data.traits).map(([id, t]) => [id, { id, name: t.en, thresholds: t.th, values: t.values, desc: t.desc.en }]),
  );
}

function buildSeals(data: ApiData): Seal[] {
  return Object.entries(data.seals ?? {}).map(([id, s]) => ({
    id,
    code: s.code ?? "",
    rarity: s.rarity,
    cat: s.cat ?? "",
    rounds: s.rounds ?? [],
    hero: s.hero ?? null,
    name: s.name.en,
    text: s.text.map((t) => ({ round: t.round ?? "", line: t.line?.en ?? "", detail: t.detail?.en ?? null })),
  }));
}

function buildComps(meta: ApiMeta, lines: Record<string, Line>, items: Record<string, Item>, traits: Record<string, Trait>): Comp[] {
  const typical = buildTypicalCells(meta.comps);
  const ranges = Object.fromEntries(Object.values(lines).map((l) => [l.id, l.range]));
  const name = (line: string) => lines[line]?.names.at(-1) ?? line;
  return meta.comps.map((c) => {
    const coreOnly = c.units.some((u) => u.share == null);
    const { roles } = coreOnly ? { roles: {} as Record<string, never> } : assignRoles(c.units, items);
    const keyItems = coreOnly
      ? []
      : c.units
          .flatMap((u) => u.items.map((i) => ({ id: i.id, line: u.line, star: u.star, share: i.share, w: i.share * ((u.share ?? 0) / 100) })))
          .sort((a, b) => b.w - a.w)
          .slice(0, 3)
          .map((k) => ({ id: k.id, line: k.line, star: k.star, share: k.share }));
    let prev = new Set<string>();
    const guide = c.guide
      ? {
          stages: c.guide.stages.map((s) => {
            const units = s.units.map((u) => ({ ...u, fresh: prev.size > 0 && !prev.has(u.line) }));
            prev = new Set(s.units.map((u) => u.line));
            const level = (s.levels ?? []).reduce<{ level: number; share: number } | null>((best, l) => (!best || l.share > best.share ? l : best), null)?.level ?? null;
            return { stage: s.stage, n: s.n, level, units };
          }),
        }
      : null;
    return {
      id: c.id,
      slug: compSlug(c.id),
      title: `${traits[c.name.trait]?.name ?? c.name.trait} · ${c.name.units.map(name).join(" & ")}`,
      nameTrait: c.name.trait,
      nameUnits: c.name.units,
      tier: compTier(c.avg, c.ic, meta.ref),
      apiTier: c.tier,
      score: compScore(c.avg, c.ic),
      coreOnly,
      reliable: c.ne >= MIN_NE && !coreOnly,
      avg: c.avg,
      ic: c.ic,
      top4: c.top4,
      win: c.win,
      use: c.use,
      n: c.n,
      ne: c.ne,
      onlyRules: c.onlyRules,
      units: c.units.map((u) => ({ ...u, role: coreOnly ? null : (roles[u.line] ?? null) })),
      traits: c.traits,
      keyItems,
      placement: coreOnly ? null : bestSetup(c.units, c.placement, typical, Object.entries(roles).find(([, r]) => r === "carry")?.[0] ?? null, ranges),
      guide,
      variants: c.variants ?? [],
    };
  });
}

/** The whole normalised model, built once per revalidation window and shared by every page. */
export async function getMeta(): Promise<Meta> {
  "use cache";
  cacheTag(META_TAG);
  const [m, d] = await Promise.all([fetchMetaRaw(), fetchDataRaw()]);
  const meta = m.value, data = d.value;
  const fromSnapshot = m.source === "snapshot" || d.source === "snapshot";
  cacheLife(fromSnapshot ? { stale: 60, revalidate: 300, expire: 3600 } : { stale: 3600, revalidate: 3600, expire: 60 * 60 * 24 * 3 });
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

export const bestComps = (m: Meta, pred: (c: Comp) => boolean, n = 5) =>
  m.comps
    .filter((c) => c.reliable && pred(c))
    .sort((a, b) => a.score - b.score)
    .slice(0, n);

/** A unit's weight at the end of a stage across reliable comps with a guide: presence, quality of the comps it leads to, and whether it stays. */
export interface StagePick {
  line: string;
  /** average share of boards that field it at the end of the stage, weighted by games */
  presence: number;
  /** games-weighted average of the final comps' avg + CI */
  score: number;
  /** of the comps where it is on the stage board, the share where it is still on the final board */
  keep: number;
  comps: number;
}
export function stageRanking(m: Meta, stage: 3 | 4): StagePick[] {
  const acc: Record<string, { w: number; pres: number; score: number; keep: number; comps: number }> = {};
  const guided = m.comps.filter((c) => c.reliable && c.guide);
  let totalW = 0;
  for (const c of guided) {
    const st = c.guide!.stages.find((s) => s.stage === stage);
    if (!st) continue;
    const w = c.n;
    totalW += w;
    for (const u of st.units) {
      if (u.share < 20) continue;
      const a = (acc[u.line] ??= { w: 0, pres: 0, score: 0, keep: 0, comps: 0 });
      a.w += w;
      a.pres += (u.share / 100) * w;
      a.score += c.score * w;
      a.keep += (c.units.some((f) => f.line === u.line && (f.share ?? 0) >= 50) ? 1 : 0) * w;
      a.comps += 1;
    }
  }
  return Object.entries(acc)
    .map(([line, a]) => ({ line, presence: (a.pres / (totalW || 1)) * 100, score: a.score / a.w, keep: (a.keep / a.w) * 100, comps: a.comps }))
    .sort((x, y) => y.presence - x.presence);
}
/** Final comps whose end-of-stage board usually fields this line. */
export const compsStartingWith = (m: Meta, line: string, stage: 3 | 4 = 3) =>
  m.comps.filter((c) => c.reliable && c.guide?.stages.some((s) => s.stage === stage && s.units.some((u) => u.line === line && u.share >= 40)));

/** Share of a unit's item slots per item, across reliable comps (weighted by games). */
export function itemsOnLine(m: Meta, line: string) {
  const acc: Record<string, number> = {};
  for (const c of m.comps) {
    if (!c.reliable) continue;
    for (const u of c.units) if (u.line === line) for (const i of u.items) acc[i.id] = (acc[i.id] ?? 0) + i.share * c.n;
  }
  const total = Object.values(acc).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, w]) => ({ id, share: (w / total) * 100 }));
}
