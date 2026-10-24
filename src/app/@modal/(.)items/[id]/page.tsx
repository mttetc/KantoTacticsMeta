import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ItemDetail } from "@/components/items/ItemDetail";
import { Modal } from "@/components/ui/Modal";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { getItem } from "@/server/meta";

export default function ItemModal({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getItem(id);
  if (!r) notFound();
  return (
    <Modal
      title={
        <>
          {r.item.name} <TierBadge tier={r.stat.tier} />
        </>
      }
    >
      <ItemDetail meta={r.meta} stat={r.stat} item={r.item} />
      <p className={`${ui.note} m-0`}>
        <a href={`/items/${id}`}>Open as a page</a> to share this item.
      </p>
    </Modal>
  );
}
