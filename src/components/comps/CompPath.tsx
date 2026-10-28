import Link from "next/link";
import { Sprite } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { int, stars } from "@/lib/format";
import { compPath, compTempo, OPENER_MAX_COST, type PathStep } from "@/lib/path";
import type { Comp, Meta } from "@/lib/types";
import { itemName, lineName, unitDex, unitName } from "@/server/meta";

/** Opener → Stage 3 → Stage 4 → Final, like a TFT game plan: what players field at each point, the level they are at, when they roll. */
export function CompPath({ meta, comp }: { meta: Meta; comp: Comp }) {
  const steps = compPath(comp, meta.lines);
  if (!steps) return null;
  const stage3 = steps.find((s) => s.key === "early");
  const tempo = compTempo(comp, meta.lines);
  const names = (list: string[]) => list.map((l) => lineName(meta, l)).join(", ");
  return (
    <div className={ui.sec}>
      <h2 className={ui.secTitle}>
        Game plan<small>real games · {int(stage3?.n ?? steps[0].n)} boards at stage 3</small>
      </h2>
      {tempo && (
        <p className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[.9em] text-dim">
          <b className={`rounded-full px-2.5 py-0.5 text-[.85em] font-bold tracking-[.06em] uppercase ${tempo.kind === "reroll" ? "bg-[#8ce99a] text-ink" : "bg-gold text-ink"}`}>{tempo.kind === "reroll" ? "Reroll comp" : "Fast level"}</b>
          <span>
            {tempo.kind === "reroll" ? (
              <>
                Players sit at <b className="text-txt">level {tempo.lv3}</b> through stage 3 and roll for {tempo.targets.length ? <b className="text-txt">{names(tempo.targets)}</b> : "stars"}
                {tempo.lv4 ? <>, then level up to {tempo.lv4} in stage 4</> : null}.
              </>
            ) : (
              <>
                Level <b className="text-txt">{tempo.lv3 ?? 7}</b> by the end of stage 3{tempo.lv4 ? <>, <b className="text-txt">{tempo.lv4}</b> at stage 4</> : null}
                {tempo.targets.length ? <>, and roll there for {<b className="text-txt">{names(tempo.targets)}</b>}</> : null}.
              </>
            )}
          </span>
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {steps.map((st) => (
          <Step key={st.key} meta={meta} comp={comp} step={st} />
        ))}
      </div>
      <p className={ui.note}>
        What players who finished on this comp had on their board at the end of each stage (units in 30 %+ of their games). The API starts at the end of stage 3, when most players are already level 7 or 8, so the opener is the 1 and 2 costs they were still
        holding then: the units to pick up in stages 1 and 2. Green ring = new at that step, faded = not on the next step&apos;s board. Lv = the most common player level at that point. Items are the ones the unit ends the game with (the API gives none per
        stage).
      </p>
    </div>
  );
}

function Step({ meta, comp, step: st }: { meta: Meta; comp: Comp; step: PathStep }) {
  const gone = st.units.filter((u) => !u.kept);
  const names = (list: PathStep["units"]) => list.map((u) => unitName(meta, u.line, u.star)).join(", ");
  const itemsOf = (line: string) =>
    st.key === "opener"
      ? undefined
      : comp.units
          .find((u) => u.line === line)
          ?.items.slice(0, 3)
          .map((i) => ({ id: i.id, name: itemName(meta, i.id) }));
  return (
    <section className="flex min-w-0 flex-col gap-2 rounded-xl border border-line bg-black/20 p-2.5">
      <header className="flex items-center gap-2">
        <b className={`rounded-full px-2.5 py-0.5 text-[.8em] font-bold tracking-[.06em] uppercase ${st.key === "final" ? "bg-gold text-ink" : "bg-white/10 text-txt"}`}>{st.label}</b>
        <small className="text-dim">{st.sub}</small>
        {st.level && <span className="ml-auto rounded-md border border-line bg-ink/60 px-1.5 text-[.78em] font-bold text-gold-hi tabular-nums">Lv {st.level}</span>}
      </header>
      <div className="flex flex-wrap gap-x-1.5 gap-y-2 pt-1 pb-1.5">
        {st.units.map((u) => (
          <Link
            key={u.line}
            href={`/pokemon/${u.line}`}
            className={`group relative flex flex-col items-center no-underline ${u.kept ? "" : "opacity-50 grayscale-[.4]"}`}
            title={`${unitName(meta, u.line, u.star)} · ${Math.round(u.share)} % of boards${st.key === "opener" ? " at the end of stage 3" : ""}${u.kept ? "" : ` · not on the ${st.next} board`}${u.fresh ? " · new at this step" : ""}`}
          >
            <span className={ui.stars}>{u.star ? stars(u.star) : "·"}</span>
            <Sprite dex={unitDex(meta, u.line, u.star ?? 1)} name={unitName(meta, u.line, u.star ?? 1)} cost={meta.lines[u.line]?.cost} size={46} anim={false} items={itemsOf(u.line)} itemSize={18} className={u.fresh ? "shadow-[0_0_0_2px_#8ce99a]!" : ""} />
          </Link>
        ))}
      </div>
      <p className={`${ui.note} m-0`}>
        {st.key === "opener" && (
          <>
            Pick up these {OPENER_MAX_COST === 2 ? "1 and 2 costs" : "cheap units"} in stages 1–2: they are the ones this comp&apos;s players still had at the end of stage 3.{" "}
          </>
        )}
        {st.key === "early" && <>The board at the end of stage 3, with the level players had reached. </>}
        {st.key === "mid" && <>The board at the end of stage 4. </>}
        {st.key !== "final" && st.key !== "opener" && gone.length > 0 && (
          <>
            Not on the {st.next} board any more: <b className="text-txt">{names(gone)}</b>.
          </>
        )}
        {st.key === "final" && <>The board the comp ends on; carry and items above.</>}
      </p>
    </section>
  );
}
