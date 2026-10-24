import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TraitDetail } from "@/components/types/TraitDetail";
import { Modal } from "@/components/ui/Modal";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { getTrait } from "@/server/meta";

export default function TraitModal({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getTrait(slug);
  if (!r) notFound();
  return (
    <Modal
      title={
        <>
          {r.trait.name} {r.stat.level} <TierBadge tier={r.stat.tier} />
        </>
      }
    >
      <TraitDetail meta={r.meta} stat={r.stat} trait={r.trait} />
      <p className={`${ui.note} m-0`}>
        <a href={`/types/${slug}`}>Open as a page</a> to share this type.
      </p>
    </Modal>
  );
}
