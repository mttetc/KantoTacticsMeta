import Link from "next/link";
import { RelatedComps } from "@/components/comps/RelatedComps";
import { ItemIcon, Sprite } from "@/components/ui/Sprite";
import { StatsRow } from "@/components/ui/Stats";
import { ui } from "@/components/ui/styles";
import { TypeChip } from "@/components/ui/TypeChip";
import { stars } from "@/lib/format";
import type { Line, Meta, Unit } from "@/lib/types";
import { itemName, lineDex, lineName, typeName } from "@/server/meta";
import { bestComps, itemsOnLine } from "@/server/queries";

/** Shared by the Pokémon page and its intercepted modal. */
export function PokemonDetail({ meta, unit, line }: { meta: Meta; unit: Unit; line: Line }) {
  const held = itemsOnLine(meta, unit.line);
  const comps = bestComps(meta, (c) => c.units.some((u) => u.line === unit.line && (u.share ?? 0) >= 50));
  const maxUse = Math.max(...meta.units.map((u) => u.use));
  const sComps = meta.comps.filter((c) => c.reliable && c.tier === "S");
  const inS = sComps.filter((c) => c.units.some((u) => u.line === unit.line && (u.share ?? 0) >= 50)).length;
  return (
    <>
      <div className={ui.detail}>
        <Sprite dex={lineDex(meta, unit.line)} name={lineName(meta, unit.line)} cost={line.cost} size={84} priority />
        <div>
          <div className={`${ui.strip} items-center`}>
            {line.cost && <span className={ui.trait}>cost {line.cost}</span>}
            {line.types.map((t) => (
              <TypeChip key={t} type={t} name={typeName(meta, t)} />
            ))}
            {line.range && <span className={ui.trait}>range {line.range}</span>}
          </div>
          {line.names.length > 1 && (
            <div className={`${ui.strip} my-1.5`}>
              {line.names.map((n, i) => (
                <span key={n} className="group flex flex-col items-center" title={n}>
                  <span className={ui.stars}>{stars(i + 1)}</span>
                  <Sprite dex={line.dex[i] ?? null} name={n} cost={line.cost} size={42} anim={false} />
                </span>
              ))}
            </div>
          )}
          {line.move && (
            <p>
              <b>{line.move.name}</b> ({typeName(meta, line.move.type)}) · {line.move.text}
            </p>
          )}
          {line.passive && (
            <p>
              <b>{line.fromChangelog ? `Rules v${meta.rules}` : "Passive"}</b> · {line.passive}
            </p>
          )}
          {line.fromChangelog && <p className={ui.note}>New in rules v{meta.rules}: the game data file still describes v{meta.dataRules}, so the exact move text is not published yet. Shown with the standard sprite.</p>}
          <StatsRow s={unit} maxUse={maxUse} />
          <p className={ui.note}>
            Tier {unit.tier} is the average place of every player who ended a game with {lineName(meta, unit.line)} on the board, in any comp. It sits in <b className="text-txt">{inS} of the {sComps.length}</b> tier S comps this week
            {inS > 0 && unit.tier !== "S" ? ": strong in the right team, weaker as a filler" : ""}.
          </p>
          {unit.onlyRules && <p className={ui.note}>Only rules v{unit.onlyRules} counted for this one.</p>}
        </div>
      </div>
      {held.length > 0 && (
        <div className={ui.sec}>
          <h2 className={ui.secTitle}>
            Items players put on it<small>share of its item slots in reliable comps</small>
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {held.map((h) => (
              <Link key={h.id} href={`/items/${h.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-black/25 py-[3px] pr-2.5 pl-1 text-[.88em] font-semibold text-txt no-underline hover:border-gold">
                <ItemIcon id={h.id} name={itemName(meta, h.id)} size={24} className="rounded-[7px]" />
                {itemName(meta, h.id)}
                <i className="font-medium text-dim not-italic">{Math.round(h.share)} %</i>
              </Link>
            ))}
          </div>
        </div>
      )}
      <RelatedComps meta={meta} title="Best comps with it" comps={comps} />
    </>
  );
}
