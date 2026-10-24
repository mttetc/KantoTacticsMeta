import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ItemDetail } from "@/components/items/ItemDetail";
import { Modal } from "@/components/ui/Modal";
import { TierBadge } from "@/components/ui/TierBadge";
import { getItem } from "@/server/meta";

/** Intercepted routes have no static params: the await happens under Suspense so the shell still prerenders. */
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
      <p className="note" style={{ margin: 0 }}>
        <Link href={`/items/${id}`}>Open as a page</Link> to share this item.
      </p>
    </Modal>
  );
}
