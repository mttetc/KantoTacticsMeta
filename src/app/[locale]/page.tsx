import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { PokemonTierList } from "@/components/pokemon/PokemonTierList";
import { ui } from "@/components/ui/styles";
import { alternates } from "@/i18n/links";
import type { Locale } from "@/i18n/routing";
import type { UnitRow } from "@/lib/unit-filters";
import { getMeta, lineDex, lineName, typeName } from "@/server/meta";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home")]);
  return { title: t("title"), description: t("description"), alternates: alternates(locale as Locale, "/") };
}

/**
 * Fully static: the Meta is cached, the URL's filters are read in the browser (see useUrlState), so the page
 * is served by the CDN and no function runs per visit.
 */
export default async function Home() {
  const t = await getTranslations("home");
  return (
    <>
      <PanelHead title={t("title")} subtitle={t("subtitle")} />
      <PanelBody>
        <Suspense fallback={<TierListSkeleton />}>
          <TierList />
        </Suspense>
      </PanelBody>
    </>
  );
}

async function TierList() {
  const meta = await getMeta();
  const rows: UnitRow[] = meta.units.map((u) => {
    const l = meta.lines[u.line];
    return {
      line: u.line,
      name: lineName(meta, u.line),
      allNames: l?.names ?? [u.line],
      dex: lineDex(meta, u.line),
      cost: l?.cost ?? null,
      types: l?.types ?? [],
      typeNames: (l?.types ?? []).map((t) => typeName(meta, t)),
      tier: u.tier,
      avg: u.avg,
      use: u.use,
    };
  });
  const types = Object.values(meta.traitData).map((t) => ({ id: t.id, name: t.name }));
  return <PokemonTierList units={rows} types={types} />;
}

function TierListSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy>
      {["S", "A", "B", "C", "D"].map((t) => (
        <div key={t} className={`${ui.skeleton} min-h-[120px]`} />
      ))}
    </div>
  );
}
