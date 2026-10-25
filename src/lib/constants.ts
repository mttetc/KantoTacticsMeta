/** Game and site constants shared by the model and the pages. */

/** Unit costs, in shop order. */
export const COSTS = [1, 2, 3, 4, 5] as const;
export type Cost = (typeof COSTS)[number];

/** A unit belongs to a comp's board when this share of its games field it. */
export const CORE_SHARE = 50;
/** A type counts as part of a comp when active in this share of its games. */
export const TRAIT_SHARE = 50;
/** Below this presence at a stage a unit is noise, not a pick. */
export const STAGE_PRESENCE_MIN = 20;

/** Rounds where seals are offered when the data file does not say. */
export const SEAL_ROUNDS = ["2-1", "3-2", "4-2"];

/** Public site URL (used by the workflow ping too). */
export const SITE_URL = "https://kanto-tactics-meta.vercel.app";
