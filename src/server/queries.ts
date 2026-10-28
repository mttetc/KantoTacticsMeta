import "server-only";
import { CORE_SHARE, STAGE_PRESENCE_MIN, TRAIT_SHARE } from "@/lib/constants";
import { OPENER_MAX_COST } from "@/lib/path";
import type { Comp, Meta, Tier } from "@/lib/types";

/** Read-only questions over the model, shared by the pages: best comps, stage rankings, type pairs, items per unit. */

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
/** "opener" = the 1 and 2 costs on the stage 3 boards: what to pick up in stages 1 and 2. */
export type RankStage = "opener" | 3 | 4 | "final";
export function stageRanking(m: Meta, stage: RankStage): StagePick[] {
  const acc: Record<string, { w: number; pres: number; score: number; keep: number; comps: number }> = {};
  const guided = m.comps.filter((c) => c.reliable && c.guide);
  let totalW = 0;
  for (const c of guided) {
    const stage3 = c.guide!.stages.find((s) => s.stage === 3)?.units;
    const units =
      stage === "final"
        ? c.units.map((u) => ({ line: u.line, share: u.share ?? 0 }))
        : stage === "opener"
          ? stage3?.filter((u) => (m.lines[u.line]?.cost ?? 9) <= OPENER_MAX_COST)
          : c.guide!.stages.find((s) => s.stage === stage)?.units;
    if (!units) continue;
    const w = c.n;
    totalW += w;
    for (const u of units) {
      if (u.share < STAGE_PRESENCE_MIN) continue;
      const a = (acc[u.line] ??= { w: 0, pres: 0, score: 0, keep: 0, comps: 0 });
      a.w += w;
      a.pres += (u.share / 100) * w;
      a.score += c.score * w;
      a.keep += (c.units.some((f) => f.line === u.line && (f.share ?? 0) >= CORE_SHARE) ? 1 : 0) * w;
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

/** Two types active together in the good comps: how often, how well those comps finish, and the best of them. */
export interface TraitPair {
  a: string;
  b: string;
  /** games of the reliable comps that run both */
  games: number;
  comps: number;
  /** games-weighted avg + CI of those comps (lower is better) */
  score: number;
  bestSlug: string;
  bestTier: Tier;
}
export function traitPairs(m: Meta, max = 30): TraitPair[] {
  const acc = new Map<string, { a: string; b: string; games: number; comps: number; score: number; best: Comp }>();
  for (const c of m.comps) {
    if (!c.reliable) continue;
    const types = [...new Set(c.traits.filter((t) => (t.share ?? 100) >= TRAIT_SHARE).map((t) => t.type))].sort();
    for (let i = 0; i < types.length; i++)
      for (let j = i + 1; j < types.length; j++) {
        const key = `${types[i]}+${types[j]}`;
        const e = acc.get(key) ?? { a: types[i], b: types[j], games: 0, comps: 0, score: 0, best: c };
        e.games += c.n;
        e.comps += 1;
        e.score += c.score * c.n;
        if (c.score < e.best.score) e.best = c;
        acc.set(key, e);
      }
  }
  return [...acc.values()]
    .map((e) => ({ a: e.a, b: e.b, games: e.games, comps: e.comps, score: e.score / e.games, bestSlug: e.best.slug, bestTier: e.best.tier }))
    .sort((x, y) => y.games - x.games)
    .slice(0, max);
}

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
