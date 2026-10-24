"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { Sprite } from "@/components/ui/Sprite";
import { costColor, ui } from "@/components/ui/styles";
import { TierRows } from "@/components/ui/TierRows";
import { fmt2 } from "@/lib/format";
import type { Tier } from "@/lib/types";

/** What the server hands the client: one flat, serialisable row per Pokémon line. */
export interface UnitRow {
  line: string;
  name: string;
  allNames: string[];
  dex: number | null;
  cost: number | null;
  types: string[];
  typeNames: string[];
  tier: Tier;
  avg: number;
  top4: number;
  win: number;
  use: number;
}

type SortKey = "avg" | "top4" | "win" | "use";
const SORTS: { k: SortKey; label: string }[] = [
  { k: "avg", label: "Best place" },
  { k: "top4", label: "Top 4" },
  { k: "win", label: "Wins" },
  { k: "use", label: "Most played" },
];
export interface Filters {
  sort: string;
  cost: number;
  type: string;
  q: string;
}

/**
 * Rendered on the server with the URL's filters (so the first paint matches the link), then the
 * client owns the state: 70 rows sort and filter instantly, and every change is mirrored to the URL.
 */
export function PokemonTierList({ units, types, initial }: { units: UnitRow[]; types: { id: string; name: string }[]; initial: Filters }) {
  const router = useRouter();
  const path = usePathname();
  const [f, setF] = useState<Filters>(initial);
  const sort = (SORTS.find((s) => s.k === f.sort)?.k ?? "avg") as SortKey;
  const dq = useDeferredValue(f.q.trim().toLowerCase());

  const update = (patch: Partial<Filters>) => {
    const next = { ...f, ...patch };
    setF(next);
    const p = new URLSearchParams();
    if (next.sort !== "avg") p.set("sort", next.sort);
    if (next.cost) p.set("cost", String(next.cost));
    if (next.type) p.set("type", next.type);
    if (next.q.trim()) p.set("q", next.q.trim());
    router.replace(`${path}${p.size ? `?${p}` : ""}`, { scroll: false });
  };

  const rows = useMemo(() => {
    const words = dq.split(/\s+/).filter(Boolean);
    return units
      .filter((u) => {
        if (f.cost && u.cost !== f.cost) return false;
        if (f.type && !u.types.includes(f.type)) return false;
        if (!words.length) return true;
        const hay = `${u.allNames.join(" ")} ${u.typeNames.join(" ")}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .sort((a, b) => (sort === "avg" ? a.avg - b.avg : b[sort] - a[sort]));
  }, [units, f.cost, f.type, dq, sort]);

  return (
    <>
      <div className={ui.sort} role="group" aria-label="Sort and filter">
        <span className="mr-0.5">Sort</span>
        {SORTS.map((s) => (
          <button key={s.k} type="button" className={`${ui.chip} ${sort === s.k ? ui.chipOn : ""}`} onClick={() => update({ sort: s.k })} aria-pressed={sort === s.k}>
            {s.label}
          </button>
        ))}
        <span className={ui.sep} />
        <span className="mr-0.5">Cost</span>
        {[1, 2, 3, 4, 5].map((c) => (
          <button key={c} type="button" className={`${ui.chip} ${f.cost === c ? ui.chipOn : ""}`} onClick={() => update({ cost: f.cost === c ? 0 : c })} aria-pressed={f.cost === c}>
            <i className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_1px_#0008]" style={{ background: costColor(c) }} />
            {c}
          </button>
        ))}
        <span className={ui.sep} />
        <select className={ui.chip} value={f.type} onChange={(e) => update({ type: e.target.value })} aria-label="Type">
          <option value="">Any type</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input className={`${ui.chip} ml-auto min-w-[220px]`} type="search" value={f.q} onChange={(e) => update({ q: e.target.value })} placeholder="Search a Pokémon or a type…" aria-label="Search" />
      </div>
      <TierRows
        render={(t) =>
          rows
            .filter((u) => u.tier === t)
            .map((u, k) => (
              <Link key={u.line} className={`${ui.unit} animate-card-in`} href={`/pokemon/${u.line}`} title={`${u.name} · avg ${fmt2(u.avg)}`} style={{ animationDelay: `${(0.15 + Math.min(k, 30) * 0.025).toFixed(3)}s` } as React.CSSProperties}>
                <Sprite dex={u.dex} name={u.name} cost={u.cost} size={70} className="max-sm:h-[56px]! max-sm:w-[56px]!" />
                <span className="mt-[3px] text-[.86em] leading-none font-bold">{fmt2(u.avg)}</span>
                <small>{u.name}</small>
              </Link>
            ))
        }
      />
      <p className={ui.tierNote}>
        Number under the sprite = average place (1 to 8, lower is better). Border colour = cost. Sorted by {SORTS.find((s) => s.k === sort)?.label.toLowerCase()} inside each tier. Click a Pokémon for its items and best comps.
      </p>
    </>
  );
}
