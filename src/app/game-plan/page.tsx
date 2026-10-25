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
      <PanelHead subtitle="Game plan · what the good comps field at each point of the game" />
      <PanelBody>
        <p className={`${ui.note} mt-0 mb-3 text-[.9em]`}>
          The API only scores the end of the game, so there is no &ldquo;best early comp&rdquo;. What it does publish is the board of the players who finished on a good comp at the end of stages 3 and 4 ({guided} reliable comps). Below: the units they fielded at
          each point, how good the comps they lead to are, and whether the unit stays until the end or gets sold. Filter by cost for the 1 and 2 costs to open with. Click a unit for the final comps that start with it; every comp page has its own Opener → Early → Mid → Final plan.
        </p>
        <StageTabs
          panels={[
            { key: "early", label: "Early", sub: "end of stage 3", stage: 3, rows: rows(meta, 3) },
            { key: "mid", label: "Mid", sub: "end of stage 4", stage: 4, rows: rows(meta, 4) },
            { key: "late", label: "Late", sub: "final board", stage: "final", rows: rows(meta, "final") },
          ]}
        />
      </PanelBody>
    </>
  );
}
