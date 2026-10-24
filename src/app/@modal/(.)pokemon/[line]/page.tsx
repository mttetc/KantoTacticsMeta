import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PokemonDetail } from "@/components/pokemon/PokemonDetail";
import { CostChip } from "@/components/ui/CostChip";
import { Modal } from "@/components/ui/Modal";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { getUnit, lineName } from "@/server/meta";

/** Same content as /pokemon/[line], shown as a modal over the list on client navigation. */
export default function PokemonModal({ params }: { params: Promise<{ line: string }> }) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ line: string }> }) {
  const { line } = await params;
  const r = await getUnit(line);
  if (!r) notFound();
  return (
    <Modal
      title={
        <>
          {lineName(r.meta, line)} <TierBadge tier={r.unit.tier} />
          {r.line.cost && <CostChip cost={r.line.cost} />}
        </>
      }
    >
      <PokemonDetail meta={r.meta} unit={r.unit} line={r.line} />
      <p className={`${ui.note} m-0`}>
        <a href={`/pokemon/${line}`}>Open as a page</a> to share this Pokémon.
      </p>
    </Modal>
  );
}
