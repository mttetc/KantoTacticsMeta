import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CompDetail } from "@/components/comps/CompDetail";
import { CompTitle } from "@/components/comps/CompTitle";
import { CompVersions } from "@/components/comps/CompVersions";
import { FavoriteButton } from "@/components/comps/FavoriteButton";
import { TeamCodeButton } from "@/components/comps/TeamCodeButton";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { TierBadge } from "@/components/ui/TierBadge";
import { alternates } from "@/i18n/links";
import { routing, type Locale } from "@/i18n/routing";
import { fmt2, pct } from "@/lib/format";
import { teamCode } from "@/lib/team-code";
import { getComp, getMeta, lineName } from "@/server/meta";

type Params = Promise<{ slug: string }>;

/** Reliable comps are prerendered; the rest render on first visit and join the ISR cache. Slugs are ids, the same in every locale. */
export async function generateStaticParams() {
  const meta = await getMeta(routing.defaultLocale);
  return meta.comps.filter((c) => c.reliable).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [r, locale, t] = await Promise.all([getComp(slug), getLocale(), getTranslations("comp")]);
  if (!r) return { title: t("unknown") };
  const { comp: c, meta } = r;
  const carry = c.units.find((u) => u.role === "carry");
  const title = t("metaTitle", { title: c.title, tier: c.tier });
  return {
    title,
    description: t("metaDescription", { title: c.title, avg: fmt2(c.avg), ic: fmt2(c.ic), top4: pct(c.top4), win: pct(c.win), carry: carry ? lineName(meta, carry.line) : "" }),
    alternates: alternates(locale as Locale, `/comps/${slug}`),
    openGraph: { title, description: t("ogDescription", { avg: fmt2(c.avg), top4: pct(c.top4), win: pct(c.win) }) },
  };
}

export default async function CompPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [r, t] = await Promise.all([getComp(slug), getTranslations("comp")]);
  if (!r) notFound();
  const { meta, comp } = r;
  const code = teamCode(meta, comp);
  return (
    <>
      <PanelHead
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <TierBadge tier={comp.tier} /> <CompTitle meta={meta} comp={comp} heading />
          </span>
        }
        back={{ href: "/comps", label: t("back") }}
        subtitle={t("subtitle", { rules: meta.rules, from: meta.from, to: meta.to })}
      >
        {code && <TeamCodeButton code={code} />}
        {/* reads the visitor's cookie in the browser, so the whole page stays static */}
        <FavoriteButton compId={comp.id} />
      </PanelHead>
      <PanelBody>
        <div className="flex flex-col gap-3.5">
          <CompDetail meta={meta} comp={comp} />
          <CompVersions meta={meta} comp={comp} />
        </div>
      </PanelBody>
    </>
  );
}
