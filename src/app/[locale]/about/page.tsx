import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ui } from "@/components/ui/styles";
import { alternates } from "@/i18n/links";
import type { Locale } from "@/i18n/routing";
import { fmt2 } from "@/lib/format";
import { API_URL } from "@/lib/site";
import { COMP_THRESHOLDS, D_GAP, MIN_NE } from "@/lib/tiers";
import { getMeta } from "@/server/meta";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("about")]);
  return { title: t("title"), description: t("description"), alternates: alternates(locale as Locale, "/about") };
}

const p = "text-[.92em] leading-[1.5] text-dim";

export default async function AboutPage() {
  const [m, t] = await Promise.all([getMeta(), getTranslations("about")]);
  const r = (n: number) => fmt2(m.ref + n);
  return (
    <>
      <PanelHead title={t("title")} />
      <PanelBody>
        <div className="flex max-w-[760px] flex-col gap-3">
          <div className={ui.sec}>
            <h2 className={ui.secTitle}>{t("source")}</h2>
            <p className={p}>
              {t.rich("sourceText", {
                from: m.from,
                to: m.to,
                api: (c) => (
                  <a href={API_URL} target="_blank" rel="noopener">
                    {c}
                  </a>
                ),
              })}
            </p>
          </div>
          <div className={ui.sec}>
            <h2 className={ui.secTitle}>{t("tiers")}</h2>
            <p className={p}>{t("tiersText1", { ref: fmt2(m.ref), s: r(m.thresholds.tiers.S), a: r(m.thresholds.tiers.A), b: r(m.thresholds.tiers.B), d: r(D_GAP) })}</p>
            <p className={`${p} mt-2`}>{t("tiersText2", { s: r(COMP_THRESHOLDS.S), a: r(COMP_THRESHOLDS.A), b: r(COMP_THRESHOLDS.B), c: r(COMP_THRESHOLDS.C), minNe: MIN_NE })}</p>
          </div>
          <div className={ui.sec}>
            <h2 className={ui.secTitle}>{t("roles")}</h2>
            <p className={p}>{t("rolesText")}</p>
          </div>
          <div className={ui.sec}>
            <h2 className={ui.secTitle}>{t("missing")}</h2>
            <p className={p}>{t("missingText", { rules: m.rules, data: m.dataRules })}</p>
          </div>
          <p className={ui.note}>{t("disclaimer")}</p>
        </div>
      </PanelBody>
    </>
  );
}
