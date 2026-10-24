import type { Metadata } from "next";
import Link from "next/link";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { TypeIcon } from "@/components/ui/Sprite";
import { TierBadge } from "@/components/ui/TierBadge";
import { typeVar } from "@/components/ui/TypeChip";
import { fmt2 } from "@/lib/format";
import { TIERS } from "@/lib/tiers";
import { getMeta, typeName } from "@/server/meta";
import s from "../items/items.module.css";

export const metadata: Metadata = {
  title: "Types tier list",
  description: "Every type synergy level of Kanto Tactics ranked by the average place of players who had it active, with thresholds, effects and the best comps.",
  alternates: { canonical: "/types" },
};

export default async function TypesPage() {
  const meta = await getMeta();
  const traits = [...meta.traits].sort((a, b) => a.avg - b.avg);
  let k = 0;
  return (
    <>
      <PanelHead subtitle="Types tier list · a type at a given synergy level" />
      <PanelBody>
        <div className="tiers">
          {TIERS.map((t, i) => (
            <section key={t} className="tier-row" aria-label={`Tier ${t}`} style={{ "--d": `${(0.1 + i * 0.07).toFixed(2)}s` } as React.CSSProperties}>
              <div className="cell">
                <TierBadge tier={t} variant="big" />
              </div>
              <div className="body">
                {traits
                  .filter((x) => x.tier === t)
                  .map((x) => (
                    <Link key={x.slug} className={`${s.card} ${s.ty}`} href={`/types/${x.slug}`} title={`${typeName(meta, x.type)} ${x.level} · avg ${fmt2(x.avg)}`} style={{ "--d": `${(0.15 + Math.min(k++, 30) * 0.025).toFixed(3)}s`, ...typeVar(x.type) } as React.CSSProperties}>
                      <span className={s.ico}>
                        <TypeIcon type={x.type} name={typeName(meta, x.type)} size={60} />
                      </span>
                      <span className={`${s.lvl} ty-name`}>
                        {typeName(meta, x.type)} {x.level}
                      </span>
                      <small>avg {fmt2(x.avg)}</small>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <p className="tier-note">A type at a given level: level 1, 2 or 3 of the synergy. Average place of players who had that level active at the end of the game.</p>
      </PanelBody>
    </>
  );
}
