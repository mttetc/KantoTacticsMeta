import Link from "next/link";
import { Sprite } from "@/components/ui/Sprite";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2, int, pct, stars } from "@/lib/format";
import { MIN_NE } from "@/lib/tiers";
import type { Comp, Meta } from "@/lib/types";
import { itemName, unitDex, unitName } from "@/server/meta";
import { CompTitle } from "./CompTitle";
import s from "./comps.module.css";

/** One comp in a list, like the game's Meta rows. The whole row links to the comp page. */
export function CompRow({ meta, comp: c, index = 0 }: { meta: Meta; comp: Comp; index?: number }) {
  const few = !c.coreOnly && c.ne < MIN_NE;
  return (
    <article className={s.card} style={{ "--d": `${(0.05 + Math.min(index, 12) * 0.05).toFixed(2)}s` } as React.CSSProperties}>
      <Link className={s.row} href={`/comps/${c.slug}`} prefetch>
        <TierBadge tier={c.tier} variant="row" />
        <span className={s.main}>
          <span className={s.title}>
            <h3>
              <CompTitle meta={meta} comp={c} />
            </h3>
            {c.use >= 2 && <span className={s.pop}>🔥 {pct(c.use)}</span>}
            {few && <span className={s.few}>{int(c.ne)} games</span>}
            {c.coreOnly && (
              <span className={`${s.few} ${s.core}`} title={`Fewer than ${MIN_NE} games: the API only gives the 4 core units, with each unit's usual items, no stars or board`}>
                core only · {int(c.n)} games
              </span>
            )}
          </span>
          <span className={s.units}>
            {c.units.map((u) => {
              const lead = u.role === "carry";
              const showItems = u.role != null || (c.coreOnly && u.items.length > 0);
              return (
                <span key={u.line} className={`mini ${lead ? s.lead : ""} ${c.coreOnly ? s.dim : ""}`}>
                  <span className="stars">{c.coreOnly ? "" : stars(u.star)}</span>
                  <Sprite
                    dex={unitDex(meta, u.line, u.star)}
                    name={unitName(meta, u.line, u.star)}
                    cost={meta.lines[u.line]?.cost}
                    size={lead ? 54 : 42}
                    role={u.role}
                    tag
                    items={showItems ? u.items.slice(0, lead ? 3 : 2).map((i) => ({ id: i.id, name: itemName(meta, i.id) })) : undefined}
                    itemSize={lead ? 22 : 18}
                  />
                </span>
              );
            })}
          </span>
        </span>
        <span className={s.avg}>
          <b>{fmt2(c.avg)}</b>
          <small>avg place</small>
        </span>
        <span className={s.chev} aria-hidden>
          ›
        </span>
      </Link>
    </article>
  );
}
