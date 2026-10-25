import { describe, expect, it } from "vitest";
import { compFamily, compVersions, groupVariants } from "./comp-family";
import type { Comp } from "./types";

const comp = (id: string, family: string, score: number) => ({ id, family, score }) as Comp;

describe("comp families", () => {
  it("keys a family regardless of unit order", () => {
    expect(compFamily("psychic", ["mewtwo", "staryu"])).toBe(compFamily("psychic", ["staryu", "mewtwo"]));
    expect(compFamily("psychic", ["mewtwo", "staryu"])).not.toBe(compFamily("water", ["mewtwo", "staryu"]));
  });

  it("keeps the first of each family in list order and counts the rest", () => {
    const list = [comp("a", "f1", 1), comp("b", "f2", 2), comp("c", "f1", 3), comp("d", "f1", 4), comp("e", "f3", 5)];
    expect(groupVariants(list).map((g) => [g.comp.id, g.variants])).toEqual([
      ["a", 2],
      ["b", 0],
      ["e", 0],
    ]);
  });

  it("lists a comp's versions best first", () => {
    const all = [comp("a", "f1", 2.5), comp("b", "f2", 1), comp("c", "f1", 1.5)];
    expect(compVersions(all, all[0]).map((c) => c.id)).toEqual(["c", "a"]);
  });
});
