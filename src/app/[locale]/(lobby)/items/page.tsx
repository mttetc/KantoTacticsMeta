import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { IntentLink } from "@/components/ui/IntentLink";
import { ItemIcon } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { TierRows } from "@/components/ui/TierRows";
import { alternates } from "@/i18n/links";
import type { Locale } from "@/i18n/routing";
import { fmt2 } from "@/lib/format";
import { getMeta, itemName } from "@/server/meta";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("items")]);
  return { title: t("title"), description: t("description"), alternates: alternates(locale as Locale, "/items") };
}

/** Fully static: no runtime input, rebuilt with the Meta. */
export default async function ItemsPage() {
  const [meta, t, tc] = await Promise.all([getMeta(), getTranslations("items"), getTranslations("common")]);
  const sorted = [...meta.items].sort((a, b) => a.avg - b.avg);
  // only combined items are graded: a component sits on every board on its way to an item, so its average says nothing
  const items = sorted.filter((it) => meta.itemData[it.id]?.kind === "full");
  const parts = sorted.filter((it) => meta.itemData[it.id]?.kind !== "full");
  let k = 0;
  return (
    <>
      <PanelHead title={t("title")} subtitle={t("subtitle")} />
      <PanelBody>
        <TierRows
          render={(tier) =>
            items
              .filter((it) => it.tier === tier)
              .map((it) => (
                <IntentLink key={it.id} className={`${ui.unit} w-[92px]! animate-card-in`} href={`/items/${it.id}`} title={`${itemName(meta, it.id)} · ${tc("avg")} ${fmt2(it.avg)}`} style={{ animationDelay: `${(0.15 + Math.min(k++, 30) * 0.025).toFixed(3)}s` } as React.CSSProperties}>
                  <span className="grid h-[68px] w-[68px] place-items-center rounded-2xl border-2 border-ink bg-surface shadow-[inset_0_0_0_1px_var(--color-rim-soft)] transition-shadow group-hover:shadow-[0_0_0_2px_var(--color-gold)]">
                    <ItemIcon id={it.id} name={itemName(meta, it.id)} size={44} className="rounded-lg" />
                  </span>
                  <span className="mt-1 text-[.86em] leading-none font-bold">{fmt2(it.avg)}</span>
                  <small>{itemName(meta, it.id)}</small>
                </IntentLink>
              ))
          }
        />
        <p className={ui.tierNote}>{t("note")}</p>
        {parts.length > 0 && (
          <div className={`${ui.sec} mt-3`}>
            <h2 className={ui.secTitle}>
              {t("components")}
              <small>{t("componentsSub")}</small>
            </h2>
            <div className="flex flex-wrap gap-x-1.5 gap-y-2.5 pt-1">
              {parts.map((it) => (
                <IntentLink key={it.id} className={`${ui.unit} w-[92px]!`} href={`/items/${it.id}`} title={`${itemName(meta, it.id)} · ${tc("avg")} ${fmt2(it.avg)}`}>
                  <span className="grid h-[56px] w-[56px] place-items-center rounded-2xl border-2 border-ink bg-surface shadow-[inset_0_0_0_1px_var(--color-rim-soft)] transition-shadow group-hover:shadow-[0_0_0_2px_var(--color-gold)]">
                    <ItemIcon id={it.id} name={itemName(meta, it.id)} size={36} className="rounded-lg" />
                  </span>
                  <span className="mt-1 text-[.86em] leading-none font-bold">{fmt2(it.avg)}</span>
                  <small>{itemName(meta, it.id)}</small>
                </IntentLink>
              ))}
            </div>
          </div>
        )}
      </PanelBody>
    </>
  );
}
