import Link from "next/link";
import { ItemIcon, Sprite } from "@/components/ui/Sprite";
import { StatsRow } from "@/components/ui/Stats";
import { TypeChip } from "@/components/ui/TypeChip";
import { fmt2, int, pct, stars } from "@/lib/format";
import { MIN_NE } from "@/lib/tiers";
import type { Comp, Meta } from "@/lib/types";
import { itemName, lineDex, lineName, typeName, unitDex, unitName } from "@/server/meta";
import { Board } from "./Board";
import s from "./comps.module.css";

const ROLE_ORDER = { carry: 0, sub: 1, tank: 2, holder: 3 } as const;
const rank = (r: Comp["units"][number]["role"]) => (r ? ROLE_ORDER[r] : 4);

/** Everything the API knows about one comp. Server component, static per Meta refresh. */
export function CompDetail({ meta, comp: c }: { meta: Meta; comp: Comp }) {
  const maxUse = Math.max(...meta.comps.map((x) => x.use));
  if (c.coreOnly) {
    return (
      <>
        <div className="strip">{c.traits.map((t) => <TypeChip key={t.type} type={t.type} name={typeName(meta, t.type)} level={t.level} />)}</div>
        <StatsRow s={c} maxUse={maxUse} />
        <div className="sec">
          <h2>
            Core units<small>{int(c.n)} games only: the API publishes the 4 core units and each unit&apos;s usual items across all comps, not this comp&apos;s board</small>
          </h2>
          <div className={s.team}>
            {c.units.map((u) => (
              <Link key={u.line} className={`unit ${s.u}`} href={`/pokemon/${u.line}`} title={lineName(meta, u.line)}>
                <Sprite dex={lineDex(meta, u.line)} name={lineName(meta, u.line)} cost={meta.lines[u.line]?.cost} size={66} items={u.items.slice(0, 3).map((i) => ({ id: i.id, name: itemName(meta, i.id) }))} itemSize={24} />
                <small>{lineName(meta, u.line)}</small>
              </Link>
            ))}
          </div>
          <p className="note">
            Average place {fmt2(c.avg)} ± {fmt2(c.ic)}: with so few games, trust the interval, not the average.
          </p>
        </div>
      </>
    );
  }

  const ordered = [...c.units].sort((a, b) => rank(a.role) - rank(b.role) || (b.share ?? 0) - (a.share ?? 0));
  const holders = ordered.filter((u) => u.items.length > 0);
  return (
    <>
      <div className="strip">{c.traits.map((t) => <TypeChip key={t.type} type={t.type} name={typeName(meta, t.type)} level={t.level} share={t.share} />)}</div>
      <StatsRow s={c} maxUse={maxUse} />
      {c.apiTier !== c.tier && (
        <p className="note" style={{ margin: 0 }}>
          Game tier {c.apiTier}; here {c.tier} because the tier uses avg + CI ({fmt2(c.score)}) against the reference {fmt2(meta.ref)}.
        </p>
      )}
      {c.ne < MIN_NE && <p className="note" style={{ margin: 0 }}>Only {int(c.ne)} effective games: a small sample, read the interval.</p>}
      {c.keyItems.length > 0 && (
        <div className="key-items">
          <span style={{ color: "var(--dim)", fontSize: ".84em", marginRight: 4 }}>Key items</span>
          {c.keyItems.map((k) => (
            <Link key={`${k.id}-${k.line}`} className="key-item" href={`/items/${k.id}`}>
              <ItemIcon id={k.id} name={itemName(meta, k.id)} size={30} />
              {itemName(meta, k.id)}
              <i>on</i>
              <Sprite dex={unitDex(meta, k.line, k.star)} name={unitName(meta, k.line, k.star)} cost={meta.lines[k.line]?.cost} size={22} anim={false} />
              <i>{Math.round(k.share)} %</i>
            </Link>
          ))}
        </div>
      )}

      <div className="sec">
        <h2>
          Final team<small>share of games with that unit · carry first</small>
        </h2>
        <div className={s.team}>
          {ordered.map((u) => {
            const lead = u.role === "carry";
            const color = u.role === "carry" ? "var(--gold-hi)" : u.role === "sub" ? "#e3e9f0" : u.role === "tank" ? "#96f2d7" : undefined;
            return (
              <Link key={u.line} className={`unit ${s.u} ${lead ? s.lead : ""}`} href={`/pokemon/${u.line}`} title={`${unitName(meta, u.line, u.star)} · in ${pct(u.share)} of games`}>
                <span className="stars">{stars(u.star)}</span>
                <Sprite
                  dex={unitDex(meta, u.line, u.star)}
                  name={unitName(meta, u.line, u.star)}
                  cost={meta.lines[u.line]?.cost}
                  size={lead ? 80 : 66}
                  role={u.role}
                  tag
                  items={u.items.slice(0, 3).map((i) => ({ id: i.id, name: itemName(meta, i.id) }))}
                  itemSize={lead ? 28 : 24}
                />
                <small style={color ? { color, fontWeight: 700 } : undefined}>{unitName(meta, u.line, u.star)}</small>
                <small style={{ color: "var(--txt)" }}>{Math.round(u.share ?? 0)} %</small>
              </Link>
            );
          })}
        </div>
        {holders.length > 0 && (
          <ul className={s.carries}>
            {holders.map((u) => {
              const its = [...u.items].sort((a, b) => b.share - a.share);
              return (
                <li key={u.line} className={u.role && u.role !== "holder" ? s[u.role] : ""}>
                  <b>
                    <Sprite dex={unitDex(meta, u.line, u.star)} name={unitName(meta, u.line, u.star)} cost={meta.lines[u.line]?.cost} size={38} anim={false} />
                    {unitName(meta, u.line, u.star)}
                    {u.role && u.role !== "holder" ? ` · ${u.role}` : ""}
                  </b>
                  <span className={s.its}>
                    {its.map((i, k) => (
                      <Link key={i.id} className={k === 0 ? s.key : ""} href={`/items/${i.id}`}>
                        <ItemIcon id={i.id} name={itemName(meta, i.id)} size={22} />
                        {itemName(meta, i.id)}
                        <i>{Math.round(i.share)} %</i>
                      </Link>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="cols">
        <Board meta={meta} comp={c} />
        {c.guide && (
          <div className="sec">
            <h2>
              Stage by stage<small>real games</small>
            </h2>
            <div className={s.levels}>
              {c.guide.stages.map((st) => (
                <div className={s.level} key={st.stage}>
                  <div>
                    End of stage <b>{st.stage}</b>
                    <small>{int(st.n)} games</small>
                  </div>
                  <div className="strip">
                    {st.units.map((u) => (
                      <span key={u.line} className={`mini ${u.fresh ? "fresh" : ""}`} title={`${unitName(meta, u.line, u.star)} · ${pct(u.share)}`}>
                        <span className="stars">{u.star ? stars(u.star) : "·"}</span>
                        <Sprite dex={unitDex(meta, u.line, u.star ?? 1)} name={unitName(meta, u.line, u.star ?? 1)} cost={meta.lines[u.line]?.cost} size={42} anim={false} />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={s.legendNew}>
              <i /> New at this stage
            </div>
          </div>
        )}
      </div>

      {c.variants.length > 0 && (
        <div className="sec">
          <h2>
            Variants<small>the 4 core units players pair with this comp</small>
          </h2>
          {c.variants.slice(0, 8).map((v) => (
            <div className={s.variant} key={v.cores.join()}>
              <span className="strip">
                {v.cores.map((l) => (
                  <Sprite key={l} dex={lineDex(meta, l)} name={lineName(meta, l)} cost={meta.lines[l]?.cost} size={42} anim={false} />
                ))}
              </span>
              <span>{pct(v.share)} of games</span>
              <span>
                avg <b>{fmt2(v.avg)}</b>
              </span>
              <span>
                top 4 <b>{pct(v.top4)}</b>
              </span>
            </div>
          ))}
        </div>
      )}
      {c.onlyRules && <p className="note">Only rules v{c.onlyRules} counted for this comp.</p>}
    </>
  );
}
