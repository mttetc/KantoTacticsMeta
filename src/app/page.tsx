import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { PokemonTierList } from "@/components/pokemon/PokemonTierList";
import { parseUnitSort, type UnitRow } from "@/lib/unit-filters";
import { ui } from "@/components/ui/styles";
import { getMeta, lineDex, lineName, typeName } from "@/server/meta";

export const metadata: Metadata = {
  title: "Pokémon tier list",
  description: "Every Pokémon of Kanto Tactics Ranked ranked S to D by average place over the last 7 days, with cost, types and the comps that carry them.",
  alternates: { canonical: "/" },
};

type Search = Promise<{ sort?: string; cost?: string; type?: string; q?: string }>;

/**
 * Static shell (header, panel) + a request-time list: the URL's filters are read on the server so the
 * first paint already matches the link, then the client component takes over without a round trip.
 */
export default function Home({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PanelHead subtitle="Pokémon tier list · Ranked, humans only, last 7 days" />
      <PanelBody>
        <Suspense fallback={<TierListSkeleton />}>
          <TierList searchParams={searchParams} />
        </Suspense>
      </PanelBody>
    </>
  );
}

async function TierList({ searchParams }: { searchParams: Search }) {
  const [meta, sp] = await Promise.all([getMeta(), searchParams]);
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
  const initial = { sort: parseUnitSort(sp.sort), cost: Number(sp.cost) || 0, type: sp.type ?? "", q: sp.q ?? "" };
  return <PokemonTierList units={rows} types={types} initial={initial} />;
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
