import type { Metadata } from "next";
import Link from "next/link";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ItemIcon } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import { TierRows } from "@/components/ui/TierRows";
import { fmt2 } from "@/lib/format";
import { getMeta, itemName } from "@/server/meta";

export const metadata: Metadata = {
  title: "Items tier list",
  description: "Every item of Kanto Tactics ranked by the average place of the player holding it, with recipes, effects and the Pokémon that carry it.",
  alternates: { canonical: "/items" },
};

/** Fully static: no runtime input, rebuilt with the Meta. */
export default async function ItemsPage() {
  const meta = await getMeta();
  const items = [...meta.items].sort((a, b) => a.avg - b.avg);
  let k = 0;
  return (
    <>
      <PanelHead title="Items tier list" subtitle="average place of the holder at the end of the game" />
      <PanelBody>
        <TierRows
          render={(t) =>
            items
              .filter((it) => it.tier === t)
              .map((it) => (
                <Link key={it.id} prefetch={false} className={`${ui.unit} w-[92px]! animate-card-in`} href={`/items/${it.id}`} title={`${itemName(meta, it.id)} · avg ${fmt2(it.avg)}`} style={{ animationDelay: `${(0.15 + Math.min(k++, 30) * 0.025).toFixed(3)}s` } as React.CSSProperties}>
                  <span className="grid h-[68px] w-[68px] place-items-center rounded-2xl border-2 border-ink bg-surface shadow-[inset_0_0_0_1px_var(--color-rim-soft)] transition-shadow group-hover:shadow-[0_0_0_2px_var(--color-gold)]">
                    <ItemIcon id={it.id} name={itemName(meta, it.id)} size={44} className="rounded-lg" />
                  </span>
                  <span className="mt-1 text-[.86em] leading-none font-bold">{fmt2(it.avg)}</span>
                  <small>{itemName(meta, it.id)}</small>
                </Link>
              ))
          }
        />
        <p className={ui.tierNote}>Average place of the player holding the item at the end of the game. Combined items carry the stats of their two parts.</p>
      </PanelBody>
    </>
  );
}
