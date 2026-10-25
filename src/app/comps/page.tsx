import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CompRow } from "@/components/comps/CompRow";
import { CompsSearch } from "@/components/comps/CompsSearch";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ui } from "@/components/ui/styles";
import { int } from "@/lib/format";
import { MIN_NE, TIERS } from "@/lib/tiers";
import type { Comp, Tier } from "@/lib/types";
import { cacheLife, cacheTag } from "next/cache";
import { META_TAG } from "@/server/api";
import { compsStartingWith, getMeta, itemName, lineName, typeName, unitName } from "@/server/meta";

export const metadata: Metadata = {
  title: "Comps",
  description: "The comps winning Kanto Tactics Ranked this week, graded S to D on average place with confidence, with carry, key items, placement and stage guide.",
  alternates: { canonical: "/comps" },
};

const PAGE = 40;
const SORTS = { best: "Best", played: "Most played" } as const;
type Sort = keyof typeof SORTS;
type Search = Promise<{ sort?: string; tier?: string; small?: string; q?: string; page?: string; from?: string; stage?: string }>;

/**
 * Filters live in the URL: the chips are plain links, the search box replaces the URL from the client (a soft
 * navigation, no reload). The panel is static; the list streams at request time for the given search params.
 */
export default function CompsPage({ searchParams }: { searchParams: Search }) {
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
async function CompList({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const sort: Sort = sp.sort && sp.sort in SORTS ? (sp.sort as Sort) : "best";
  const tier = sp.tier === "all" ? "all" : TIERS.includes(sp.tier as Tier) ? (sp.tier as Tier) : "S";
  return <CachedCompList sort={sort} tier={sp.from ? "all" : tier} small={sp.small === "1"} q={(sp.q ?? "").trim().toLowerCase()} page={Math.max(1, Number(sp.page) || 1)} from={sp.from ?? ""} stage={sp.stage === "4" ? 4 : 3} />;
}

/**
 * The list for one combination of filters, cached and shared by every visitor: a click on a filter chip is a
 * cache hit after the first visitor, and the cached result can ride along in the link's prefetch.
 */
async function CachedCompList({ sort, tier, small, q, page, from, stage }: { sort: Sort; tier: Tier | "all"; small: boolean; q: string; page: number; from: string; stage: 3 | 4 }) {
  "use cache";
  cacheTag(META_TAG);
  // hard expiry: once stale the list is rebuilt before being served, on the model's current data
  cacheLife({ stale: 300, revalidate: 3600, expire: 3600 });
  const meta = await getMeta();

  const hay = (c: Comp) =>
    `${c.title} ${c.units.map((u) => unitName(meta, u.line, u.star)).join(" ")} ${c.units.flatMap((u) => u.items.map((i) => itemName(meta, i.id))).join(" ")} ${c.traits.map((t) => typeName(meta, t.type)).join(" ")}`.toLowerCase();
  const fromLine = from && meta.lines[from] ? from : "";
  let list = fromLine ? compsStartingWith(meta, fromLine, stage) : meta.comps.filter((c) => (small || c.reliable) && (tier === "all" || c.tier === tier));
  if (q) {
    const words = q.split(/\s+/);
    list = list.filter((c) => {
      const h = hay(c);
      return words.every((w) => h.includes(w));
    });
  }
  list.sort((a, b) => (sort === "best" ? a.score - b.score : b.use - a.use || a.score - b.score));
  const smallCount = meta.comps.filter((c) => !c.reliable && (tier === "all" || c.tier === tier)).length;
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const shown = list.slice((page - 1) * PAGE, page * PAGE);

  const href = (patch: Partial<{ sort: string; tier: string; small: string; q: string; page: number }>) => {
    const p = new URLSearchParams();
    const v = { sort, tier, small: small ? "1" : "", q, page: 1, ...patch };
    if (v.sort !== "best") p.set("sort", v.sort);
    if (v.tier !== "S") p.set("tier", v.tier);
    if (v.small) p.set("small", "1");
    if (v.q) p.set("q", v.q);
    if (v.page > 1) p.set("page", String(v.page));
    return `/comps${p.size ? `?${p}` : ""}`;
  };
  const chip = (on: boolean) => `${ui.chip} ${on ? ui.chipOn : ""}`;

  return (
    <>
      <div className={ui.sort}>
        {(Object.keys(SORTS) as Sort[]).map((k) => (
          <Link key={k} className={chip(sort === k)} href={href({ sort: k })} aria-current={sort === k ? "true" : undefined}>
            {SORTS[k]}
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
        <Link className={chip(small)} href={href({ small: small ? "" : "1" })} title={`Comps under ${MIN_NE} effective games: the API only gives their 4 core units, no board detail`}>
          {small ? "Hide comps under 30 games" : `Include comps under 30 games (${int(smallCount)})`}
        </Link>
        <CompsSearch q={q} base={{ ...(sort !== "best" ? { sort } : {}), ...(tier !== "S" ? { tier } : {}), ...(small ? { small: "1" } : {}), ...(from ? { from, stage: String(stage) } : {}) }} />
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
        {int(list.length)} comps{tier !== "all" && !fromLine ? ` in tier ${tier}` : ""}. &ldquo;Best&rdquo; sorts on avg + CI, the same number as the tier, so a noisy comp never jumps above a steady one. Gold ring = carry, silver = sub, green = tank.
      </p>
      {shown.length === 0 ? (
        <div className={ui.empty}>No comp matches. Try another tier or include the small samples.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((c, i) => (
            <CompRow key={c.id} meta={meta} comp={c} index={i} />
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
