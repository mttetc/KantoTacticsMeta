"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";
import { ui } from "@/components/ui/styles";
import { Tabs } from "@/components/ui/Tabs";
import { useUrlState } from "@/hooks/useUrlState";
import { matchesAll, searchWords } from "@/lib/search";
import { categoryName, RARITY, SealCard, type SealRow } from "./SealCard";

export interface SealFilters {
  rarity: number;
  cat: string;
  q: string;
}
const DEFAULTS: SealFilters = { rarity: 0, cat: "", q: "" };
const fromParams = (p: URLSearchParams): SealFilters => ({ rarity: Number(p.get("rarity")) || 0, cat: p.get("cat") ?? "", q: p.get("q") ?? "" });
const toParams = (f: SealFilters) => ({ rarity: f.rarity ? String(f.rarity) : undefined, cat: f.cat || undefined, q: f.q.trim() || undefined });
const RARITIES = [1, 2, 3] as const;

/** The seal catalogue: one tab per round, filters on rarity, category and text. */
export function SealsList({ seals, rounds, rules, offer }: { seals: SealRow[]; rounds: string[]; rules: number; offer: string }) {
  const [f, update] = useUrlState(DEFAULTS, toParams, fromParams);
  const [round, setRound] = useState(rounds[0] ?? "");
  const words = searchWords(useDeferredValue(f.q));
  const cats = useMemo(() => [...new Set(seals.map((x) => x.cat).filter(Boolean))], [seals]);
  const list = useMemo(
    () => seals.filter((x) => (!f.rarity || x.rarity === f.rarity) && (!f.cat || x.cat === f.cat) && matchesAll(`${x.name} ${x.text.map((t) => `${t.line} ${t.detail ?? ""}`).join(" ")} ${categoryName(x.cat)} ${x.heroName ?? ""}`, words)),
    [seals, f.rarity, f.cat, words],
  );
  const atRound = (r: string) => list.filter((x) => x.rounds.includes(r));
  const shown = atRound(round);
  return (
    <>
      <div className={ui.sort} role="group" aria-label="Filter seals">
        <span className="mr-0.5">Rarity</span>
        {RARITIES.map((r) => (
          <button key={r} type="button" className={`${ui.chip} ${f.rarity === r ? ui.chipOn : ""}`} onClick={() => update({ rarity: f.rarity === r ? 0 : r })} aria-pressed={f.rarity === r}>
            {RARITY[r]}
          </button>
        ))}
        <span className={ui.sep} />
        <Select value={f.cat} onChange={(e) => update({ cat: e.target.value })} aria-label="Category">
          <option value="">Any category</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {categoryName(c)}
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
      <Tabs items={rounds.map((r) => ({ key: r, label: `Round ${r}`, count: atRound(r).length }))} value={round} onChange={setRound} label="Round" />
      <section role="tabpanel" id={`panel-${round}`} aria-labelledby={`tab-${round}`}>
        {shown.length === 0 ? (
          <div className={ui.empty}>No seal matches at round {round}.</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2">
            {shown.map((x, k) => (
              <SealCard key={x.id} seal={x} round={round} delay={0.1 + Math.min(k, 30) * 0.02} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
