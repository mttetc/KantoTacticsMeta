import { TIERS } from "./tiers";
import type { Comp, Tier } from "./types";

/** The comps list's URL filters: parsing, links and ordering, shared by the page and its search box. */

export const COMP_SORTS = { best: "Best", played: "Most played" } as const;
export type CompSort = keyof typeof COMP_SORTS;
export const COMPS_PAGE_SIZE = 40;

export interface CompFilters {
  sort: CompSort;
  tier: Tier | "all";
  /** include the comps under MIN_NE effective games */
  small: boolean;
  q: string;
  page: number;
  /** a line whose stage board the comps must field (from the game plan page) */
  from: string;
  stage: 3 | 4;
}
export type CompSearchParams = { sort?: string; tier?: string; small?: string; q?: string; page?: string; from?: string; stage?: string };

const DEFAULTS: CompFilters = { sort: "best", tier: "S", small: false, q: "", page: 1, from: "", stage: 3 };

export function parseCompFilters(sp: CompSearchParams): CompFilters {
  const from = sp.from ?? "";
  return {
    sort: sp.sort && sp.sort in COMP_SORTS ? (sp.sort as CompSort) : DEFAULTS.sort,
    // a "from" line looks across every tier
    tier: from ? "all" : sp.tier === "all" ? "all" : TIERS.includes(sp.tier as Tier) ? (sp.tier as Tier) : DEFAULTS.tier,
    small: sp.small === "1",
    q: (sp.q ?? "").trim().toLowerCase(),
    page: Math.max(1, Number(sp.page) || 1),
    from,
    stage: sp.stage === "4" ? 4 : 3,
  };
}

/** Query string of the non-default filters; a patch starts back at page 1 unless it sets the page itself. */
export function compParams(f: CompFilters, patch: Partial<CompFilters> = {}): URLSearchParams {
  const v = { ...f, page: 1, ...patch };
  const p = new URLSearchParams();
  if (v.sort !== DEFAULTS.sort) p.set("sort", v.sort);
  if (v.from) {
    p.set("from", v.from);
    p.set("stage", String(v.stage));
  } else if (v.tier !== DEFAULTS.tier) p.set("tier", v.tier);
  if (v.small) p.set("small", "1");
  if (v.q) p.set("q", v.q);
  if (v.page > 1) p.set("page", String(v.page));
  return p;
}
export const compsHref = (f: CompFilters, patch: Partial<CompFilters> = {}) => {
  const p = compParams(f, patch);
  return `/comps${p.size ? `?${p}` : ""}`;
};

/** "Best" is avg + CI, the same number as the tier, so a noisy comp never jumps above a steady one. */
export const compareComps: Record<CompSort, (a: Comp, b: Comp) => number> = {
  best: (a, b) => a.score - b.score,
  played: (a, b) => b.use - a.use || a.score - b.score,
};
