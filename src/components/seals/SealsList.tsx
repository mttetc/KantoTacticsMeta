"use client";

import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { Sprite } from "@/components/ui/Sprite";
import type { Seal } from "@/lib/types";
import s from "./seals.module.css";

export interface SealRow extends Seal {
  heroName: string | null;
  heroDex: number | null;
  heroCost: number | null;
}

const RAR = { 1: "Common", 2: "Rare", 3: "Mythic" } as const;
const CATS: Record<string, string> = { eco: "Economy", shop: "Shop", xp: "XP", item: "Items", combat: "Combat", board: "Board", role: "Roles", trait: "Types", hero: "Heroes", risk: "Risk", later: "Later", rule: "Rules" };

interface F {
  rarity: number;
  cat: string;
  q: string;
}

export function SealsList({ seals, rounds, rules, offer, initial }: { seals: SealRow[]; rounds: string[]; rules: number; offer: string; initial: F }) {
  const router = useRouter();
  const path = usePathname();
  const [f, setF] = useState<F>(initial);
  const dq = useDeferredValue(f.q.trim().toLowerCase());
  const cats = useMemo(() => [...new Set(seals.map((x) => x.cat).filter(Boolean))], [seals]);
  const update = (patch: Partial<F>) => {
    const next = { ...f, ...patch };
    setF(next);
    const p = new URLSearchParams();
    if (next.rarity) p.set("rarity", String(next.rarity));
    if (next.cat) p.set("cat", next.cat);
    if (next.q.trim()) p.set("q", next.q.trim());
    router.replace(`${path}${p.size ? `?${p}` : ""}`, { scroll: false });
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
      <div className="sort" role="group" aria-label="Filter seals">
        <span className="lbl">Rarity</span>
        {([1, 2, 3] as const).map((r) => (
          <button key={r} type="button" className={`chip ${f.rarity === r ? "on" : ""}`} onClick={() => update({ rarity: f.rarity === r ? 0 : r })} aria-pressed={f.rarity === r}>
            {RAR[r]}
          </button>
        ))}
        <span className="sep" />
        <select className="chip" value={f.cat} onChange={(e) => update({ cat: e.target.value })} aria-label="Category">
          <option value="">Any category</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {CATS[c] ?? c}
            </option>
          ))}
        </select>
        <input className="chip" type="search" value={f.q} onChange={(e) => update({ q: e.target.value })} placeholder="Search a seal…" aria-label="Search" style={{ minWidth: 200 }} />
        <span className="lbl end">
          {list.length} seals{offer ? ` · ${offer}` : ""}
        </span>
      </div>
      <p className="tier-note" style={{ margin: "0 0 10px" }}>
        Seals are the picks offered at rounds {rounds.join(", ")} (the game&apos;s augments, since rules v34). The Meta API publishes no pick rate or placement for them, so this is the catalogue for rules v{rules}: no tiers, no win rate.
      </p>
      {rounds.map((r) => {
        const L = list.filter((x) => x.rounds.includes(r));
        if (!L.length) return null;
        return (
          <section key={r}>
            <h2 className={s.h}>
              Round {r} <small>{L.length} seals</small>
            </h2>
            <div className={s.grid}>
              {L.map((x) => (
                <article key={x.id} className={`${s.seal} ${s[`r${x.rarity}`]}`} style={{ "--d": `${(0.1 + Math.min(k++, 30) * 0.02).toFixed(3)}s` } as React.CSSProperties}>
                  <div className={s.head}>
                    <span className={s.code}>{x.code}</span>
                    <b>{x.name}</b>
                    <span className={s.rar}>{RAR[x.rarity]}</span>
                  </div>
                  {x.text.map((t, i) => (
                    <div key={i}>
                      <div className={s.line}>{t.line}</div>
                      {t.detail && <div className={s.det}>{t.detail}</div>}
                    </div>
                  ))}
                  <span className={s.cat}>
                    {x.hero && (
                      <>
                        <Sprite dex={x.heroDex} name={x.heroName ?? x.hero} cost={x.heroCost} size={26} anim={false} /> {x.heroName} ·{" "}
                      </>
                    )}
                    {CATS[x.cat] ?? x.cat}
                  </span>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
