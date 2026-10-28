import Link from "next/link";
import { Sprite } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2, int, pct, stars } from "@/lib/format";
import { MIN_NE } from "@/lib/tiers";
import type { Comp, Meta } from "@/lib/types";
import { itemName, unitDex, unitName } from "@/server/meta";
import { CompTitle } from "./CompTitle";

/** One comp in a list, like the game's Meta rows. The whole row links to the comp page; `variants` = other versions folded under it. */
export function CompRow({ meta, comp: c, index = 0, variants = 0 }: { meta: Meta; comp: Comp; index?: number; variants?: number }) {
  const few = !c.coreOnly && c.ne < MIN_NE;
  return (
    <article className={`${ui.card} animate-card-in overflow-hidden rounded-[14px] border-2 border-ink shadow-panel`} style={{ animationDelay: `${(0.05 + Math.min(index, 12) * 0.05).toFixed(2)}s` } as React.CSSProperties}>
      <Link href={`/comps/${c.slug}`} className="grid w-full grid-cols-[28px_minmax(0,1fr)_auto_12px] items-center gap-2 p-2 text-left text-inherit no-underline hover:bg-white/3 sm:grid-cols-[32px_minmax(0,1fr)_auto_14px] sm:gap-2.5 sm:p-2.5">
        <TierBadge tier={c.tier} variant="row" />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="flex min-w-0 flex-wrap items-center gap-1.5">
            <h3 className="m-0 truncate text-[1em] font-bold">
              <CompTitle meta={meta} comp={c} />
            </h3>
            {c.use >= 2 && <span className="inline-flex items-center gap-[3px] rounded-full border border-ink bg-[#ffc078] px-2 pl-1.5 text-[.74em] font-bold text-ink">🔥 {pct(c.use)}</span>}
            {few && <span className="rounded-full border border-dashed border-line px-2 text-[.74em] text-dim">{int(c.ne)} games</span>}
            {variants > 0 && (
              <span className="rounded-full border border-line bg-black/20 px-2 text-[.74em] text-dim" title="Other builds of this comp, a unit or two apart, listed on its page">
                +{variants} {variants === 1 ? "version" : "versions"}
              </span>
            )}
            {c.coreOnly && (
              <span className="rounded-full border border-[#ffe06666] px-2 text-[.74em] text-gold-hi" title={`Fewer than ${MIN_NE} games: the API only gives the 4 core units, with each unit's usual items, no stars or board`}>
                core only · {int(c.n)} games
              </span>
            )}
          </span>
          {/* top padding leaves room for the CARRY / SUB / TANK tags above the stars */}
          <span className="flex flex-wrap items-start gap-[3px] pt-5.5 pb-1.5">
            {c.units.map((u) => {
              const lead = u.role === "carry";
              const showItems = u.role != null || (c.coreOnly && u.items.length > 0);
              return (
                <span key={u.line} className={`group relative flex flex-col items-center ${lead ? "mx-1" : ""} ${c.coreOnly ? "opacity-55" : ""}`}>
                  <span className={ui.stars}>{c.coreOnly ? "" : stars(u.star)}</span>
                  <Sprite
                    dex={unitDex(meta, u.line, u.star)}
                    name={unitName(meta, u.line, u.star)}
                    cost={meta.lines[u.line]?.cost}
                    size={lead ? 72 : 60}
                    role={u.role}
                    tag
                    items={showItems ? u.items.slice(0, lead ? 3 : 2).map((i) => ({ id: i.id, name: itemName(meta, i.id) })) : undefined}
                    itemSize={lead ? 26 : 22}
                  />
                </span>
              );
            })}
          </span>
        </span>
        <span className="flex flex-col items-end leading-[1.05]">
          <b className="text-[1.3em] tabular-nums">{fmt2(c.avg)}</b>
          <small className="text-[.76em] whitespace-nowrap text-[#cfd6ee]">avg place</small>
        </span>
        <span className="text-[.8em] text-dim" aria-hidden>
          ›
        </span>
      </Link>
    </article>
  );
}
