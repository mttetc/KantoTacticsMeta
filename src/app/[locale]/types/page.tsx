import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { IntentLink } from "@/components/ui/IntentLink";
import { TypeGlyph, TypeIcon } from "@/components/ui/Sprite";
import { typeColor, ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { TierRows } from "@/components/ui/TierRows";
import { alternates } from "@/i18n/links";
import type { Locale } from "@/i18n/routing";
import { fmt2, int } from "@/lib/format";
import { getMeta, typeName } from "@/server/meta";
import { traitPairs } from "@/server/queries";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("types")]);
  return { title: t("title"), description: t("description"), alternates: alternates(locale as Locale, "/types") };
}

/** Fully static: no runtime input, rebuilt with the Meta. */
export default async function TypesPage() {
  const [meta, t, tc] = await Promise.all([getMeta(), getTranslations("types"), getTranslations("common")]);
  const traits = [...meta.traits].sort((a, b) => a.avg - b.avg);
  // "Psychic 6": the units of the type needed for that level, as the game shows it
  const need = (x: (typeof traits)[number]) => meta.traitData[x.type]?.thresholds[x.level - 1] ?? x.level;
  const pairs = traitPairs(meta, 24);
  let k = 0;
  return (
    <>
      <PanelHead title={t("title")} subtitle={t("subtitle")} />
      <PanelBody>
        <TierRows
          render={(tier) =>
            traits
              .filter((x) => x.tier === tier)
              .map((x) => (
                <IntentLink key={x.slug} className={`${ui.unit} w-[98px]! animate-card-in`} href={`/types/${x.slug}`} title={t("cardTitle", { name: typeName(meta, x.type), need: need(x), level: x.level, avg: fmt2(x.avg) })} style={{ animationDelay: `${(0.15 + Math.min(k++, 30) * 0.025).toFixed(3)}s` } as React.CSSProperties}>
                  <span className="grid h-[68px] w-[68px] place-items-center rounded-2xl border-2 border-ink bg-surface shadow-[inset_0_0_0_1px_var(--color-rim-soft)] transition-shadow group-hover:shadow-[0_0_0_2px_var(--color-gold)]">
                    <TypeIcon type={x.type} name={typeName(meta, x.type)} size={60} />
                  </span>
                  <span className="mt-1 text-[.86em] leading-none font-bold" style={{ color: typeColor(x.type) }}>
                    {typeName(meta, x.type)} {need(x)}
                  </span>
                  <small>
                    {tc("avg")} {fmt2(x.avg)}
                  </small>
                </IntentLink>
              ))
          }
        />
        <p className={ui.tierNote}>{t("note")}</p>
        {pairs.length > 0 && (
          <div className={`${ui.sec} mt-3`}>
            <h2 className={ui.secTitle}>
              {t("pairs")}
              <small>{t("pairsSub")}</small>
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-1.5">
              {pairs.map((p) => (
                <IntentLink key={`${p.a}+${p.b}`} href={`/comps?tier=all&q=${encodeURIComponent(`${typeName(meta, p.a)} ${typeName(meta, p.b)}`)}`} className="flex items-center gap-2 rounded-xl border border-line bg-black/20 px-2.5 py-1.5 text-[.9em] no-underline hover:bg-white/6" title={t("pairTitle", { comps: int(p.comps), games: int(p.games), score: fmt2(p.score), tier: p.bestTier })}>
                  <span className="flex items-center gap-0.5">
                    <TypeGlyph type={p.a} size={18} />
                    <TypeGlyph type={p.b} size={18} />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    <span style={{ color: typeColor(p.a) }}>{typeName(meta, p.a)}</span> × <span style={{ color: typeColor(p.b) }}>{typeName(meta, p.b)}</span>
                  </span>
                  <span className="text-[.85em] text-dim tabular-nums">{fmt2(p.score)}</span>
                  <TierBadge tier={p.bestTier} />
                </IntentLink>
              ))}
            </div>
            <p className={ui.note}>{t("pairsNote")}</p>
          </div>
        )}
      </PanelBody>
    </>
  );
}
