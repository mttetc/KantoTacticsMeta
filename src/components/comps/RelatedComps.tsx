import Link from "next/link";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2 } from "@/lib/format";
import type { Comp, Meta } from "@/lib/types";
import { CompThumbs } from "./CompThumbs";
import { CompTitle } from "./CompTitle";

/** "Best comps with it": a short ranked list, reliable samples only, best first. */
export function RelatedComps({ meta, title, comps }: { meta: Meta; title: string; comps: Comp[] }) {
  if (!comps.length) return null;
  return (
    <div className="sec">
      <h2>
        {title}
        <small>reliable samples, best first</small>
      </h2>
      <ul className="rank">
        {comps.map((c) => (
          <li key={c.id} className="noNum">
            <Link className="who" href={`/comps/${c.slug}`}>
              <b>
                <TierBadge tier={c.tier} />
                <span className="t">
                  <CompTitle meta={meta} comp={c} />
                </span>
              </b>
              <span className="mons">
                <CompThumbs meta={meta} comp={c} />
              </span>
            </Link>
            <span className="pill">{fmt2(c.avg)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
