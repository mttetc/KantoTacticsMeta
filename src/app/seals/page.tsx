import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { SealsList, type SealRow } from "@/components/seals/SealsList";
import { getMeta, lineDex, lineName } from "@/server/meta";

export const metadata: Metadata = {
  title: "Seals",
  description: "Catalogue of every Seal (the picks offered at rounds 2-1, 3-2 and 4-2) in Kanto Tactics, by rarity and category, for the current rules.",
  alternates: { canonical: "/seals" },
};

type Search = Promise<{ rarity?: string; cat?: string; q?: string }>;

export default function SealsPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <PanelHead subtitle="Seals · the game's augments, catalogue for the current rules" />
      <PanelBody>
        <Suspense fallback={<div className="skeleton" style={{ minHeight: 320 }} />}>
          <List searchParams={searchParams} />
        </Suspense>
      </PanelBody>
    </>
  );
}

async function List({ searchParams }: { searchParams: Search }) {
  const [meta, sp] = await Promise.all([getMeta(), searchParams]);
  const rows: SealRow[] = meta.seals.map((x) => ({
    ...x,
    heroName: x.hero ? lineName(meta, x.hero) : null,
    heroDex: x.hero ? lineDex(meta, x.hero) : null,
    heroCost: x.hero ? (meta.lines[x.hero]?.cost ?? null) : null,
  }));
  return (
    <SealsList
      seals={rows}
      rounds={meta.sealRules?.rounds ?? ["2-1", "3-2", "4-2"]}
      rules={meta.dataRules}
      offer={meta.sealRules ? `${meta.sealRules.cards} offered, ${meta.sealRules.rerolls} reroll` : ""}
      initial={{ rarity: Number(sp.rarity) || 0, cat: sp.cat ?? "", q: sp.q ?? "" }}
    />
  );
}
