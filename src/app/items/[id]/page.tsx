import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemDetail } from "@/components/items/ItemDetail";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2, pct } from "@/lib/format";
import { getItem, getMeta } from "@/server/meta";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  const meta = await getMeta();
  return meta.items.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const r = await getItem(id);
  if (!r) return { title: "Unknown item" };
  return {
    title: `${r.item.name} · tier ${r.stat.tier}`,
    description: `${r.item.name} in Kanto Tactics Ranked: ${r.item.text}. Average place of the holder ${fmt2(r.stat.avg)}, top 4 ${pct(r.stat.top4)}. Recipe, carriers and best comps.`,
    alternates: { canonical: `/items/${id}` },
  };
}

export default async function ItemPage({ params }: { params: Params }) {
  const { id } = await params;
  const r = await getItem(id);
  if (!r) notFound();
  return (
    <>
      <PanelHead
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            {r.item.name} <TierBadge tier={r.stat.tier} />
          </span>
        }
        subtitle={`Item · Ranked, rules v${r.meta.rules}, ${r.meta.from} to ${r.meta.to}`}
      >
        <Link className={ui.back} href="/items">
          ‹ Items
        </Link>
      </PanelHead>
      <PanelBody>
        <div className="flex flex-col gap-3">
          <ItemDetail meta={r.meta} stat={r.stat} item={r.item} />
        </div>
      </PanelBody>
    </>
  );
}
