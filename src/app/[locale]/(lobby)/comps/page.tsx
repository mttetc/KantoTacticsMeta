import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CompRow } from "@/components/comps/CompRow";
import { CompsSearch } from "@/components/comps/CompsSearch";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ui } from "@/components/ui/styles";
import { alternates } from "@/i18n/links";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { COMP_SORTS, compareComps, compParams, COMPS_PAGE_SIZE, compsHref, parseCompFilters, type CompFilters, type CompSearchParams, type CompSort } from "@/lib/comps-filters";
import { groupVariants } from "@/lib/comp-family";
import { matchesAll, searchWords } from "@/lib/search";
import { MIN_NE, TIERS } from "@/lib/tiers";
import type { Comp } from "@/lib/types";
import { getMeta, itemName, lineName, typeName, unitName } from "@/server/meta";
import { compsStartingWith } from "@/server/queries";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("comps")]);
  return { title: t("title"), description: t("description"), alternates: alternates(locale as Locale, "/comps") };
}

/**
 * Filters live in the URL: the chips are plain links, the search box replaces the URL from the client (a soft
 * navigation, no reload). The panel is static; the list streams at request time for the given search params.
 */
export default async function CompsPage({ searchParams }: { searchParams: Promise<CompSearchParams> }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("comps")]);
  return (
    <>
      <PanelHead title={t("title")} subtitle={t("subtitle")} />
      <PanelBody>
        <Suspense fallback={<ListSkeleton />}>
          <CompList searchParams={searchParams} locale={locale as Locale} />
        </Suspense>
      </PanelBody>
    </>
  );
}

/**
 * Reads the URL at request time and renders the list for those filters: the model is in memory, so the list is a
 * filter and a sort, cheaper than a cache entry per combination.
 */
async function CompList({ searchParams, locale }: { searchParams: Promise<CompSearchParams>; locale: Locale }) {
  const f = parseCompFilters(await searchParams);
  const [meta, t] = await Promise.all([getMeta(locale), getTranslations({ locale, namespace: "comps" })]);

  const { sort, tier, small, q, page, from, stage } = f;
  const hay = (c: Comp) =>
    `${c.title} ${c.units.map((u) => unitName(meta, u.line, u.star)).join(" ")} ${c.units.flatMap((u) => u.items.map((i) => itemName(meta, i.id))).join(" ")} ${c.traits.map((x) => typeName(meta, x.type)).join(" ")}`;
  const fromLine = from && meta.lines[from] ? from : "";
  const inTier = (c: Comp) => tier === "all" || c.tier === tier;
  const words = searchWords(q);
  const list = (fromLine ? compsStartingWith(meta, fromLine, stage) : meta.comps.filter((c) => (small || c.reliable) && inTier(c))).filter((c) => matchesAll(hay(c), words)).sort(compareComps[sort]);
  const smallCount = meta.comps.filter((c) => !c.reliable && inTier(c)).length;
  // one row per comp family: its best version, the others folded under it
  const groups = groupVariants(list);
  const folded = list.length - groups.length;
  const pages = Math.max(1, Math.ceil(groups.length / COMPS_PAGE_SIZE));
  const shown = groups.slice((page - 1) * COMPS_PAGE_SIZE, page * COMPS_PAGE_SIZE);
  const href = (patch: Partial<CompFilters>) => compsHref(f, patch);
  const chip = (on: boolean) => `${ui.chip} ${on ? ui.chipOn : ""}`;

  return (
    <>
      <div className={ui.sort}>
        {(Object.keys(COMP_SORTS) as CompSort[]).map((k) => (
          <Link key={k} className={chip(sort === k)} href={href({ sort: k })} aria-current={sort === k ? "true" : undefined}>
            {t(`sort.${k}`)}
          </Link>
        ))}
        <span className={ui.sep} />
        <span className="mr-0.5">{t("tier")}</span>
        {TIERS.map((x) => (
          <Link key={x} className={chip(tier === x)} href={href({ tier: tier === x ? "all" : x })} aria-current={tier === x ? "true" : undefined}>
            {x}
          </Link>
        ))}
        <Link className={chip(tier === "all")} href={href({ tier: "all" })}>
          {t("all")}
        </Link>
        <span className={ui.sep} />
        <Link className={chip(small)} href={href({ small: !small })} title={t("smallTitle", { n: MIN_NE })}>
          {small ? t("hideSmall", { n: MIN_NE }) : t("includeSmall", { n: MIN_NE, count: smallCount })}
        </Link>
        <CompsSearch q={q} base={Object.fromEntries(compParams({ ...f, q: "" }))} />
      </div>
      {fromLine && (
        <p className={`${ui.note} mt-0 mb-2.5 flex flex-wrap items-center gap-2 text-[.9em]`}>
          {t.rich("fromLine", { stage, name: lineName(meta, fromLine), b: (c) => <b className="text-txt">{c}</b> })}
          <Link className={ui.chip} href="/comps">
            {t("clear")}
          </Link>
          <Link className={ui.chip} href="/game-plan">
            {t("toGamePlan")}
          </Link>
        </p>
      )}
      <p className={`${ui.note} mt-0 mb-2.5`}>
        {t("count", { n: groups.length })}
        {tier !== "all" && !fromLine ? t("inTier", { tier }) : ""}
        {folded > 0 ? t("folded", { n: folded }) : ""}. {t("legend")}
      </p>
      {shown.length === 0 ? (
        <div className={ui.empty}>{t("empty")}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((g, i) => (
            <CompRow key={g.comp.id} meta={meta} comp={g.comp} index={i} variants={g.variants} />
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav className="mt-3 flex items-center justify-center gap-2 text-[.9em] text-dim" aria-label={t("pagesLabel")}>
          {page > 1 && (
            <Link className={ui.btn} href={href({ page: page - 1 })}>
              {t("previous")}
            </Link>
          )}
          <span>{t("page", { page, pages })}</span>
          {page < pages && (
            <Link className={ui.btn} href={href({ page: page + 1 })}>
              {t("next")}
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className={`${ui.skeleton} min-h-[92px]`} />
      ))}
    </div>
  );
}
