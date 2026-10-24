"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Sprite } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { fmt2, int } from "@/lib/format";

export interface StageRow {
  line: string;
  name: string;
  dex: number | null;
  cost: number | null;
  presence: number;
  score: number;
  keep: number;
  comps: number;
}
type Key = "presence" | "score" | "keep" | "comps";
const COLS: { k: Key; label: string; asc: boolean; title: string }[] = [
  { k: "presence", label: "On boards", asc: false, title: "share of the good comps' games that field it at that point" },
  { k: "score", label: "Comps avg + CI", asc: true, title: "how well the comps it leads to finish (lower is better)" },
  { k: "keep", label: "Kept to the end", asc: false, title: "how often it is still on the final board" },
  { k: "comps", label: "Comps", asc: false, title: "number of reliable comps that field it" },
];

/** One stage's ranking, sortable by any column. */
export function StageTable({ title, sub, rows, stage }: { title: string; sub: string; rows: StageRow[]; stage: 3 | 4 }) {
  const [sort, setSort] = useState<{ k: Key; asc: boolean }>({ k: "presence", asc: false });
  const sorted = useMemo(() => [...rows].sort((a, b) => (sort.asc ? a[sort.k] - b[sort.k] : b[sort.k] - a[sort.k]) || b.presence - a.presence), [rows, sort]);
  const toggle = (k: Key) => setSort((s) => (s.k === k ? { k, asc: !s.asc } : { k, asc: COLS.find((c) => c.k === k)!.asc }));
  return (
    <div className={ui.sec}>
      <h2 className={ui.secTitle}>
        {title}
        <small>{sub}</small>
      </h2>
      <div className={`${ui.table} border-0 bg-none shadow-none`}>
        <table>
          <thead>
            <tr>
              <th>Pokémon</th>
              {COLS.map((c) => (
                <th key={c.k} className="text-right!" aria-sort={sort.k === c.k ? (sort.asc ? "ascending" : "descending") : "none"}>
                  <button type="button" onClick={() => toggle(c.k)} title={c.title} className={`inline-flex items-center gap-1 font-semibold ${sort.k === c.k ? "text-gold-hi" : "text-dim hover:text-txt"}`}>
                    {c.label}
                    <span aria-hidden className="text-[.9em]">{sort.k === c.k ? (sort.asc ? "▲" : "▼") : "⇅"}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.line} className="hover:bg-white/3">
                <td>
                  <Link href={`/comps?from=${p.line}&stage=${stage}`} className="group inline-flex items-center gap-2 text-txt no-underline" title={`Final comps whose stage ${stage} board fields ${p.name}`}>
                    <Sprite dex={p.dex} name={p.name} cost={p.cost} size={36} anim={false} />
                    <span className="font-semibold">{p.name}</span>
                  </Link>
                </td>
                <td className="text-right tabular-nums">
                  <b>{Math.round(p.presence)} %</b>
                </td>
                <td className="text-right tabular-nums">{fmt2(p.score)}</td>
                <td className="text-right tabular-nums">
                  <span className={p.keep >= 70 ? "text-[#8ce99a]" : p.keep <= 30 ? "text-[#ff8787]" : ""}>{Math.round(p.keep)} %</span>
                </td>
                <td className="text-right tabular-nums text-dim">{int(p.comps)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={ui.note}>
        On boards = share of the good comps&apos; games that field it at that point, weighted by games. Comps avg + CI = how well the comps it leads to finish (lower is better). Kept = how often it is still on the final board; red means a transition unit you usually sell. Click a column to sort.
      </p>
    </div>
  );
}
