import type { ApiComp, Comp } from "./types";

/**
 * Where each unit usually stands, aggregated over every comp that has a board.
 * Used as a fallback for comps the API gives no board for (fewer than 50 boards).
 */
export function buildTypicalCells(comps: ApiComp[]): Record<string, number[]> {
  const acc: Record<string, Record<number, number>> = {};
  for (const c of comps) {
    if (!c.placement) continue;
    for (const x of c.placement.cells) {
      (acc[x.line] ??= {})[x.cell] = (acc[x.line][x.cell] ?? 0) + x.share * c.placement.n;
    }
  }
  return Object.fromEntries(
    Object.entries(acc).map(([line, m]) => [
      line,
      Object.entries(m)
        .sort((a, b) => b[1] - a[1])
        .map(([cell]) => Number(cell)),
    ]),
  );
}

export function typicalPlacement(units: ApiComp["units"], typical: Record<string, number[]>): Comp["placement"] {
  const taken = new Set<number>();
  const cells: NonNullable<Comp["placement"]>["cells"] = [];
  for (const u of [...units].sort((a, b) => (b.share ?? 0) - (a.share ?? 0))) {
    const cell = typical[u.line]?.find((x) => !taken.has(x));
    if (cell == null) continue;
    taken.add(cell);
    cells.push({ cell, line: u.line, star: u.star, share: null });
  }
  return cells.length ? { n: 0, typical: true, cells } : null;
}

/** 7 columns × 4 rows, cell = row*7 + col, row 0 = front line. Odd rows shift half a hex right (same geometry as the game). */
export const BOARD = { cols: 7, rows: 4, w: 52, h: 45.07, R: 30, r: 26, width: 424, height: 203 };

export function hexCenter(cell: number) {
  const row = Math.floor(cell / BOARD.cols);
  const col = cell % BOARD.cols;
  return { cx: 30 + col * BOARD.w + (row % 2) * BOARD.r, cy: 34 + row * BOARD.h };
}

export function hexPoints(cx: number, cy: number): string {
  const { R, r } = BOARD;
  return [
    [cx, cy - R],
    [cx + r, cy - 15],
    [cx + r, cy + 15],
    [cx, cy + R],
    [cx - r, cy + 15],
    [cx - r, cy - 15],
  ]
    .map((p) => p.map((v) => v.toFixed(1)).join(","))
    .join(" ");
}
