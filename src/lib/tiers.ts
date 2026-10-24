import type { ApiTier, Tier } from "./types";

export const TIERS: Tier[] = ["S", "A", "B", "C", "D"];

/** The API stops at C. D mirrors S on the other side of the reference place. */
export const D_GAP = 0.5;

/**
 * Comps are graded stricter than the game: on the pessimistic average (avg + 95 % CI)
 * against the reference place, so a noisy sample cannot be S.
 */
export const COMP_THRESHOLDS: Record<Exclude<Tier, "D">, number> = { S: -0.8, A: -0.15, B: 0.6, C: 1.2 };

/** Below this many effective games the API gives only the 4-unit core: no stars, no shares, global items. */
export const MIN_NE = 30;

export function entityTier(apiTier: ApiTier, avg: number, ref: number): Tier {
  return apiTier === "C" && avg >= ref + D_GAP ? "D" : apiTier;
}

export function compScore(avg: number, ic: number): number {
  return avg + (ic || 0);
}

export function compTier(avg: number, ic: number, ref: number): Tier {
  const d = compScore(avg, ic) - ref;
  if (d <= COMP_THRESHOLDS.S) return "S";
  if (d <= COMP_THRESHOLDS.A) return "A";
  if (d <= COMP_THRESHOLDS.B) return "B";
  if (d <= COMP_THRESHOLDS.C) return "C";
  return "D";
}

export const TIER_HELP: Record<Tier, string> = {
  S: "well below the reference place",
  A: "below the reference",
  B: "around the reference",
  C: "above the reference",
  D: "well above the reference",
};
