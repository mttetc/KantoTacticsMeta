import { int, pct } from "@/lib/format";
import { BOARD, hexCenter, hexPoints } from "@/lib/placement";
import type { Comp, Meta } from "@/lib/types";
import { unitDex, unitName } from "@/server/meta";
import s from "./comps.module.css";

/** Your side of the hex board (7 × 4), same geometry as the game. Gold hex = the carry. */
export function Board({ meta, comp }: { meta: Meta; comp: Comp }) {
  const p = comp.placement;
  if (!p) return null;
  const carry = comp.units.find((u) => u.role === "carry")?.line;
  const byCell = new Map<number, (typeof p.cells)[number]>();
  for (const c of p.cells) {
    const prev = byCell.get(c.cell);
    if (!prev || (prev.share ?? 0) < (c.share ?? 0)) byCell.set(c.cell, c);
  }
  const cells = Array.from({ length: BOARD.cols * BOARD.rows }, (_, i) => i);
  return (
    <div className="sec">
      <h2>
        Placement<small>{p.typical ? "typical, from other comps" : `${int(p.n)} real boards`}</small>
      </h2>
      <div className={s.board}>
        <div className={s.rival}>
          ▲ Enemy · <span>front line</span>
        </div>
        <svg viewBox={`0 0 ${BOARD.width} ${BOARD.height}`} role="img" aria-label="Placement on your side of the board">
          {cells.map((cell) => {
            const { cx, cy } = hexCenter(cell);
            const c = byCell.get(cell);
            const pts = hexPoints(cx, cy);
            if (!c) return <polygon key={cell} points={pts} />;
            const dex = unitDex(meta, c.line, c.star);
            const op = c.share == null ? 0.9 : 0.35 + Math.min(1, c.share / 70) * 0.65;
            return (
              <g key={cell}>
                <polygon points={pts} className={c.line === carry ? s.carry : s.on} />
                {dex && (
                  <image href={`/thumb/${dex}.webp`} x={cx - 18} y={(cy - 24).toFixed(1)} width={36} height={36} opacity={op.toFixed(2)} style={{ imageRendering: "pixelated" }}>
                    <title>
                      {unitName(meta, c.line, c.star)}
                      {c.share == null ? "" : ` · ${pct(c.share)}`}
                    </title>
                  </image>
                )}
                {c.share != null && (
                  <text x={cx} y={(cy + 22).toFixed(1)} textAnchor="middle">
                    {Math.round(c.share)} %
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="note">
        {p.typical
          ? "The API only publishes a board for comps with 50+ boards. This one shows where each of these units usually stands in the comps that do have one (most common hex, no collisions)."
          : "Where players put their units on their last board. Share = % of this comp's games with that unit on that hex."}{" "}
        Gold hex = the carry.
      </p>
    </div>
  );
}
