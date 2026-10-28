import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { TraitDetail } from "@/components/types/TraitDetail";
import { typeColor } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { alternates } from "@/i18n/links";
import { routing, type Locale } from "@/i18n/routing";
import { fmt2, pct } from "@/lib/format";
import { getMeta, getTrait } from "@/server/meta";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const meta = await getMeta(routing.defaultLocale);
  return meta.traits.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [r, locale, t] = await Promise.all([getTrait(slug), getLocale(), getTranslations("type")]);
  if (!r) return { title: t("unknown") };
  const name = `${r.trait.name} ${r.trait.thresholds[r.stat.level - 1] ?? r.stat.level}`;
  return {
    title: t("metaTitle", { name, tier: r.stat.tier }),
    description: t("metaDescription", { name, avg: fmt2(r.stat.avg), top4: pct(r.stat.top4), use: pct(r.stat.use) }),
    alternates: alternates(locale as Locale, `/types/${slug}`),
  };
}

export default async function TraitPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [r, t] = await Promise.all([getTrait(slug), getTranslations("type")]);
  if (!r) notFound();
  return (
    <>
      <PanelHead
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span style={{ color: typeColor(r.stat.type) }}>{r.trait.name}</span> {r.trait.thresholds[r.stat.level - 1] ?? r.stat.level} <TierBadge tier={r.stat.tier} />
          </span>
        }
        back={{ href: "/types", label: t("back") }}
        subtitle={t("subtitle", { level: r.stat.level, rules: r.meta.rules, from: r.meta.from, to: r.meta.to })}
      />
      <PanelBody>
        <div className="flex flex-col gap-3">
          <TraitDetail meta={r.meta} stat={r.stat} trait={r.trait} />
        </div>
      </PanelBody>
    </>
  );
}
