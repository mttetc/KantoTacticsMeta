import type { Comp } from "./types";

export interface PathUnit {
  line: string;
  star: number | null;
  share: number;
  /** on the next step's board too */
  kept: boolean;
  /** not on the previous step's board */
  fresh: boolean;
}
export interface PathStep {
  key: "early" | "mid" | "final";
  label: string;
  sub: string;
  level: number | null;
  n: number;
  units: PathUnit[];
}

const ON_BOARD = 40; // a unit "is on the board" of a step when it is there in 40 %+ of the games

/**
 * The game plan of a comp, TFT-site style: what the players who end on this comp had at the end of stage 3
 * (early), stage 4 (mid) and at the end (final), with what they kept and what they sold between steps.
 */
export function compPath(c: Comp): PathStep[] | null {
  if (!c.guide || c.coreOnly) return null;
  const finalUnits = c.units.filter((u) => (u.share ?? 0) >= ON_BOARD).map((u) => ({ line: u.line, star: u.star, share: u.share ?? 0 }));
  const raw: { key: PathStep["key"]; label: string; sub: string; level: number | null; n: number; units: { line: string; star: number | null; share: number }[] }[] = [];
  for (const s of c.guide.stages) {
    const units = s.units.filter((u) => u.share >= ON_BOARD * 0.75).map((u) => ({ line: u.line, star: u.star, share: u.share }));
    if (s.stage === 3) raw.push({ key: "early", label: "Early", sub: "end of stage 3", level: s.level, n: s.n, units });
    if (s.stage === 4) raw.push({ key: "mid", label: "Mid", sub: "end of stage 4", level: s.level, n: s.n, units });
  }
  raw.push({ key: "final", label: "Final", sub: "end of the game", level: null, n: c.n, units: finalUnits });
  return raw.map((step, i) => {
    const prev = raw[i - 1];
    const next = raw[i + 1];
    return {
      ...step,
      units: step.units
        .sort((a, b) => b.share - a.share)
        .map((u) => ({ ...u, kept: next ? next.units.some((x) => x.line === u.line) : true, fresh: prev ? !prev.units.some((x) => x.line === u.line) : false })),
    };
  });
}
