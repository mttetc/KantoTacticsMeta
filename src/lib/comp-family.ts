import type { Comp } from "./types";

/**
 * Comps with the same title ("Psychic · Mewtwo & Starmie") are versions of one comp that differ by a unit or two.
 * The list shows each family once, by its best version; the comp page links the other versions.
 */

export const compFamily = (trait: string, units: string[]) => `${trait}:${[...units].sort().join("+")}`;

export interface CompGroup {
  comp: Comp;
  /** other versions of this comp further down the same list */
  variants: number;
}

/** Keeps the first comp of each family in list order, counting the versions it hides. */
export function groupVariants(list: Comp[]): CompGroup[] {
  const groups: CompGroup[] = [];
  const seen = new Map<string, CompGroup>();
  for (const comp of list) {
    const g = seen.get(comp.family);
    if (g) g.variants += 1;
    else {
      const fresh = { comp, variants: 0 };
      seen.set(comp.family, fresh);
      groups.push(fresh);
    }
  }
  return groups;
}

/** Every version of a comp, best first, the comp itself included. */
export const compVersions = (comps: Comp[], comp: Comp) => comps.filter((c) => c.family === comp.family).sort((a, b) => a.score - b.score);
