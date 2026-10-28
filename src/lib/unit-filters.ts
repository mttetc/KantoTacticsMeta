import type { Tier } from "./types";

/** The Pokémon tier list's filters: plain module shared by the page (rows) and the client list (state). */

/** What the server hands the client: one flat, serialisable row per Pokémon line. */
export interface UnitRow {
  line: string;
  name: string;
  allNames: string[];
  dex: number | null;
  cost: number | null;
  types: string[];
  typeNames: string[];
  tier: Tier;
  avg: number;
  use: number;
}

export const UNIT_SORTS = { avg: "Best place", use: "Most played" } as const;
export type UnitSort = keyof typeof UNIT_SORTS;
export const DEFAULT_UNIT_SORT: UnitSort = "avg";
export const parseUnitSort = (s: string | undefined): UnitSort => (s && s in UNIT_SORTS ? (s as UnitSort) : DEFAULT_UNIT_SORT);

export interface UnitFilters {
  sort: UnitSort;
  cost: number;
  type: string;
  q: string;
}
export const DEFAULT_UNIT_FILTERS: UnitFilters = { sort: DEFAULT_UNIT_SORT, cost: 0, type: "", q: "" };
/** The URL's query string, as read in the browser after hydration. */
export const unitFiltersFromParams = (p: URLSearchParams): UnitFilters => ({ sort: parseUnitSort(p.get("sort") ?? undefined), cost: Number(p.get("cost")) || 0, type: p.get("type") ?? "", q: p.get("q") ?? "" });
export const compareUnits: Record<UnitSort, (a: UnitRow, b: UnitRow) => number> = { avg: (a, b) => a.avg - b.avg, use: (a, b) => b.use - a.use };
