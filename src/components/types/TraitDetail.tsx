import Link from "next/link";
import { RelatedComps } from "@/components/comps/RelatedComps";
import { Sprite, TypeIcon } from "@/components/ui/Sprite";
import { StatsRow } from "@/components/ui/Stats";
import { typeVar } from "@/components/ui/TypeChip";
import type { Meta, Trait, TraitStat } from "@/lib/types";
import { bestComps, lineDex, lineName } from "@/server/meta";

export function TraitDetail({ meta, stat, trait }: { meta: Meta; stat: TraitStat; trait: Trait }) {
  const users = meta.units.filter((u) => meta.lines[u.line]?.types.includes(stat.type)).sort((a, b) => a.avg - b.avg);
  const comps = bestComps(meta, (c) => c.traits.some((t) => t.type === stat.type && t.level >= stat.level && (t.share ?? 0) >= 50));
  const maxUse = Math.max(...meta.traits.map((t) => t.use));
  return (
    <>
      <div className="detail">
        <span className="mon" style={{ "--s": "84px", display: "grid", placeItems: "center", background: "var(--surface)" } as React.CSSProperties}>
          <TypeIcon type={stat.type} name={trait.name} size={72} />
        </span>
        <div>
          <div className="strip">
            {trait.thresholds.map((th, i) => (
              <span key={th} className={`trait ${i + 1 === stat.level ? "ty" : ""}`} style={typeVar(stat.type)}>
                {th} units · {trait.desc.replace("{v}", String(trait.values[i]))}
              </span>
            ))}
          </div>
          {users.length > 0 && (
            <p>
              <b>{trait.name} Pokémon</b>{" "}
              <span className="strip" style={{ display: "inline-flex", verticalAlign: "middle" }}>
                {users.map((u) => (
                  <Link key={u.line} href={`/pokemon/${u.line}`} title={lineName(meta, u.line)}>
                    <Sprite dex={lineDex(meta, u.line)} name={lineName(meta, u.line)} cost={meta.lines[u.line]?.cost} size={38} anim={false} />
                  </Link>
                ))}
              </span>
            </p>
          )}
          <StatsRow s={stat} maxUse={maxUse} />
          {stat.onlyRules && <p className="note">Only rules v{stat.onlyRules} counted.</p>}
        </div>
      </div>
      <RelatedComps meta={meta} title={`Best comps with ${trait.name} ${stat.level}+`} comps={comps} />
    </>
  );
}
