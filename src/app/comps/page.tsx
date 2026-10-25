import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { CompRow } from "@/components/comps/CompRow";
import { CompsSearch } from "@/components/comps/CompsSearch";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ui } from "@/components/ui/styles";
import { COMP_SORTS, compareComps, compParams, COMPS_PAGE_SIZE, compsHref, parseCompFilters, type CompFilters, type CompSearchParams, type CompSort } from "@/lib/comps-filters";
import { groupVariants } from "@/lib/comp-family";
import { int } from "@/lib/format";
import { matchesAll, searchWords } from "@/lib/search";
import { MIN_NE, TIERS } from "@/lib/tiers";
import type { Comp } from "@/lib/types";
import { META_TAG } from "@/server/api";
import { getMeta, itemName, lineName, typeName, unitName } from "@/server/meta";
import { compsStartingWith } from "@/server/queries";

export const metadata: Metadata = {
  title: "Comps",
  description: "The comps winning Kanto Tactics Ranked this week, graded S to D on average place with confidence, with carry, key items, placement and stage guide.",
  alternates: { canonical: "/comps" },
};

/**
 * Filters live in the URL: the chips are plain links, the search box replaces the URL from the client (a soft
 * navigation, no reload). The panel is static; the list streams at request time for the given search params.
 */
export default function CompsPage({ searchParams }: { searchParams: Promise<CompSearchParams> }) {
  return (
    <>
      <PanelHead subtitle="Comps · what is winning in Ranked right now" />
      <PanelBody>
        <Suspense fallback={<ListSkeleton />}>
          <CompList searchParams={searchParams} />
        </Suspense>
      </PanelBody>
    </>
  );
}

/** Reads the URL (runtime), then hands plain values to the cached list below. */
async function CompList({ searchParams }: { searchParams: Promise<CompSearchParams> }) {
  return <CachedCompList f={parseCompFilters(await searchParams)} />;
}

/**
 * The list for one combination of filters, cached and shared by every visitor: a click on a filter chip is a
 * cache hit after the first visitor, and the cached result can ride along in the link's prefetch.
 */
async function CachedCompList({ f }: { f: CompFilters }) {
  "use cache";
  cacheTag(META_TAG);
  // hard expiry: once stale the list is rebuilt before being served, on the model's current data
  cacheLife({ stale: 300, revalidate: 3600, expire: 3600 });
  const meta = await getMeta();

  const { sort, tier, small, q, page, from, stage } = f;
  const hay = (c: Comp) =>
    `${c.title} ${c.units.map((u) => unitName(meta, u.line, u.star)).join(" ")} ${c.units.flatMap((u) => u.items.map((i) => itemName(meta, i.id))).join(" ")} ${c.traits.map((t) => typeName(meta, t.type)).join(" ")}`;
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
            {COMP_SORTS[k]}
          </Link>
        ))}
        <span className={ui.sep} />
        <span className="mr-0.5">Tier</span>
        {TIERS.map((t) => (
          <Link key={t} className={chip(tier === t)} href={href({ tier: tier === t ? "all" : t })} aria-current={tier === t ? "true" : undefined}>
            {t}
          </Link>
        ))}
        <Link className={chip(tier === "all")} href={href({ tier: "all" })}>
          All
        </Link>
        <span className={ui.sep} />
        <Link className={chip(small)} href={href({ small: !small })} title={`Comps under ${MIN_NE} effective games: the API only gives their 4 core units, no board detail`}>
          {small ? "Hide comps under 30 games" : `Include comps under 30 games (${int(smallCount)})`}
        </Link>
        <CompsSearch q={q} base={Object.fromEntries(compParams({ ...f, q: "" }))} />
      </div>
      {fromLine && (
        <p className={`${ui.note} mt-0 mb-2.5 flex flex-wrap items-center gap-2 text-[.9em]`}>
          Final comps whose end-of-stage-{stage} board fields <b className="text-txt">{lineName(meta, fromLine)}</b>.
          <Link className={ui.chip} href="/comps">
            × Clear
          </Link>
          <Link className={ui.chip} href="/game-plan">
            ‹ Game plan
          </Link>
        </p>
      )}
      <p className={`${ui.note} mt-0 mb-2.5`}>
        {int(groups.length)} comps{tier !== "all" && !fromLine ? ` in tier ${tier}` : ""}
        {folded > 0 ? `, ${int(folded)} other versions folded under their best build` : ""}. &ldquo;Best&rdquo; sorts on avg + CI, the same number as the tier, so a noisy comp never jumps above a steady one. Gold ring = carry, silver = sub, green = tank.
      </p>
      {shown.length === 0 ? (
        <div className={ui.empty}>No comp matches. Try another tier or include the small samples.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((g, i) => (
            <CompRow key={g.comp.id} meta={meta} comp={g.comp} index={i} variants={g.variants} />
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav className="mt-3 flex items-center justify-center gap-2 text-[.9em] text-dim" aria-label="Pages">
          {page > 1 && (
            <Link className={ui.btn} href={href({ page: page - 1 })}>
              ‹ Previous
            </Link>
          )}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link className={ui.btn} href={href({ page: page + 1 })}>
              Next ›
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
