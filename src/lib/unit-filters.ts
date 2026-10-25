import type { Tier } from "./types";

/** The Pokémon tier list's filters: plain module, so the server can parse the URL and the client can own the state. */

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
export const compareUnits: Record<UnitSort, (a: UnitRow, b: UnitRow) => number> = { avg: (a, b) => a.avg - b.avg, use: (a, b) => b.use - a.use };
