import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import type { StageRow } from "@/components/plan/StageTable";
import { StageTabs } from "@/components/plan/StageTabs";
import { ui } from "@/components/ui/styles";
import { alternates } from "@/i18n/links";
import type { Locale } from "@/i18n/routing";
import type { Meta } from "@/lib/types";
import { getMeta, lineDex, lineName } from "@/server/meta";
import { stageRanking, type RankStage } from "@/server/queries";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("gamePlan")]);
  return { title: t("title"), description: t("description"), alternates: alternates(locale as Locale, "/game-plan") };
}

const rows = (m: Meta, stage: RankStage): StageRow[] =>
  stageRanking(m, stage).map((p) => ({ line: p.line, name: lineName(m, p.line), dex: lineDex(m, p.line), cost: m.lines[p.line]?.cost ?? null, presence: p.presence, score: p.score, keep: p.keep, comps: p.comps }));

/** Static: aggregated from the comps' stage guides, refreshed with the Meta. */
export default async function GamePlanPage() {
  const [meta, t] = await Promise.all([getMeta(), getTranslations("gamePlan")]);
  const guided = meta.comps.filter((c) => c.reliable && c.guide).length;
  return (
    <>
      <PanelHead title={t("title")} subtitle={t("subtitle")} />
      <PanelBody>
        <p className={`${ui.note} mt-0 mb-3 text-[.9em]`}>{t.rich("intro", { guided, b: (c) => <b className="text-txt">{c}</b> })}</p>
        <StageTabs
          panels={[
            { key: "opener", label: t("tabs.opener"), sub: t("tabs.openerSub"), stage: "opener", rows: rows(meta, "opener") },
            { key: "early", label: t("tabs.stage3"), sub: t("tabs.stage3Sub"), stage: 3, rows: rows(meta, 3) },
            { key: "mid", label: t("tabs.stage4"), sub: t("tabs.stage4Sub"), stage: 4, rows: rows(meta, 4) },
            { key: "late", label: t("tabs.final"), sub: t("tabs.finalSub"), stage: "final", rows: rows(meta, "final") },
          ]}
        />
      </PanelBody>
    </>
  );
}
