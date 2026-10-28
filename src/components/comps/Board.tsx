import { useTranslations } from "next-intl";
import { ui } from "@/components/ui/styles";
import { int, pct } from "@/lib/format";
import { BOARD, hexCenter, hexPoints } from "@/lib/placement";
import type { Comp, Meta } from "@/lib/types";
import { unitDex, unitName } from "@/server/meta";

/** Your side of the hex board (7 × 4), same geometry as the game. Gold hex = the carry. */
export function Board({ meta, comp }: { meta: Meta; comp: Comp }) {
  const t = useTranslations("comp.board");
  const p = comp.placement;
  if (!p) return null;
  const carry = comp.units.find((u) => u.role === "carry")?.line;
  const byCell = new Map(p.cells.map((c) => [c.cell, c]));
  const typicalCount = p.cells.filter((c) => c.typical).length;
  const cells = Array.from({ length: BOARD.cols * BOARD.rows }, (_, i) => i);
  return (
    <div className={ui.sec}>
      <h2 className={ui.secTitle}>
        {t("title")}
        <small>{p.typical ? t("typical") : t("from", { n: int(p.n) })}</small>
      </h2>
      <div className="mx-auto max-w-[440px] text-center">
        <svg viewBox={`0 0 ${BOARD.width} ${BOARD.height}`} role="img" aria-label={t("label")} className="block h-auto w-full [&_text]:fill-white [&_text]:font-ui [&_text]:text-[10px] [&_text]:font-bold [&_text]:[paint-order:stroke] [&_text]:[stroke:var(--color-ink)] [&_text]:[stroke-width:3px]">
          {cells.map((cell) => {
            const { cx, cy } = hexCenter(cell);
            const c = byCell.get(cell);
            const pts = hexPoints(cx, cy);
            if (!c) return <polygon key={cell} points={pts} className="fill-black/25 stroke-line stroke-[1.5]" />;
            const dex = unitDex(meta, c.line, c.star);
            const op = c.typical ? 0.55 : 0.5 + Math.min(1, c.share! / 60) * 0.5;
            return (
              <g key={cell}>
                {/* on the group (the HTML parser drops children of <image>) and as one string: React's server renderer
                    leaves an SVG <title> empty when its children are several nodes, which broke hydration */}
                <title>{`${unitName(meta, c.line, c.star)} · ${c.typical ? t("hexUsual") : t("hexShare", { pct: pct(c.share) })}`}</title>
                <polygon points={pts} className={`stroke-[1.5] ${c.line === carry ? "fill-[#ffd43b2e] stroke-gold" : c.typical ? "fill-[#5f86ef1a] stroke-cobalt/60 [stroke-dasharray:4_3]" : "fill-[#5f86ef2e] stroke-cobalt"}`} />
                {dex && <image href={`/thumb/${dex}.webp`} x={cx - 18} y={(cy - 24).toFixed(1)} width={36} height={36} opacity={op.toFixed(2)} className="[image-rendering:pixelated]" />}
                <text x={cx} y={(cy + 22).toFixed(1)} textAnchor="middle">
                  {c.typical ? "~" : `${Math.round(c.share!)} %`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className={ui.note}>
        {t("note")}
        {typicalCount > 0 && <> {t("typicalNote", { n: p.typical ? 0 : typicalCount })}</>}
      </p>
    </div>
  );
}
