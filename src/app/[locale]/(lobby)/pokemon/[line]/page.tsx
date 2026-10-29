import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { PokemonDetail } from "@/components/pokemon/PokemonDetail";
import { CostChip } from "@/components/ui/CostChip";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { alternates } from "@/i18n/links";
import { routing, type Locale } from "@/i18n/routing";
import { fmt2, pct } from "@/lib/format";
import { getMeta, getUnit, lineName, typeName } from "@/server/meta";

type Params = Promise<{ line: string }>;

/** Every Pokémon page is prerendered at build time and refreshed with the Meta (ISR). */
export async function generateStaticParams() {
  const meta = await getMeta(routing.defaultLocale);
  return meta.units.map((u) => ({ line: u.line }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { line } = await params;
  const [r, locale, t] = await Promise.all([getUnit(line), getLocale(), getTranslations("pokemon")]);
  if (!r) return { title: t("unknown") };
  const name = lineName(r.meta, line);
  const types = r.line.types.map((x) => typeName(r.meta, x)).join("/");
  const title = t("metaTitle", { name, tier: r.unit.tier });
  return {
    title,
    description: t("metaDescription", { name, types, cost: r.line.cost ?? 0, avg: fmt2(r.unit.avg), top4: pct(r.unit.top4), use: pct(r.unit.use) }),
    alternates: alternates(locale as Locale, `/pokemon/${line}`),
    openGraph: { title, description: t("ogDescription", { avg: fmt2(r.unit.avg), top4: pct(r.unit.top4), types }) },
  };
}

export default async function PokemonPage({ params }: { params: Params }) {
  const { line } = await params;
  const [r, t] = await Promise.all([getUnit(line), getTranslations("pokemon")]);
  if (!r) notFound();
  const { meta, unit, line: l } = r;
  return (
    <>
      <PanelHead
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            {lineName(meta, line)} <TierBadge tier={unit.tier} />
          </span>
        }
        back={{ href: "/", label: t("back") }}
        subtitle={t("subtitle", { rules: meta.rules, from: meta.from, to: meta.to })}
      />
      <PanelBody>
        <div className="flex flex-col gap-3">
          {l.cost && (
            <div className={ui.strip}>
              <CostChip cost={l.cost} />
            </div>
          )}
          <PokemonDetail meta={meta} unit={unit} line={l} />
        </div>
      </PanelBody>
    </>
  );
}
