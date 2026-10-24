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

/**
 * One setup for the whole final board: each unit once, on the hex it most often stands on in this comp's own
 * boards; units the comp has no hex for take their usual hex from every other comp (marked typical). Greedy,
 * most-played units first, so a popular unit never loses its hex to a filler.
 */
const COL_ORDER = [3, 2, 4, 1, 5, 0, 6]; // centre first
/** Rows to try when a unit has no data at all: ranged units go to the back, melee to the front. */
const rowsFor = (range: number | null) => (range != null && range >= 3 ? [3, 2, 1, 0] : range === 2 ? [1, 2, 0, 3] : [0, 1, 2, 3]);

export function bestSetup(units: ApiComp["units"], own: ApiComp["placement"] | undefined, typical: Record<string, number[]>, carry: string | null, ranges: Record<string, number | null> = {}): Comp["placement"] {
  const taken = new Set<number>();
  const cells: NonNullable<Comp["placement"]>["cells"] = [];
  const ownBy = new Map<string, { cell: number; share: number }[]>();
  for (const c of own?.cells ?? []) (ownBy.get(c.line) ?? ownBy.set(c.line, []).get(c.line)!).push({ cell: c.cell, share: c.share });
  for (const list of ownBy.values()) list.sort((a, b) => b.share - a.share);
  const board = units.filter((u) => (u.share ?? 0) >= 35 || u.share == null).sort((a, b) => (a.line === carry ? -1 : b.line === carry ? 1 : 0) || (b.share ?? 0) - (a.share ?? 0));
  for (const u of board) {
    const mine = (ownBy.get(u.line) ?? []).find((x) => !taken.has(x.cell));
    if (mine) {
      taken.add(mine.cell);
      cells.push({ cell: mine.cell, line: u.line, star: u.star, share: mine.share, typical: false });
      continue;
    }
    let cell = typical[u.line]?.find((x) => !taken.has(x));
    if (cell == null) {
      // no hex data anywhere for this unit: a free hex in the rows its range calls for, centre first
      outer: for (const row of rowsFor(ranges[u.line] ?? null)) for (const col of COL_ORDER) {
        const candidate = row * BOARD.cols + col;
        if (!taken.has(candidate)) { cell = candidate; break outer; }
      }
    }
    if (cell == null) continue;
    taken.add(cell);
    cells.push({ cell, line: u.line, star: u.star, share: null, typical: true });
  }
  return cells.length ? { n: own?.n ?? 0, typical: !own, cells } : null;
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
