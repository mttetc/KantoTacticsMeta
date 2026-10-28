import { useTranslations } from "next-intl";
import { fmt2, int, pct } from "@/lib/format";
import type { Stats } from "@/lib/types";

function Stat({ value, label, sub, bar }: { value: string; label: string; sub?: string; bar?: number }) {
  return (
    <div className="flex min-w-[66px] flex-col">
      <b className="text-[1.3em] leading-[1.1] tabular-nums">{value}</b>
      <span className="text-[.76em] text-dim">{label}</span>
      {sub && <small className="text-[.72em] text-dim/80">{sub}</small>}
      {bar != null && (
        <i className="mt-0.5 block h-1 w-[66px] overflow-hidden rounded bg-black/35">
          <i className="block h-full rounded bg-cobalt" style={{ width: `${Math.max(0, Math.min(100, bar))}%` }} />
        </i>
      )}
    </div>
  );
}

/** The five numbers the API gives for anything: average place with its CI, top 4, wins, usage, sample. */
export function StatsRow({ s, maxUse = 10 }: { s: Stats; maxUse?: number }) {
  const t = useTranslations("common");
  return (
    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-2.5">
      <Stat value={fmt2(s.avg)} label={t("avgPlace")} sub={`± ${fmt2(s.ic)}`} />
      <Stat value={pct(s.top4)} label={t("top4")} bar={s.top4 || 0} />
      <Stat value={pct(s.win)} label={t("wins")} bar={s.win || 0} />
      <Stat value={pct(s.use)} label={t("usage")} bar={((s.use || 0) / (maxUse || 10)) * 100} />
      <Stat value={int(s.n)} label={t("games")} sub={t("effective", { n: int(s.ne) })} />
    </div>
  );
}
