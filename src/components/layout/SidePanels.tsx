import type { ReactNode } from "react";
import { CompThumbs } from "@/components/comps/CompThumbs";
import { CompTitle } from "@/components/comps/CompTitle";
import { RankItem, RankList, RankThumbs, RankTitle } from "@/components/ui/RankList";
import { Sprite } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2, pct } from "@/lib/format";
import { COMP_THRESHOLDS, D_GAP, MIN_NE, TIER_HELP } from "@/lib/tiers";
import type { Meta } from "@/lib/types";
import { lineDex, lineName } from "@/server/meta";

/** A lobby side panel: dark rounded box, sticky content, full width on one column. */
function Side({ side, label, children }: { side: "left" | "right"; label: string; children: ReactNode }) {
  return (
    <aside
      aria-label={label}
      className={`min-w-0 rounded-[18px] border-[3px] border-white/30 bg-ink/70 p-3 shadow-[0_6px_0_#0a0e1a,0_14px_28px_#0000005c] ${side === "left" ? "order-3 animate-in-l xl:order-none" : "order-2 animate-in-r xl:order-none"}`}
    >
      <div className="flex flex-col gap-2.5 xl:sticky xl:top-3.5">{children}</div>
    </aside>
  );
}

function H({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <h2 className="m-0 mb-2 text-[12px] font-bold tracking-[.08em] text-dim uppercase">
      {children}
      {sub && <small className="ml-1.5 font-medium tracking-normal normal-case opacity-80">{sub}</small>}
    </h2>
  );
}

const blk = "rounded-xl border-2 border-ink bg-linear-to-b from-surface-hi to-surface to-60% p-2.5 shadow-panel";

/** Left panel: how tiers are read. Static per Meta refresh. */
export function LeftPanel({ meta: m }: { meta: Meta }) {
  return (
    <Side side="left" label="Tiers and rules">
      <section>
        <H sub="average place vs. reference">Tiers</H>
        <div className={`${blk} flex flex-col gap-[5px] text-[14px] text-dim [&_b]:text-txt [&_b]:tabular-nums [&>div]:flex [&>div]:items-center [&>div]:gap-2`}>
          <div><TierBadge tier="S" /><span>≤ <b>{fmt2(m.ref + m.thresholds.tiers.S)}</b> · {TIER_HELP.S}</span></div>
          <div><TierBadge tier="A" /><span>≤ <b>{fmt2(m.ref + m.thresholds.tiers.A)}</b> · {TIER_HELP.A}</span></div>
          <div><TierBadge tier="B" /><span>≤ <b>{fmt2(m.ref + m.thresholds.tiers.B)}</b> · {TIER_HELP.B}</span></div>
          <div><TierBadge tier="C" /><span>&lt; <b>{fmt2(m.ref + D_GAP)}</b> · {TIER_HELP.C}</span></div>
          <div><TierBadge tier="D" /><span>≥ <b>{fmt2(m.ref + D_GAP)}</b> · {TIER_HELP.D}</span></div>
          <p className={`${ui.note} mt-1`}>
            Pokémon, items, types: the game&apos;s tiers (the API stops at C; D is this page&apos;s split, mirroring S). <b>Comps</b> are graded stricter, on the pessimistic average (avg + CI) against the
            reference: S ≤ {fmt2(m.ref + COMP_THRESHOLDS.S)}, A ≤ {fmt2(m.ref + COMP_THRESHOLDS.A)}, B ≤ {fmt2(m.ref + COMP_THRESHOLDS.B)}, C ≤ {fmt2(m.ref + COMP_THRESHOLDS.C)}, D above. A noisy sample
            cannot be S. Comps under {MIN_NE} effective games are hidden by default.
          </p>
        </div>
      </section>
    </Side>
  );
}

/** Right panel: the week's leaderboard of comps and Pokémon, like the lobby's ranking panel. */
export function RightPanel({ meta: m }: { meta: Meta }) {
  const pool = m.comps.filter((c) => c.reliable);
  const best = [...pool].sort((a, b) => a.score - b.score).slice(0, 8);
  const played = [...pool].sort((a, b) => b.use - a.use).slice(0, 5);
  const mons = [...m.units].sort((a, b) => a.avg - b.avg).slice(0, 5);
  const CompRow = ({ c, i, value, label }: { c: (typeof best)[number]; i: number; value: string; label: string }) => (
    <RankItem rank={i + 1} href={`/comps/${c.slug}`} value={value} valueTitle={label}>
      <RankTitle>
        <TierBadge tier={c.tier} />
        <span className="t">
          <CompTitle meta={m} comp={c} />
        </span>
      </RankTitle>
      <RankThumbs>
        <CompThumbs meta={m} comp={c} max={8} />
      </RankThumbs>
    </RankItem>
  );
  return (
    <Side side="right" label="Top of the week">
      <section>
        <H sub="avg + CI">👑 Best comps</H>
        <RankList>{best.map((c, i) => <CompRow key={c.id} c={c} i={i} value={fmt2(c.avg)} label="average place" />)}</RankList>
      </section>
      <section>
        <H sub="usage">🔥 Most played</H>
        <RankList>{played.map((c, i) => <CompRow key={c.id} c={c} i={i} value={pct(c.use)} label="usage" />)}</RankList>
      </section>
      <section>
        <H sub="avg place">⭐ Best Pokémon</H>
        <RankList>
          {mons.map((u, i) => (
            <RankItem key={u.line} rank={i + 1} href={`/pokemon/${u.line}`} value={fmt2(u.avg)} valueTitle="average place">
              <span className="flex items-center gap-2">
                <Sprite dex={lineDex(m, u.line)} name={lineName(m, u.line)} cost={m.lines[u.line]?.cost} size={38} anim={false} />
                <b className="text-[14px]">{lineName(m, u.line)}</b>
              </span>
            </RankItem>
          ))}
        </RankList>
      </section>
    </Side>
  );
}
