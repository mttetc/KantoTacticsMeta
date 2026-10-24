import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { PokemonDetail } from "@/components/pokemon/PokemonDetail";
import { CostChip } from "@/components/ui/CostChip";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2, pct } from "@/lib/format";
import { getMeta, getUnit, lineName, typeName } from "@/server/meta";

type Params = Promise<{ line: string }>;

/** Every Pokémon page is prerendered at build time and refreshed with the Meta (ISR). */
export async function generateStaticParams() {
  const meta = await getMeta();
  return meta.units.map((u) => ({ line: u.line }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { line } = await params;
  const r = await getUnit(line);
  if (!r) return { title: "Unknown Pokémon" };
  const name = lineName(r.meta, line);
  const types = r.line.types.map((t) => typeName(r.meta, t)).join("/");
  return {
    title: `${name} · tier ${r.unit.tier}`,
    description: `${name} (${types}${r.line.cost ? `, cost ${r.line.cost}` : ""}) in Kanto Tactics Ranked: average place ${fmt2(r.unit.avg)}, top 4 ${pct(r.unit.top4)}, usage ${pct(r.unit.use)}. Items and best comps.`,
    alternates: { canonical: `/pokemon/${line}` },
    openGraph: { title: `${name} · tier ${r.unit.tier}`, description: `Average place ${fmt2(r.unit.avg)} · top 4 ${pct(r.unit.top4)} · ${types}` },
  };
}

export default async function PokemonPage({ params }: { params: Params }) {
  const { line } = await params;
  const r = await getUnit(line);
  if (!r) notFound();
  const { meta, unit, line: l } = r;
  const name = lineName(meta, line);
  return (
    <>
      <PanelHead
        title={
          <>
            {name} <TierBadge tier={unit.tier} />
          </>
        }
        subtitle={`Pokémon · Ranked, rules v${meta.rules}, ${meta.from} to ${meta.to}`}
      >
        <Link className="back" href="/">
          ‹ Tier list
        </Link>
      </PanelHead>
      <PanelBody>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {l.cost && (
            <div className="strip">
              <CostChip cost={l.cost} />
            </div>
          )}
          <PokemonDetail meta={meta} unit={unit} line={l} />
        </div>
      </PanelBody>
    </>
  );
}
