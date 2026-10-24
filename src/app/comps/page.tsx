import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CompRow } from "@/components/comps/CompRow";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ui } from "@/components/ui/styles";
import { int } from "@/lib/format";
import { MIN_NE, TIERS } from "@/lib/tiers";
import type { Comp, Tier } from "@/lib/types";
import { getMeta, itemName, typeName, unitName } from "@/server/meta";

export const metadata: Metadata = {
  title: "Comps",
  description: "The comps winning Kanto Tactics Ranked this week, graded S to D on average place with confidence, with carry, key items, placement and stage guide.",
  alternates: { canonical: "/comps" },
};

const PAGE = 40;
const SORTS = { best: "Best", played: "Most played", wins: "Most wins" } as const;
type Sort = keyof typeof SORTS;
type Search = Promise<{ sort?: string; tier?: string; small?: string; q?: string; page?: string }>;

/**
 * Filters live in the URL and are plain links, so the list needs no client JavaScript.
 * The panel is static; the list streams at request time for the given search params.
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

async function CompList({ searchParams }: { searchParams: Search }) {
  const [meta, sp] = await Promise.all([getMeta(), searchParams]);
  const sort: Sort = sp.sort && sp.sort in SORTS ? (sp.sort as Sort) : "best";
  const tier = sp.tier === "all" ? "all" : TIERS.includes(sp.tier as Tier) ? (sp.tier as Tier) : "S";
  const small = sp.small === "1";
  const q = (sp.q ?? "").trim().toLowerCase();
  const page = Math.max(1, Number(sp.page) || 1);

  const hay = (c: Comp) =>
    `${c.title} ${c.units.map((u) => unitName(meta, u.line, u.star)).join(" ")} ${c.units.flatMap((u) => u.items.map((i) => itemName(meta, i.id))).join(" ")} ${c.traits.map((t) => typeName(meta, t.type)).join(" ")}`.toLowerCase();
  let list = meta.comps.filter((c) => (small || c.reliable) && (tier === "all" || c.tier === tier));
  if (q) {
    const words = q.split(/\s+/);
    list = list.filter((c) => {
      const h = hay(c);
      return words.every((w) => h.includes(w));
    });
  }
  list.sort((a, b) => (sort === "best" ? a.score - b.score : sort === "played" ? b.use - a.use : b.win - a.win));
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
        <form action="/comps" method="get" className="ml-auto flex gap-1.5">
          {sort !== "best" && <input type="hidden" name="sort" value={sort} />}
          {tier !== "S" && <input type="hidden" name="tier" value={tier} />}
          {small && <input type="hidden" name="small" value="1" />}
          <input className={`${ui.chip} min-w-[220px]`} type="search" name="q" defaultValue={q} placeholder="Search a Pokémon, item or type…" aria-label="Search comps" />
        </form>
      </div>
      <p className={`${ui.note} mt-0 mb-2.5`}>
        {int(list.length)} comps{tier !== "all" ? ` in tier ${tier}` : ""}. &ldquo;Best&rdquo; sorts on avg + CI, the same number as the tier, so a noisy comp never jumps above a steady one. Gold ring = carry, silver = sub, green = tank.
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
