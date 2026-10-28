import { useTranslations } from "next-intl";
import { Sprite } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import { int, stars } from "@/lib/format";
import { compPath, compTempo, type PathStep } from "@/lib/path";
import type { Comp, Meta } from "@/lib/types";
import { itemName, lineName, unitDex, unitName } from "@/server/meta";

/** Opener → Stage 3 → Stage 4 → Final, like a TFT game plan: what players field at each point, the level they are at, when they roll. */
export function CompPath({ meta, comp }: { meta: Meta; comp: Comp }) {
  const t = useTranslations("comp.plan");
  const steps = compPath(comp, meta.lines);
  if (!steps) return null;
  const stage3 = steps.find((s) => s.key === "early");
  const tempo = compTempo(comp, meta.lines);
  const names = (list: string[]) => list.map((l) => lineName(meta, l)).join(", ");
  const b = (c: React.ReactNode) => <b className="text-txt">{c}</b>;
  return (
    <div className={ui.sec}>
      <h2 className={ui.secTitle}>
        {t("title")}
        <small>{t("boards", { n: int(stage3?.n ?? steps[0].n) })}</small>
      </h2>
      {tempo && (
        <p className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[.9em] text-dim">
          <b className={`rounded-full px-2.5 py-0.5 text-[.85em] font-bold tracking-[.06em] uppercase ${tempo.kind === "reroll" ? "bg-[#8ce99a] text-ink" : "bg-gold text-ink"}`}>{t(`tempo.${tempo.kind}`)}</b>
          <span>{t.rich(`tempo.${tempo.kind}Text`, { lv3: tempo.lv3 ?? 7, lv4: tempo.lv4 ?? 0, targets: tempo.targets.length ? names(tempo.targets) : "", b })}</span>
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {steps.map((st) => (
          <Step key={st.key} meta={meta} comp={comp} step={st} />
        ))}
      </div>
      <p className={ui.note}>{t("note")}</p>
    </div>
  );
}

function Step({ meta, comp, step: st }: { meta: Meta; comp: Comp; step: PathStep }) {
  const t = useTranslations("comp.plan");
  const gone = st.units.filter((u) => !u.kept);
  const names = (list: PathStep["units"]) => list.map((u) => unitName(meta, u.line, u.star)).join(", ");
  const nextLabel = st.next ? t(`steps.${st.next}.label`) : "";
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
        <b className={`rounded-full px-2.5 py-0.5 text-[.8em] font-bold tracking-[.06em] uppercase ${st.key === "final" ? "bg-gold text-ink" : "bg-white/10 text-txt"}`}>{t(`steps.${st.key}.label`)}</b>
        <small className="text-dim">{t(`steps.${st.key}.sub`)}</small>
        {st.level && <span className="ml-auto rounded-md border border-line bg-ink/60 px-1.5 text-[.78em] font-bold text-gold-hi tabular-nums">{t("lv", { n: st.level })}</span>}
      </header>
      <div className="flex flex-wrap gap-x-1.5 gap-y-2 pt-1 pb-1.5">
        {st.units.map((u) => (
          <Link
            key={u.line}
            href={`/pokemon/${u.line}`}
            className={`group relative flex flex-col items-center no-underline ${u.kept ? "" : "opacity-50 grayscale-[.4]"}`}
            title={`${unitName(meta, u.line, u.star)} · ${t("unitShare", { pct: Math.round(u.share) })}${st.key === "opener" ? ` ${t("atStage3")}` : ""}${u.kept ? "" : ` · ${t("unitGone", { next: nextLabel })}`}${u.fresh ? ` · ${t("unitNew")}` : ""}`}
          >
            <span className={ui.stars}>{u.star ? stars(u.star) : "·"}</span>
            <Sprite dex={unitDex(meta, u.line, u.star ?? 1)} name={unitName(meta, u.line, u.star ?? 1)} cost={meta.lines[u.line]?.cost} size={46} anim={false} items={itemsOf(u.line)} itemSize={18} className={u.fresh ? "shadow-[0_0_0_2px_#8ce99a]!" : ""} />
          </Link>
        ))}
      </div>
      <p className={`${ui.note} m-0`}>
        {st.key === "opener" && <>{t("openerNote")} </>}
        {st.key === "early" && <>{t("stage3Note")} </>}
        {st.key === "mid" && <>{t("stage4Note")} </>}
        {st.key !== "final" && st.key !== "opener" && gone.length > 0 && <>{t.rich("gone", { next: nextLabel, names: names(gone), b: (c) => <b className="text-txt">{c}</b> })}</>}
        {st.key === "final" && <>{t("finalNote")}</>}
      </p>
    </section>
  );
}
