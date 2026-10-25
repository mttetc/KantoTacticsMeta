import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CompDetail } from "@/components/comps/CompDetail";
import { CompTitle } from "@/components/comps/CompTitle";
import { CompVersions } from "@/components/comps/CompVersions";
import { FavoriteSlot, FavoriteSlotFallback } from "@/components/comps/FavoriteSlot";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2, pct } from "@/lib/format";
import { getComp, getMeta, lineName } from "@/server/meta";

type Params = Promise<{ slug: string }>;

/** Reliable comps are prerendered; the rest render on first visit and join the ISR cache. */
export async function generateStaticParams() {
  const meta = await getMeta();
  return meta.comps.filter((c) => c.reliable).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getComp(slug);
  if (!r) return { title: "Unknown comp" };
  const { comp: c, meta } = r;
  const carry = c.units.find((u) => u.role === "carry");
  return {
    title: `${c.title} · tier ${c.tier}`,
    description: `${c.title} in Kanto Tactics Ranked: average place ${fmt2(c.avg)} ± ${fmt2(c.ic)}, top 4 ${pct(c.top4)}, wins ${pct(c.win)}${carry ? `, carry ${lineName(meta, carry.line)}` : ""}. Final team, items, placement and stage guide.`,
    alternates: { canonical: `/comps/${slug}` },
    openGraph: { title: `${c.title} · tier ${c.tier}`, description: `Avg place ${fmt2(c.avg)} · top 4 ${pct(c.top4)} · wins ${pct(c.win)}` },
  };
}

export default async function CompPage({ params }: { params: Params }) {
  const { slug } = await params;
  const r = await getComp(slug);
  if (!r) notFound();
  const { meta, comp } = r;
  return (
    <>
      <PanelHead
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <TierBadge tier={comp.tier} /> <CompTitle meta={meta} comp={comp} />
          </span>
        }
        back={{ href: "/comps", label: "Comps" }}
        subtitle={`Comp · Ranked, rules v${meta.rules}, ${meta.from} to ${meta.to}`}
      >
        {/* the only request-time piece of the page: the visitor's cookie, streamed under Suspense */}
        <Suspense fallback={<FavoriteSlotFallback />}>
          <FavoriteSlot compId={comp.id} />
        </Suspense>
      </PanelHead>
      <PanelBody>
        <div className="flex flex-col gap-3.5">
          <CompVersions meta={meta} comp={comp} />
          <CompDetail meta={meta} comp={comp} />
        </div>
      </PanelBody>
    </>
  );
}
