import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ItemDetail } from "@/components/items/ItemDetail";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { TierBadge } from "@/components/ui/TierBadge";
import { alternates } from "@/i18n/links";
import { routing, type Locale } from "@/i18n/routing";
import { fmt2, pct } from "@/lib/format";
import { getItem, getMeta } from "@/server/meta";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  const meta = await getMeta(routing.defaultLocale);
  return meta.items.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const [r, locale, t] = await Promise.all([getItem(id), getLocale(), getTranslations("item")]);
  if (!r) return { title: t("unknown") };
  return {
    title: t("metaTitle", { name: r.item.name, tier: r.stat.tier }),
    description: t("metaDescription", { name: r.item.name, text: r.item.text, avg: fmt2(r.stat.avg), top4: pct(r.stat.top4) }),
    alternates: alternates(locale as Locale, `/items/${id}`),
  };
}

export default async function ItemPage({ params }: { params: Params }) {
  const { id } = await params;
  const [r, t] = await Promise.all([getItem(id), getTranslations("item")]);
  if (!r) notFound();
  return (
    <>
      <PanelHead
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            {r.item.name} <TierBadge tier={r.stat.tier} />
          </span>
        }
        back={{ href: "/items", label: t("back") }}
        subtitle={t("subtitle", { rules: r.meta.rules, from: r.meta.from, to: r.meta.to })}
      />
      <PanelBody>
        <div className="flex flex-col gap-3">
          <ItemDetail meta={r.meta} stat={r.stat} item={r.item} />
        </div>
      </PanelBody>
    </>
  );
}
