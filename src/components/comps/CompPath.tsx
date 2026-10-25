import Link from "next/link";
import { Sprite } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { int, stars } from "@/lib/format";
import { compPath, OPENER_MAX_COST, type PathStep } from "@/lib/path";
import type { Comp, Meta } from "@/lib/types";
import { unitDex, unitName } from "@/server/meta";

/** Opener → Early → Mid → Final, like a TFT game plan: what to field, what to keep, what to sell, the level to reach. */
export function CompPath({ meta, comp }: { meta: Meta; comp: Comp }) {
  const steps = compPath(comp, meta.lines);
  if (!steps) return null;
  const stage3 = steps.find((s) => s.key === "early");
  return (
    <div className={ui.sec}>
      <h2 className={ui.secTitle}>
        Game plan<small>real games · {int(stage3?.n ?? steps[0].n)} boards at stage 3</small>
      </h2>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] xl:items-stretch">
        {steps.map((st, i) => (
          <div key={st.key} className="contents">
            {i > 0 && (
              <div className="hidden items-center justify-center text-[28px] text-dim/60 xl:flex" aria-hidden>
                ›
              </div>
            )}
            <Step meta={meta} step={st} />
          </div>
        ))}
      </div>
      <p className={ui.note}>
        What players who finished on this comp had on their board at the end of each stage (units in 30 %+ of their games). The API starts at the end of stage 3, when most players are already level 7 or 8, so the opener is the 1 and 2 costs they were still
        holding then: the units to pick up in stages 1 and 2. Green ring = new at that step, SELL = gone by the next one. Level = the most common player level at that point. The API gives no items per stage.
      </p>
    </div>
  );
}

function Step({ meta, step: st }: { meta: Meta; step: PathStep }) {
  const sold = st.units.filter((u) => !u.kept);
  const kept = st.units.filter((u) => u.kept);
  const names = (list: PathStep["units"]) => list.map((u) => unitName(meta, u.line, u.star)).join(", ");
  return (
    <section className="flex min-w-0 flex-col gap-2 rounded-xl border border-line bg-black/20 p-2.5">
      <header className="flex items-center gap-2">
        <b className={`rounded-full px-2.5 py-0.5 text-[.8em] font-bold tracking-[.06em] uppercase ${st.key === "final" ? "bg-gold text-ink" : "bg-white/10 text-txt"}`}>{st.label}</b>
        <small className="text-dim">{st.sub}</small>
        {st.level && <span className="ml-auto rounded-md border border-line bg-ink/60 px-1.5 text-[.78em] font-bold text-gold-hi tabular-nums">Lv {st.level}</span>}
      </header>
      <div className="flex flex-wrap gap-x-1.5 gap-y-2 pt-1">
        {st.units.map((u) => (
          <Link
            key={u.line}
            href={`/pokemon/${u.line}`}
            className={`group relative flex flex-col items-center no-underline ${u.kept ? "" : "opacity-50 grayscale-[.4]"}`}
            title={`${unitName(meta, u.line, u.star)} · ${Math.round(u.share)} % of boards${st.key === "opener" ? " at the end of stage 3" : ""}${u.kept ? "" : " · sold before the next step"}${u.fresh ? " · new at this step" : ""}`}
          >
            <span className={ui.stars}>{u.star ? stars(u.star) : "·"}</span>
            <Sprite dex={unitDex(meta, u.line, u.star ?? 1)} name={unitName(meta, u.line, u.star ?? 1)} cost={meta.lines[u.line]?.cost} size={46} anim={false} className={u.fresh ? "shadow-[0_0_0_2px_#8ce99a]!" : ""} />
            {!u.kept && <span className="absolute -right-1 -bottom-1 rounded-full bg-[#ff6b6b] px-1 text-[8px] leading-[12px] font-bold text-ink">SELL</span>}
          </Link>
        ))}
      </div>
      <p className={`${ui.note} m-0`}>
        {st.key === "opener" && (
          <>
            Pick up these {OPENER_MAX_COST === 2 ? "1 and 2 costs" : "cheap units"} in stages 1–2: they are the ones this comp&apos;s players still had at the end of stage 3.{" "}
          </>
        )}
        {st.key !== "final" && kept.length > 0 && (
          <>
            Keep <b className="text-txt">{names(kept)}</b>.{" "}
          </>
        )}
        {st.key !== "final" && sold.length > 0 && (
          <>
            Sell <b className="text-txt">{names(sold)}</b> on the way to the next step.
          </>
        )}
        {st.key === "final" && <>The board the comp ends on; carry and items above.</>}
      </p>
    </section>
  );
}
