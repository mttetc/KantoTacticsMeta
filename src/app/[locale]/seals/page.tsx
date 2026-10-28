import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import type { SealRow } from "@/components/seals/SealCard";
import { SealsList } from "@/components/seals/SealsList";
import { ui } from "@/components/ui/styles";
import { alternates } from "@/i18n/links";
import type { Locale } from "@/i18n/routing";
import { SEAL_ROUNDS } from "@/lib/constants";
import { getMeta, lineDex, lineName } from "@/server/meta";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("seals")]);
  return { title: t("title"), description: t("description"), alternates: alternates(locale as Locale, "/seals") };
}

/** Fully static: the URL's filters are read in the browser (see useUrlState). */
export default async function SealsPage() {
  const t = await getTranslations("seals");
  return (
    <>
      <PanelHead title={t("title")} subtitle={t("subtitle")} />
      <PanelBody>
        <Suspense fallback={<div className={`${ui.skeleton} min-h-[320px]`} />}>
          <List />
        </Suspense>
      </PanelBody>
    </>
  );
}

async function List() {
  const [meta, t] = await Promise.all([getMeta(), getTranslations("seals")]);
  const rows: SealRow[] = meta.seals.map((x) => ({
    ...x,
    heroName: x.hero ? lineName(meta, x.hero) : null,
    heroDex: x.hero ? lineDex(meta, x.hero) : null,
    heroCost: x.hero ? (meta.lines[x.hero]?.cost ?? null) : null,
  }));
  return <SealsList seals={rows} rounds={meta.sealRules?.rounds ?? SEAL_ROUNDS} rules={meta.dataRules} offer={meta.sealRules ? t("offer", { cards: meta.sealRules.cards, rerolls: meta.sealRules.rerolls }) : ""} />;
}
