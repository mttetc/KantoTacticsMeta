import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import type { SealRow } from "@/components/seals/SealCard";
import { SealsList } from "@/components/seals/SealsList";
import { SEAL_ROUNDS } from "@/lib/constants";
import { ui } from "@/components/ui/styles";
import { getMeta, lineDex, lineName } from "@/server/meta";

export const metadata: Metadata = {
  title: "Seals",
  description: "Catalogue of every Seal (the picks offered at rounds 2-1, 3-2 and 4-2) in Kanto Tactics, by rarity and category, for the current rules.",
  alternates: { canonical: "/seals" },
};

/** Fully static: the URL's filters are read in the browser (see useUrlState). */
export default function SealsPage() {
  return (
    <>
      <PanelHead subtitle="Seals · the game's augments, catalogue for the current rules" />
      <PanelBody>
        <Suspense fallback={<div className={`${ui.skeleton} min-h-[320px]`} />}>
          <List />
        </Suspense>
      </PanelBody>
    </>
  );
}

async function List() {
  const meta = await getMeta();
  const rows: SealRow[] = meta.seals.map((x) => ({
    ...x,
    heroName: x.hero ? lineName(meta, x.hero) : null,
    heroDex: x.hero ? lineDex(meta, x.hero) : null,
    heroCost: x.hero ? (meta.lines[x.hero]?.cost ?? null) : null,
  }));
  return (
    <SealsList
      seals={rows}
      rounds={meta.sealRules?.rounds ?? SEAL_ROUNDS}
      rules={meta.dataRules}
      offer={meta.sealRules ? `${meta.sealRules.cards} offered, ${meta.sealRules.rerolls} reroll` : ""}
    />
  );
}
