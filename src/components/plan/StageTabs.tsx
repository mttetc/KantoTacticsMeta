"use client";

import { useState } from "react";
import { costColor, ui } from "@/components/ui/styles";
import { Tabs } from "@/components/ui/Tabs";
import { StageTable, type StageRow } from "./StageTable";

export type StageKey = "early" | "mid" | "late";
export interface StagePanel {
  key: StageKey;
  label: string;
  sub: string;
  stage: 3 | 4 | "final";
  rows: StageRow[];
}

/** Early / Mid / Late tabs over the stage rankings, with a cost filter shared by the three. */
export function StageTabs({ panels }: { panels: StagePanel[] }) {
  const [tab, setTab] = useState<StageKey>(panels[0]?.key ?? "early");
  const [cost, setCost] = useState(0);
  const panel = panels.find((p) => p.key === tab) ?? panels[0];
  if (!panel) return null;
  const rows = cost ? panel.rows.filter((r) => r.cost === cost) : panel.rows;
  return (
    <>
      <Tabs items={panels.map((p) => ({ key: p.key, label: p.label, sub: p.sub, count: p.rows.length }))} value={tab} onChange={setTab} label="Stage" />
      <div className={ui.sort} role="group" aria-label="Cost">
        <span className="mr-0.5">Cost</span>
        {[1, 2, 3, 4, 5].map((c) => (
          <button key={c} type="button" className={`${ui.chip} ${cost === c ? ui.chipOn : ""}`} onClick={() => setCost(cost === c ? 0 : c)} aria-pressed={cost === c}>
            <i className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_1px_#0008]" style={{ background: costColor(c) }} />
            {c}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${panel.key}`} aria-labelledby={`tab-${panel.key}`}>
        {rows.length ? <StageTable title={panel.label} sub={panel.sub} rows={rows} stage={panel.stage} /> : <div className={ui.empty}>No {cost}-cost unit on the boards at this point.</div>}
      </div>
    </>
  );
}
