import type { Metadata } from "next";
import Link from "next/link";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { TypeIcon } from "@/components/ui/Sprite";
import { typeColor, ui } from "@/components/ui/styles";
import { TierRows } from "@/components/ui/TierRows";
import { fmt2 } from "@/lib/format";
import { getMeta, typeName } from "@/server/meta";

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
        <TierRows
          render={(t) =>
            traits
              .filter((x) => x.tier === t)
              .map((x) => (
                <Link key={x.slug} className={`${ui.unit} w-[98px]! animate-card-in`} href={`/types/${x.slug}`} title={`${typeName(meta, x.type)} ${x.level} · avg ${fmt2(x.avg)}`} style={{ "--d": `${(0.15 + Math.min(k++, 30) * 0.025).toFixed(3)}s` } as React.CSSProperties}>
                  <span className="grid h-[68px] w-[68px] place-items-center rounded-2xl border-2 border-ink bg-surface shadow-[inset_0_0_0_1px_var(--color-rim-soft)] transition-shadow group-hover:shadow-[0_0_0_2px_var(--color-gold)]">
                    <TypeIcon type={x.type} name={typeName(meta, x.type)} size={60} />
                  </span>
                  <span className="mt-1 text-[.86em] leading-none font-bold" style={{ color: typeColor(x.type) }}>
                    {typeName(meta, x.type)} {x.level}
                  </span>
                  <small>avg {fmt2(x.avg)}</small>
                </Link>
              ))
          }
        />
        <p className={ui.tierNote}>A type at a given level: level 1, 2 or 3 of the synergy. Average place of players who had that level active at the end of the game.</p>
      </PanelBody>
    </>
  );
}
