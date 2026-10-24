import { fmt2, int, pct } from "@/lib/format";
import type { Stats } from "@/lib/types";

/** The five numbers the API gives for anything: average place with its CI, top 4, wins, usage, sample. */
export function StatsRow({ s, maxUse = 10 }: { s: Stats; maxUse?: number }) {
  return (
    <div className="stats">
      <div className="stat">
        <b>{fmt2(s.avg)}</b>
        <span>avg place</span>
        <small>± {fmt2(s.ic)}</small>
      </div>
      <div className="stat">
        <b>{pct(s.top4)}</b>
        <span>top 4</span>
        <i className="bar">
          <i style={{ width: `${s.top4 || 0}%` }} />
        </i>
      </div>
      <div className="stat">
        <b>{pct(s.win)}</b>
        <span>wins</span>
        <i className="bar">
          <i style={{ width: `${s.win || 0}%` }} />
        </i>
      </div>
      <div className="stat">
        <b>{pct(s.use)}</b>
        <span>usage</span>
        <i className="bar">
          <i style={{ width: `${Math.min(100, ((s.use || 0) / (maxUse || 10)) * 100)}%` }} />
        </i>
      </div>
      <div className="stat">
        <b>{int(s.n)}</b>
        <span>games</span>
        <small>{int(s.ne)} effective</small>
      </div>
    </div>
  );
}
