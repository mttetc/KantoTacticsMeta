import type { Metadata } from "next";
import Link from "next/link";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { TypeGlyph, TypeIcon } from "@/components/ui/Sprite";
import { TierBadge } from "@/components/ui/TierBadge";
import { typeColor, ui } from "@/components/ui/styles";
import { TierRows } from "@/components/ui/TierRows";
import { fmt2, int } from "@/lib/format";
import { getMeta, traitPairs, typeName } from "@/server/meta";

export const metadata: Metadata = {
  title: "Types tier list",
  description: "Every type synergy level of Kanto Tactics ranked by the average place of players who had it active, with thresholds, effects and the best comps.",
  alternates: { canonical: "/types" },
};

export default async function TypesPage() {
  const meta = await getMeta();
  const traits = [...meta.traits].sort((a, b) => a.avg - b.avg);
  const pairs = traitPairs(meta, 24);
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
                <Link key={x.slug} className={`${ui.unit} w-[98px]! animate-card-in`} href={`/types/${x.slug}`} title={`${typeName(meta, x.type)} ${x.level} · avg ${fmt2(x.avg)}`} style={{ animationDelay: `${(0.15 + Math.min(k++, 30) * 0.025).toFixed(3)}s` } as React.CSSProperties}>
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
        {pairs.length > 0 && (
          <div className={`${ui.sec} mt-3`}>
            <h2 className={ui.secTitle}>
              Type pairs<small>two types active together in the reliable comps</small>
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-1.5">
              {pairs.map((p) => (
                <Link key={`${p.a}+${p.b}`} href={`/comps?tier=all&q=${encodeURIComponent(`${typeName(meta, p.a)} ${typeName(meta, p.b)}`)}`} className="flex items-center gap-2 rounded-xl border border-line bg-black/20 px-2.5 py-1.5 text-[.9em] no-underline hover:bg-white/6" title={`${int(p.comps)} comps, ${int(p.games)} games · avg + CI ${fmt2(p.score)} · best comp is tier ${p.bestTier}`}>
                  <span className="flex items-center gap-0.5">
                    <TypeGlyph type={p.a} size={18} />
                    <TypeGlyph type={p.b} size={18} />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    <span style={{ color: typeColor(p.a) }}>{typeName(meta, p.a)}</span> × <span style={{ color: typeColor(p.b) }}>{typeName(meta, p.b)}</span>
                  </span>
                  <span className="text-[.85em] text-dim tabular-nums">{fmt2(p.score)}</span>
                  <TierBadge tier={p.bestTier} />
                </Link>
              ))}
            </div>
            <p className={ui.note}>Sorted by games played. Number = games-weighted avg + CI of the comps running both types (lower is better); badge = the tier of the best of them. Click for those comps.</p>
          </div>
        )}
      </PanelBody>
    </>
  );
}
