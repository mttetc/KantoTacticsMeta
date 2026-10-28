import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { TraitDetail } from "@/components/types/TraitDetail";
import { Modal } from "@/components/ui/Modal";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { Link } from "@/i18n/navigation";
import { getTrait } from "@/server/meta";

/** Same content as the page, shown as a modal over the list on client navigation. */
export default function TraitModal({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [r, t] = await Promise.all([getTrait(slug), getTranslations("modal")]);
  if (!r) notFound();
  return (
    <Modal title={
        <>
          {r.trait.name} {r.trait.thresholds[r.stat.level - 1] ?? r.stat.level} <TierBadge tier={r.stat.tier} />
        </>
      }>
      <TraitDetail meta={r.meta} stat={r.stat} trait={r.trait} />
      <p className={`${ui.note} m-0`}>{t.rich("openAsPage", { link: (c) => <Link href={`/types/${slug}`}>{c}</Link> })}</p>
    </Modal>
  );
}
