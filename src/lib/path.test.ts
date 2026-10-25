import { describe, expect, it } from "vitest";
import { compPath } from "./path";
import type { Comp, Line } from "./types";

const line = (id: string, cost: number): Line => ({ id, cost, types: [], range: null, names: [id], dex: [], move: null, passive: null, fromChangelog: false });
const lines = Object.fromEntries([line("abra", 2), line("voltorb", 2), line("electabuzz", 3), line("staryu", 4), line("mewtwo", 5), line("dratini", 4)].map((l) => [l.id, l]));
const u = (l: string, share: number, star = 1) => ({ line: l, star, share });
const comp = {
  n: 390,
  coreOnly: false,
  units: [u("electabuzz", 83, 2), u("staryu", 94, 2), u("mewtwo", 93, 2), u("voltorb", 40, 2)].map((x) => ({ ...x, items: [], role: null })),
  guide: {
    stages: [
      { stage: 3, n: 113, level: 8, units: [u("electabuzz", 68), u("staryu", 58), u("abra", 46), u("voltorb", 41), u("dratini", 30), u("mewtwo", 30)].map((x) => ({ ...x, fresh: false })) },
      { stage: 4, n: 109, level: 8, units: [u("staryu", 96, 2), u("electabuzz", 89, 2), u("mewtwo", 88), u("voltorb", 38, 2)].map((x) => ({ ...x, fresh: false })) },
    ],
  },
} as unknown as Comp;

describe("compPath", () => {
  it("opens with the 1 and 2 costs of the stage 3 board, then stage 3, stage 4 and the final board", () => {
    const steps = compPath(comp, lines)!;
    expect(steps.map((s) => s.key)).toEqual(["opener", "early", "mid", "final"]);
    expect(steps[0].units.map((x) => x.line)).toEqual(["abra", "voltorb"]);
    expect(steps[0].level).toBeNull();
    expect(steps[1].units.map((x) => x.line)).toEqual(["electabuzz", "staryu", "abra", "voltorb", "dratini", "mewtwo"]);
  });
  it("marks what is sold before the next step and what is new", () => {
    const steps = compPath(comp, lines)!;
    const early = Object.fromEntries(steps[1].units.map((x) => [x.line, x]));
    expect(early.abra.kept).toBe(false);
    expect(early.voltorb.kept).toBe(true);
    expect(steps[2].units.find((x) => x.line === "voltorb")?.fresh).toBe(false);
    expect(steps[3].units.every((x) => x.kept)).toBe(true);
  });
  it("skips the opener when no cheap unit is held", () => {
    const noCheap = { ...comp, guide: { stages: [{ ...comp.guide!.stages[0], units: comp.guide!.stages[0].units.filter((x) => !["abra", "voltorb"].includes(x.line)) }, comp.guide!.stages[1]] } } as Comp;
    expect(compPath(noCheap, lines)!.map((s) => s.key)).toEqual(["early", "mid", "final"]);
  });
});
