import Link from "next/link";
import { TierBadge } from "@/components/ui/TierBadge";
import { CompThumbs } from "@/components/comps/CompThumbs";
import { CompTitle } from "@/components/comps/CompTitle";
import { fmt2, int, pct } from "@/lib/format";
import { COMP_THRESHOLDS, D_GAP, MIN_NE, TIER_HELP } from "@/lib/tiers";
import type { Meta } from "@/lib/types";
import { lineDex, lineName } from "@/server/meta";
import { Sprite } from "@/components/ui/Sprite";
import s from "./layout.module.css";

/** Left panel: the window, how tiers are read, the shop odds. All static per Meta refresh. */
export function LeftPanel({ meta: m }: { meta: Meta }) {
  const levels = Object.keys(m.pvp.odds)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((l) => l >= 3);
  return (
    <aside className={`${s.side} ${s.left}`} aria-label="Snapshot and rules">
      <div className={s.sticky}>
        <section>
          <h2>
            Snapshot<small>{m.from} → {m.to}</small>
          </h2>
          <div className={s.blk}>
            <div className={s.kv}><span>Player seats</span><b>{int(m.seats)}</b></div>
            <div className={s.kv}><span>≈ Games (8 players)</span><b>{int(m.games)}</b></div>
            <div className={s.kv}><span>Reference place</span><b>{fmt2(m.ref)}</b></div>
            {m.versions.map((v) => (
              <div className={s.kv} key={v.rules}>
                <span>
                  Rules v{v.rules} <small>{v.from}{v.from !== v.to ? ` → ${v.to}` : ""}</small>
                </span>
                <b>{int(v.n)}</b>
              </div>
            ))}
            <div className={s.kv}><span>Generated</span><b>{m.generated.slice(0, 10)}</b></div>
          </div>
        </section>
        <section>
          <h2>
            Tiers<small>average place vs. reference</small>
          </h2>
          <div className={`${s.blk} ${s.legend}`}>
            <div><TierBadge tier="S" /><span>≤ <b>{fmt2(m.ref + m.thresholds.tiers.S)}</b> · {TIER_HELP.S}</span></div>
            <div><TierBadge tier="A" /><span>≤ <b>{fmt2(m.ref + m.thresholds.tiers.A)}</b> · {TIER_HELP.A}</span></div>
            <div><TierBadge tier="B" /><span>≤ <b>{fmt2(m.ref + m.thresholds.tiers.B)}</b> · {TIER_HELP.B}</span></div>
            <div><TierBadge tier="C" /><span>&lt; <b>{fmt2(m.ref + D_GAP)}</b> · {TIER_HELP.C}</span></div>
            <div><TierBadge tier="D" /><span>≥ <b>{fmt2(m.ref + D_GAP)}</b> · {TIER_HELP.D}</span></div>
            <p className="note" style={{ margin: "4px 0 0" }}>
              Pokémon, items, types: the game&apos;s tiers (the API stops at C; D is this page&apos;s split, mirroring S). <b style={{ color: "var(--txt)" }}>Comps</b> are graded stricter, on the
              pessimistic average (avg + CI) against the reference: S ≤ {fmt2(m.ref + COMP_THRESHOLDS.S)}, A ≤ {fmt2(m.ref + COMP_THRESHOLDS.A)}, B ≤ {fmt2(m.ref + COMP_THRESHOLDS.B)}, C ≤{" "}
              {fmt2(m.ref + COMP_THRESHOLDS.C)}, D above. A noisy sample cannot be S. Comps under {MIN_NE} effective games are hidden by default.
            </p>
          </div>
        </section>
        <section>
          <h2>
            Shop odds<small>% per slot, by level</small>
          </h2>
          <div className={s.blk}>
            <table className={s.odds}>
              <thead>
                <tr>
                  <th>Lv</th>
                  {[1, 2, 3, 4, 5].map((c) => (
                    <th key={c} style={{ "--cc": `var(--c${c})` } as React.CSSProperties}>
                      <span className={s.dot} /><span className="sr-only">cost {c}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {levels.map((l) => (
                  <tr key={l}>
                    <td><b>{l}</b></td>
                    {m.pvp.odds[l].map((o, i) => (
                      <td key={i} style={{ "--cc": `var(--c${i + 1})` } as React.CSSProperties}>
                        {o ? o : <span style={{ opacity: 0.35 }}>–</span>}
                        <i style={{ width: `${o}%` }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note" style={{ margin: "6px 0 0" }}>
              Pool: {[1, 2, 3, 4, 5].map((c, i) => (
                <span key={c}>
                  {i > 0 && " · "}
                  <b style={{ color: `var(--c${c})` }}>{m.pvp.pool[c]}</b>
                </span>
              ))}{" "}
              copies per Pokémon by cost. Reroll {m.pvp.rerollCost} gold. A cost 4 carry is 12 % per slot at level 7, 26 % at level 8, when cost 5 appears.
            </p>
          </div>
        </section>
      </div>
    </aside>
  );
}

/** Right panel: the week's leaderboard of comps and Pokémon, like the lobby's ranking panel. */
export function RightPanel({ meta: m }: { meta: Meta }) {
  const pool = m.comps.filter((c) => c.reliable);
  const best = [...pool].sort((a, b) => a.score - b.score).slice(0, 8);
  const played = [...pool].sort((a, b) => b.use - a.use).slice(0, 5);
  const mons = [...m.units].sort((a, b) => a.avg - b.avg).slice(0, 5);
  const Row = ({ c, i, value, label }: { c: (typeof best)[number]; i: number; value: string; label: string }) => (
    <li>
      <span className={`num ${["g", "s", "b"][i] ?? ""}`}>{i + 1}</span>
      <Link className="who" href={`/comps/${c.slug}`}>
        <b>
          <TierBadge tier={c.tier} />
          <span className="t">
            <CompTitle meta={m} comp={c} />
          </span>
        </b>
        <span className="mons">
          <CompThumbs meta={m} comp={c} max={8} />
        </span>
      </Link>
      <span className="pill" title={label}>{value}</span>
    </li>
  );
  return (
    <aside className={`${s.side} ${s.right}`} aria-label="Top of the week">
      <div className={s.sticky}>
        <section>
          <h2>👑 Best comps<small>avg + CI</small></h2>
          <ul className="rank">{best.map((c, i) => <Row key={c.id} c={c} i={i} value={fmt2(c.avg)} label="average place" />)}</ul>
        </section>
        <section>
          <h2>🔥 Most played<small>usage</small></h2>
          <ul className="rank">{played.map((c, i) => <Row key={c.id} c={c} i={i} value={pct(c.use)} label="usage" />)}</ul>
        </section>
        <section>
          <h2>⭐ Best Pokémon<small>avg place</small></h2>
          <ul className="rank">
            {mons.map((u, i) => (
              <li key={u.line}>
                <span className={`num ${["g", "s", "b"][i] ?? ""}`}>{i + 1}</span>
                <Link className="who" href={`/pokemon/${u.line}`} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Sprite dex={lineDex(m, u.line)} name={lineName(m, u.line)} cost={m.lines[u.line]?.cost} size={38} anim={false} />
                  <b>{lineName(m, u.line)}</b>
                </Link>
                <span className="pill">{fmt2(u.avg)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
