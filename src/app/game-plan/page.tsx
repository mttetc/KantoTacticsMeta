import type { Metadata } from "next";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import type { StageRow } from "@/components/plan/StageTable";
import { StageTabs } from "@/components/plan/StageTabs";
import { ui } from "@/components/ui/styles";
import type { Meta } from "@/lib/types";
import { getMeta, lineDex, lineName } from "@/server/meta";
import { stageRanking, type RankStage } from "@/server/queries";

export const metadata: Metadata = {
  title: "Game plan",
  description: "Which Pokémon to field early, mid and late game in Kanto Tactics Ranked: presence at the end of stages 3 and 4 and on the final board of the comps that finish well, and whether they stay until the end.",
  alternates: { canonical: "/game-plan" },
};

const rows = (m: Meta, stage: RankStage): StageRow[] =>
  stageRanking(m, stage).map((p) => ({ line: p.line, name: lineName(m, p.line), dex: lineDex(m, p.line), cost: m.lines[p.line]?.cost ?? null, presence: p.presence, score: p.score, keep: p.keep, comps: p.comps }));

/** Static: aggregated from the comps' stage guides, refreshed with the Meta. */
export default async function GamePlanPage() {
  const meta = await getMeta();
  const guided = meta.comps.filter((c) => c.reliable && c.guide).length;
  return (
    <>
      <PanelHead title="Game plan" subtitle="what the good comps field at each point of the game" />
      <PanelBody>
        <p className={`${ui.note} mt-0 mb-3 text-[.9em]`}>
          The API only scores the end of the game, so there is no &ldquo;best early comp&rdquo;. What it does publish is the board of the players who finished on a good comp at the end of stages 3 and 4 ({guided} reliable comps), when they are already level 7 or 8.
          <b className="text-txt"> Opener</b> keeps only the 1 and 2 costs of those stage 3 boards: the units worth picking up in stages 1 and 2, and the comps they lead to. The other tabs show the whole board at each point and whether a unit stays until the end.
          Click a unit for the final comps that field it there; every comp page has its own Opener → Stage 3 → Stage 4 → Final plan.
        </p>
        <StageTabs
          panels={[
            { key: "opener", label: "Opener", sub: "1–2 costs to pick up in stages 1–2", stage: "opener", rows: rows(meta, "opener") },
            { key: "early", label: "Stage 3", sub: "end of stage 3", stage: 3, rows: rows(meta, 3) },
            { key: "mid", label: "Stage 4", sub: "end of stage 4", stage: 4, rows: rows(meta, 4) },
            { key: "late", label: "Final", sub: "final board", stage: "final", rows: rows(meta, "final") },
          ]}
        />
      </PanelBody>
    </>
  );
}
