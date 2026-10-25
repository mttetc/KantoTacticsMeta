"use client";

import Link from "next/link";
import { useDeferredValue, useMemo } from "react";
import { CostChips } from "@/components/ui/CostChips";
import { Select } from "@/components/ui/Select";
import { Sprite } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { TierRows } from "@/components/ui/TierRows";
import { useUrlState } from "@/hooks/useUrlState";
import { fmt2 } from "@/lib/format";
import { matchesAll, searchWords } from "@/lib/search";
import { compareUnits, DEFAULT_UNIT_SORT, UNIT_SORTS, type UnitFilters, type UnitRow, type UnitSort } from "@/lib/unit-filters";

const toParams = (f: UnitFilters) => ({ sort: f.sort !== DEFAULT_UNIT_SORT ? f.sort : undefined, cost: f.cost ? String(f.cost) : undefined, type: f.type || undefined, q: f.q.trim() || undefined });
const cardDelay = (k: number) => ({ animationDelay: `${(0.15 + Math.min(k, 30) * 0.025).toFixed(3)}s` }) as React.CSSProperties;

/**
 * Rendered on the server with the URL's filters (so the first paint matches the link), then the
 * client owns the state: 70 rows sort and filter instantly, and every change is mirrored to the URL.
 */
export function PokemonTierList({ units, types, initial }: { units: UnitRow[]; types: { id: string; name: string }[]; initial: UnitFilters }) {
  const [f, update] = useUrlState(initial, toParams);
  const words = searchWords(useDeferredValue(f.q));

  const rows = useMemo(
    () => units.filter((u) => (!f.cost || u.cost === f.cost) && (!f.type || u.types.includes(f.type)) && matchesAll(`${u.allNames.join(" ")} ${u.typeNames.join(" ")}`, words)).sort(compareUnits[f.sort]),
    [units, f.cost, f.type, f.sort, words],
  );

  return (
    <>
      <div className={ui.sort} role="group" aria-label="Sort and filter">
        <span className="mr-0.5">Sort</span>
        {(Object.keys(UNIT_SORTS) as UnitSort[]).map((k) => (
          <button key={k} type="button" className={`${ui.chip} ${f.sort === k ? ui.chipOn : ""}`} onClick={() => update({ sort: k })} aria-pressed={f.sort === k}>
            {UNIT_SORTS[k]}
          </button>
        ))}
        <span className={ui.sep} />
        <CostChips value={f.cost} onChange={(cost) => update({ cost })} />
        <span className={ui.sep} />
        <Select value={f.type} onChange={(e) => update({ type: e.target.value })} aria-label="Type">
          <option value="">Any type</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        <input className={`${ui.chip} ml-auto min-w-[220px]`} type="search" value={f.q} onChange={(e) => update({ q: e.target.value })} placeholder="Search a Pokémon or a type…" aria-label="Search" />
      </div>
      <TierRows
        render={(t) =>
          rows
            .filter((u) => u.tier === t)
            .map((u, k) => (
              <Link key={u.line} className={`${ui.unit} animate-card-in`} href={`/pokemon/${u.line}`} title={`${u.name} · avg ${fmt2(u.avg)}`} style={cardDelay(k)}>
                <Sprite dex={u.dex} name={u.name} cost={u.cost} size={70} className="max-sm:h-[56px]! max-sm:w-[56px]!" />
                <span className="mt-[3px] text-[.86em] leading-none font-bold">{fmt2(u.avg)}</span>
                <small>{u.name}</small>
              </Link>
            ))
        }
      />
      <p className={ui.tierNote}>Number under the sprite = average place (1 to 8, lower is better). Border colour = cost. Sorted by {UNIT_SORTS[f.sort].toLowerCase()} inside each tier. Click a Pokémon for its items and best comps.</p>
    </>
  );
}
