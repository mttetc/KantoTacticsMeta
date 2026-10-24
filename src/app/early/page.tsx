import type { Metadata } from "next";
import Link from "next/link";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { Sprite } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { fmt2, int } from "@/lib/format";
import { getMeta, lineDex, lineName, stageRanking, type StagePick } from "@/server/meta";

export const metadata: Metadata = {
  title: "Early and mid game",
  description: "Which Pokémon to field early and mid game in Kanto Tactics Ranked: presence at the end of stages 3 and 4 in the comps that finish well, and whether they stay until the end.",
  alternates: { canonical: "/early" },
};

/** Static: aggregated from the comps' stage guides, refreshed with the Meta. */
export default async function EarlyPage() {
  const meta = await getMeta();
  const guided = meta.comps.filter((c) => c.reliable && c.guide).length;
  return (
    <>
      <PanelHead subtitle="Early and mid game · what the good comps field before the end" />
      <PanelBody>
        <p className={`${ui.note} mt-0 mb-3 text-[.9em]`}>
          The API only scores the end of the game, so there is no &ldquo;best early comp&rdquo;. What it does publish is the board of the players who finished on a good comp at the end of stages 3 and 4 ({guided} reliable comps). Below: the units they fielded,
          how good the comps they lead to are, and whether the unit stays until the end or gets sold. Click a unit for the final comps that start with it.
        </p>
        <div className="grid gap-3 xl:grid-cols-2">
          <StageTable title="Early picks" sub="end of stage 3" picks={stageRanking(meta, 3)} stage={3} meta={meta} />
          <StageTable title="Mid picks" sub="end of stage 4" picks={stageRanking(meta, 4)} stage={4} meta={meta} />
        </div>
      </PanelBody>
    </>
  );
}

function StageTable({ title, sub, picks, stage, meta }: { title: string; sub: string; picks: StagePick[]; stage: 3 | 4; meta: Awaited<ReturnType<typeof getMeta>> }) {
  return (
    <div className={ui.sec}>
      <h2 className={ui.secTitle}>
        {title}
        <small>{sub}</small>
      </h2>
      <div className={`${ui.table} border-0 bg-none shadow-none`}>
        <table>
          <thead>
            <tr>
              <th>Pokémon</th>
              <th className="text-right!">On boards</th>
              <th className="text-right!">Comps avg + CI</th>
              <th className="text-right!">Kept to the end</th>
            </tr>
          </thead>
          <tbody>
            {picks.slice(0, 25).map((p) => (
              <tr key={p.line} className="hover:bg-white/3">
                <td>
                  <Link href={`/comps?from=${p.line}&stage=${stage}`} className="group inline-flex items-center gap-2 text-txt no-underline" title={`Final comps whose stage ${stage} board fields ${lineName(meta, p.line)}`}>
                    <Sprite dex={lineDex(meta, p.line)} name={lineName(meta, p.line)} cost={meta.lines[p.line]?.cost} size={36} anim={false} />
                    <span className="font-semibold">{lineName(meta, p.line)}</span>
                    <small className="text-dim">{int(p.comps)} comps</small>
                  </Link>
                </td>
                <td className="text-right tabular-nums">
                  <b>{Math.round(p.presence)} %</b>
                </td>
                <td className="text-right tabular-nums">{fmt2(p.score)}</td>
                <td className="text-right tabular-nums">
                  <span className={p.keep >= 70 ? "text-[#8ce99a]" : p.keep <= 30 ? "text-[#ff8787]" : ""}>{Math.round(p.keep)} %</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={ui.note}>
        On boards = share of the good comps&apos; games that field it at that point, weighted by games. Comps avg + CI = how well the comps it leads to finish (lower is better). Kept = how often it is still on the final board; red means a transition unit you usually sell.
      </p>
    </div>
  );
}
