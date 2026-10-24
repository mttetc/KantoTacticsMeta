import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { TraitDetail } from "@/components/types/TraitDetail";
import { typeColor, ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2, pct } from "@/lib/format";
import { getMeta, getTrait } from "@/server/meta";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const meta = await getMeta();
  return meta.traits.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getTrait(slug);
  if (!r) return { title: "Unknown type" };
  const name = `${r.trait.name} ${r.stat.level}`;
  return {
    title: `${name} · tier ${r.stat.tier}`,
    description: `${name} in Kanto Tactics Ranked: average place ${fmt2(r.stat.avg)}, top 4 ${pct(r.stat.top4)}, usage ${pct(r.stat.use)}. Thresholds, Pokémon of the type and best comps.`,
    alternates: { canonical: `/types/${slug}` },
  };
}

export default async function TraitPage({ params }: { params: Params }) {
  const { slug } = await params;
  const r = await getTrait(slug);
  if (!r) notFound();
  return (
    <>
      <PanelHead
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span style={{ color: typeColor(r.stat.type) }}>{r.trait.name}</span> {r.stat.level} <TierBadge tier={r.stat.tier} />
          </span>
        }
        subtitle={`Type · Ranked, rules v${r.meta.rules}, ${r.meta.from} to ${r.meta.to}`}
      >
        <Link className={ui.back} href="/types">
          ‹ Types
        </Link>
      </PanelHead>
      <PanelBody>
        <div className="flex flex-col gap-3">
          <TraitDetail meta={r.meta} stat={r.stat} trait={r.trait} />
        </div>
      </PanelBody>
    </>
  );
}
