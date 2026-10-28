"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { CostChips } from "@/components/ui/CostChips";
import { ui } from "@/components/ui/styles";
import { Tabs } from "@/components/ui/Tabs";
import { StageTable, type StageRow } from "./StageTable";

export type StageKey = "opener" | "early" | "mid" | "late";
export interface StagePanel {
  key: StageKey;
  label: string;
  sub: string;
  stage: "opener" | 3 | 4 | "final";
  rows: StageRow[];
}

/** Opener / Stage 3 / Stage 4 / Final tabs over the stage rankings, with a cost filter shared by all. */
export function StageTabs({ panels }: { panels: StagePanel[] }) {
  const t = useTranslations("gamePlan");
  const [tab, setTab] = useState<StageKey>(panels[0]?.key ?? "opener");
  const [cost, setCost] = useState(0);
  const panel = panels.find((p) => p.key === tab) ?? panels[0];
  if (!panel) return null;
  const rows = cost ? panel.rows.filter((r) => r.cost === cost) : panel.rows;
  return (
    <>
      <Tabs items={panels.map((p) => ({ key: p.key, label: p.label, sub: p.sub, count: p.rows.length }))} value={tab} onChange={setTab} label={t("stageLabel")} />
      <div className={ui.sort} role="group" aria-label={t("costLabel")}>
        <CostChips value={cost} onChange={setCost} />
      </div>
      <div role="tabpanel" id={`panel-${panel.key}`} aria-labelledby={`tab-${panel.key}`}>
        {rows.length ? <StageTable title={panel.label} sub={panel.sub} rows={rows} stage={panel.stage} /> : <div className={ui.empty}>{t("empty", { cost })}</div>}
      </div>
    </>
  );
}
