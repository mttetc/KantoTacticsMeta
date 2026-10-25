import Link from "next/link";
import { Sprite } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2, int } from "@/lib/format";
import { compVersions } from "@/lib/comp-family";
import type { Comp, Meta } from "@/lib/types";
import { unitDex, unitName } from "@/server/meta";

/**
 * The other versions of a comp (same title, a unit or two apart), best first. The units a version does not
 * share with the one on screen are shown in full; the shared ones fade, so the difference reads at a glance.
 */
export function CompVersions({ meta, comp }: { meta: Meta; comp: Comp }) {
  const versions = compVersions(meta.comps, comp).filter((c) => !c.coreOnly);
  if (versions.length < 2) return null;
  const here = new Set(comp.units.map((u) => u.line));
  return (
    <div className={ui.sec}>
      <h2 className={ui.secTitle}>
        Versions<small>{versions.length} builds of this comp · best first · faded units are the ones they share with this one</small>
      </h2>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {versions.map((v) => {
          const current = v.id === comp.id;
          return (
            <li key={v.id}>
              <Link
                href={`/comps/${v.slug}`}
                aria-current={current ? "page" : undefined}
                className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border-2 px-2 py-1.5 text-inherit no-underline ${current ? "border-gold bg-gold/8" : "border-transparent hover:border-line hover:bg-white/3"}`}
              >
                <TierBadge tier={v.tier} variant="row" />
                <span className="flex flex-wrap items-center gap-1">
                  {v.units.map((u) => {
                    const shared = here.has(u.line);
                    return (
                      <Sprite
                        key={u.line}
                        dex={unitDex(meta, u.line, u.star)}
                        name={`${unitName(meta, u.line, u.star)}${shared ? "" : " · only in this version"}`}
                        cost={meta.lines[u.line]?.cost}
                        size={36}
                        anim={false}
                        className={current || !shared ? "" : "opacity-35"}
                      />
                    );
                  })}
                </span>
                <span className="flex flex-col items-end leading-[1.05] tabular-nums">
                  <b className="text-[1.1em]">{fmt2(v.avg)}</b>
                  <small className="text-[.76em] whitespace-nowrap text-dim">{int(v.ne)} games</small>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
