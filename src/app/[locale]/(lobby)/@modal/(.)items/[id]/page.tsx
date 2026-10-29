import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ItemDetail } from "@/components/items/ItemDetail";
import { Modal } from "@/components/ui/Modal";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { Link } from "@/i18n/navigation";
import { getItem } from "@/server/meta";

/** Same content as the page, shown as a modal over the list on client navigation. */
export default function ItemModal({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [r, t] = await Promise.all([getItem(id), getTranslations("modal")]);
  if (!r) notFound();
  return (
    <Modal title={
        <>
          {r.item.name} <TierBadge tier={r.stat.tier} />
        </>
      }>
      <ItemDetail meta={r.meta} stat={r.stat} item={r.item} />
      <p className={`${ui.note} m-0`}>{t.rich("openAsPage", { link: (c) => <Link href={`/items/${id}`}>{c}</Link> })}</p>
    </Modal>
  );
}
