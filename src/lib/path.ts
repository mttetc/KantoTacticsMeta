import type { Comp, Line } from "./types";

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
  key: "opener" | "early" | "mid" | "final";
  /** Key of the following step, for "not on the X board any more". */
  next: PathStep["key"] | null;
  label: string;
  sub: string;
  level: number | null;
  n: number;
  units: PathUnit[];
}

const ON_BOARD = 40; // a unit "is on the board" of a step when it is there in 40 %+ of the games
/** The opener is made of the cheap units: 1 and 2 costs are what the shop offers in stages 1 and 2. */
export const OPENER_MAX_COST = 2;
const OPENER_SHARE = 20;
const OPENER_MAX = 7;

/**
 * The game plan of a comp, TFT-site style. The API only publishes the boards at the end of stages 3 and 4,
 * when players are already level 7 or 8, so the opener (stages 1 and 2) is read from the stage 3 board: the
 * 1 and 2 costs those players were still holding. Then stage 3 (early), stage 4 (mid) and the final board,
 * with what was kept and what was sold between steps.
 */
export function compPath(c: Comp, lines: Record<string, Line>): PathStep[] | null {
  if (!c.guide || c.coreOnly) return null;
  const cost = (line: string) => lines[line]?.cost ?? null;
  const finalUnits = c.units.filter((u) => (u.share ?? 0) >= ON_BOARD).map((u) => ({ line: u.line, star: u.star, share: u.share ?? 0 }));
  const raw: { key: PathStep["key"]; label: string; sub: string; level: number | null; n: number; units: { line: string; star: number | null; share: number }[] }[] = [];
  for (const s of c.guide.stages) {
    const units = s.units.filter((u) => u.share >= ON_BOARD * 0.75).map((u) => ({ line: u.line, star: u.star, share: u.share }));
    if (s.stage === 3) {
      const cheap = s.units
        .filter((u) => u.share >= OPENER_SHARE && (cost(u.line) ?? 9) <= OPENER_MAX_COST)
        .sort((a, b) => b.share - a.share)
        .slice(0, OPENER_MAX)
        .map((u) => ({ line: u.line, star: u.star, share: u.share }));
      if (cheap.length) raw.push({ key: "opener", label: "Opener", sub: "stages 1–2 · 1 and 2 costs", level: null, n: s.n, units: cheap });
      raw.push({ key: "early", label: "Stage 3", sub: "end of stage 3", level: s.level, n: s.n, units });
    }
    if (s.stage === 4) raw.push({ key: "mid", label: "Stage 4", sub: "end of stage 4", level: s.level, n: s.n, units });
  }
  raw.push({ key: "final", label: "Final", sub: "end of the game", level: null, n: c.n, units: finalUnits });
  return raw.map((step, i): PathStep => {
    const prev = raw[i - 1];
    const next = raw[i + 1];
    return {
      ...step,
      next: next?.key ?? null,
      units: step.units
        .sort((a, b) => b.share - a.share)
        // the opener is read from the stage 3 board itself, so by construction all of it is still there at stage 3
        .map((u) => ({ ...u, kept: step.key === "opener" || !next || next.units.some((x) => x.line === u.line), fresh: prev ? !prev.units.some((x) => x.line === u.line) : false })),
    };
  });
}

export interface Tempo {
  kind: "reroll" | "fast";
  /** most common level at the end of stage 3 and 4 */
  lv3: number | null;
  lv4: number | null;
  /** the units to roll for: 3★ or cheap 2★ for a reroll comp, the carry otherwise */
  targets: string[];
}

/** Players sitting at level 6 or lower at the end of stage 3 are rolling for stars; the rest level first and roll at 7–8. */
export function compTempo(c: Comp, lines: Record<string, Line>): Tempo | null {
  if (!c.guide || c.coreOnly) return null;
  const lv3 = c.guide.stages.find((s) => s.stage === 3)?.level ?? null;
  const lv4 = c.guide.stages.find((s) => s.stage === 4)?.level ?? null;
  if (lv3 == null && lv4 == null) return null;
  const kind = lv3 != null && lv3 <= 6 ? "reroll" : "fast";
  const byShare = [...c.units].sort((a, b) => (b.share ?? 0) - (a.share ?? 0));
  const targets =
    kind === "reroll"
      ? byShare.filter((u) => (u.star ?? 1) >= 3 || ((u.star ?? 1) >= 2 && (lines[u.line]?.cost ?? 9) <= 2)).slice(0, 3)
      : byShare.filter((u) => u.role === "carry" || u.role === "sub").slice(0, 2);
  return { kind, lv3, lv4, targets: targets.map((u) => u.line) };
}
