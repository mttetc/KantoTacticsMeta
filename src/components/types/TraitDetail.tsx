import Link from "next/link";
import { RelatedComps } from "@/components/comps/RelatedComps";
import { Sprite, TypeIcon } from "@/components/ui/Sprite";
import { StatsRow } from "@/components/ui/Stats";
import { typeColor, ui } from "@/components/ui/styles";
import type { Meta, Trait, TraitStat } from "@/lib/types";
import { bestComps, lineDex, lineName } from "@/server/meta";

export function TraitDetail({ meta, stat, trait }: { meta: Meta; stat: TraitStat; trait: Trait }) {
  const users = meta.units.filter((u) => meta.lines[u.line]?.types.includes(stat.type)).sort((a, b) => a.avg - b.avg);
  const comps = bestComps(meta, (c) => c.traits.some((t) => t.type === stat.type && t.level >= stat.level && (t.share ?? 0) >= 50));
  const maxUse = Math.max(...meta.traits.map((t) => t.use));
  return (
    <>
      <div className={ui.detail}>
        <span className="grid h-[84px] w-[84px] place-items-center rounded-2xl border-2 border-ink bg-surface">
          <TypeIcon type={stat.type} name={trait.name} size={72} />
        </span>
        <div>
          <div className={ui.strip}>
            {trait.thresholds.map((th, i) => (
              <span key={th} className={ui.trait} style={i + 1 === stat.level ? { borderColor: typeColor(stat.type), color: typeColor(stat.type) } : undefined}>
                {th} units · {trait.desc.replace("{v}", String(trait.values[i]))}
              </span>
            ))}
          </div>
          {users.length > 0 && (
            <p className="flex flex-wrap items-center gap-1">
              <b>{trait.name} Pokémon</b>{" "}
              {users.map((u) => (
                <Link key={u.line} href={`/pokemon/${u.line}`} title={lineName(meta, u.line)} className="group">
                  <Sprite dex={lineDex(meta, u.line)} name={lineName(meta, u.line)} cost={meta.lines[u.line]?.cost} size={38} anim={false} />
                </Link>
              ))}
            </p>
          )}
          <StatsRow s={stat} maxUse={maxUse} />
          {stat.onlyRules && <p className={ui.note}>Only rules v{stat.onlyRules} counted.</p>}
        </div>
      </div>
      <RelatedComps meta={meta} title={`Best comps with ${trait.name} ${stat.level}+`} comps={comps} />
    </>
  );
}
