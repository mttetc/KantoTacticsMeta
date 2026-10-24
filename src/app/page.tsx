import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { PokemonTierList, type UnitRow } from "@/components/pokemon/PokemonTierList";
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
      top4: u.top4,
      win: u.win,
      use: u.use,
    };
  });
  const types = Object.values(meta.traitData).map((t) => ({ id: t.id, name: t.name }));
  const initial = { sort: sp.sort ?? "avg", cost: Number(sp.cost) || 0, type: sp.type ?? "", q: sp.q ?? "" };
  return <PokemonTierList units={rows} types={types} initial={initial} />;
}

function TierListSkeleton() {
  return (
    <div className="tiers" aria-busy>
      {["S", "A", "B", "C", "D"].map((t) => (
        <div key={t} className="skeleton" style={{ minHeight: 120 }} />
      ))}
    </div>
  );
}
