"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Sprite, TypeGlyph } from "@/components/ui/Sprite";
import { Select } from "@/components/ui/Select";
import { ui } from "@/components/ui/styles";
import { Tabs } from "@/components/ui/Tabs";
import type { Seal } from "@/lib/types";

export interface SealRow extends Seal {
  heroName: string | null;
  heroDex: number | null;
  heroCost: number | null;
}

const RAR = { 1: "Common", 2: "Rare", 3: "Mythic" } as const;
const RAR_STYLE: Record<1 | 2 | 3, { ring: string; badge: string }> = {
  1: { ring: "shadow-[var(--shadow-panel),inset_0_0_0_2px_#adb5bd8c]", badge: "bg-[#adb5bd]" },
  2: { ring: "shadow-[var(--shadow-panel),inset_0_0_0_2px_#4dabf78c]", badge: "bg-[#4dabf7]" },
  3: { ring: "shadow-[var(--shadow-panel),inset_0_0_0_2px_#ffd43b8c,0_0_14px_#ffd43b40]", badge: "bg-gold" },
};
const CATS: Record<string, string> = { eco: "Economy", shop: "Shop", xp: "XP", item: "Items", combat: "Combat", board: "Board", role: "Roles", trait: "Types", hero: "Heroes", risk: "Risk", later: "Later", rule: "Rules" };

interface F {
  rarity: number;
  cat: string;
  q: string;
}

export function SealsList({ seals, rounds, rules, offer, initial }: { seals: SealRow[]; rounds: string[]; rules: number; offer: string; initial: F }) {
  const [f, setF] = useState<F>(initial);
  const [round, setRound] = useState(rounds[0] ?? "");
  const dq = useDeferredValue(f.q.trim().toLowerCase());
  const cats = useMemo(() => [...new Set(seals.map((x) => x.cat).filter(Boolean))], [seals]);
  const update = (patch: Partial<F>) => {
    const next = { ...f, ...patch };
    setF(next);
    const p = new URLSearchParams();
    if (next.rarity) p.set("rarity", String(next.rarity));
    if (next.cat) p.set("cat", next.cat);
    if (next.q.trim()) p.set("q", next.q.trim());
    // native history: Next keeps useSearchParams in sync and makes no server request
    window.history.replaceState(null, "", `${window.location.pathname}${p.size ? `?${p}` : ""}`);
  };
  const list = useMemo(() => {
    const words = dq.split(/\s+/).filter(Boolean);
    return seals.filter((x) => {
      if (f.rarity && x.rarity !== f.rarity) return false;
      if (f.cat && x.cat !== f.cat) return false;
      if (!words.length) return true;
      const hay = `${x.name} ${x.text.map((t) => `${t.line} ${t.detail ?? ""}`).join(" ")} ${CATS[x.cat] ?? x.cat} ${x.heroName ?? ""}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [seals, f.rarity, f.cat, dq]);
  let k = 0;
  return (
    <>
      <div className={ui.sort} role="group" aria-label="Filter seals">
        <span className="mr-0.5">Rarity</span>
        {([1, 2, 3] as const).map((r) => (
          <button key={r} type="button" className={`${ui.chip} ${f.rarity === r ? ui.chipOn : ""}`} onClick={() => update({ rarity: f.rarity === r ? 0 : r })} aria-pressed={f.rarity === r}>
            {RAR[r]}
          </button>
        ))}
        <span className={ui.sep} />
        <Select value={f.cat} onChange={(e) => update({ cat: e.target.value })} aria-label="Category">
          <option value="">Any category</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {CATS[c] ?? c}
            </option>
          ))}
        </Select>
        <input className={`${ui.chip} min-w-[200px]`} type="search" value={f.q} onChange={(e) => update({ q: e.target.value })} placeholder="Search a seal…" aria-label="Search" />
        <span className="ml-auto">
          {list.length} seals{offer ? ` · ${offer}` : ""}
        </span>
      </div>
      <p className={`${ui.tierNote} mb-2.5`}>
        Seals are the picks offered at rounds {rounds.join(", ")} (the game&apos;s augments, since rules v34). The Meta API publishes no pick rate or placement for them, so this is the catalogue for rules v{rules}: no tiers, no win rate. One tab per round.
      </p>
      <Tabs items={rounds.map((r) => ({ key: r, label: `Round ${r}`, count: list.filter((x) => x.rounds.includes(r)).length }))} value={round} onChange={setRound} label="Round" />
      <section role="tabpanel" id={`panel-${round}`} aria-labelledby={`tab-${round}`}>
        {(() => {
          const L = list.filter((x) => x.rounds.includes(round));
          if (!L.length) return <div className={ui.empty}>No seal matches at round {round}.</div>;
          return (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2">
              {L.map((x) => (
                <article key={x.id} className={`${ui.card} flex min-w-0 animate-card-in flex-col gap-1 rounded-xl border-2 border-ink px-3 py-2.5 ${RAR_STYLE[x.rarity].ring}`} style={{ animationDelay: `${(0.1 + Math.min(k++, 30) * 0.02).toFixed(3)}s` } as React.CSSProperties}>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="rounded-md border border-line px-[5px] text-[.7em] text-dim tabular-nums">{x.code}</span>
                    <b className="min-w-0 flex-1 truncate text-[1em]">{x.name}</b>
                    <span className={`rounded-full px-[7px] text-[.68em] font-bold tracking-[.06em] text-[#1a1f2e] uppercase ${RAR_STYLE[x.rarity].badge}`}>{RAR[x.rarity]}</span>
                  </div>
                  {x.text
                    .filter((t) => !t.round || t.round === round)
                    .map((t, i) => (
                      <div key={i}>
                        <div className="text-[.92em] leading-[1.35]">{t.line}</div>
                        {t.detail && <div className="text-[.8em] leading-[1.4] text-dim">{t.detail}</div>}
                      </div>
                    ))}
                  {x.types.length > 0 && (
                    <span className="flex flex-wrap items-center gap-1 pt-1" title={`One seal per type: ${x.types.join(", ")}`}>
                      {x.types.map((t) => (
                        <TypeGlyph key={t} type={t} size={16} />
                      ))}
                    </span>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[.72em] text-dim">
                    {x.hero && (
                      <>
                        <Sprite dex={x.heroDex} name={x.heroName ?? x.hero} cost={x.heroCost} size={26} anim={false} /> {x.heroName} ·{" "}
                      </>
                    )}
                    {CATS[x.cat] ?? x.cat}
                    {x.rounds.length > 1 && ` · also at ${x.rounds.filter((r) => r !== round).join(", ")}`}
                  </span>
                </article>
              ))}
            </div>
          );
        })()}
      </section>
    </>
  );
}
