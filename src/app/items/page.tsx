import type { Metadata } from "next";
import Link from "next/link";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ItemIcon } from "@/components/ui/Sprite";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2 } from "@/lib/format";
import { TIERS } from "@/lib/tiers";
import { getMeta, itemName } from "@/server/meta";
import s from "./items.module.css";

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
      <PanelHead subtitle="Items tier list · average place of the holder at the end of the game" />
      <PanelBody>
        <div className="tiers">
          {TIERS.map((t, i) => (
            <section key={t} className="tier-row" aria-label={`Tier ${t}`} style={{ "--d": `${(0.1 + i * 0.07).toFixed(2)}s` } as React.CSSProperties}>
              <div className="cell">
                <TierBadge tier={t} variant="big" />
              </div>
              <div className="body">
                {items
                  .filter((it) => it.tier === t)
                  .map((it) => (
                    <Link key={it.id} className={s.card} href={`/items/${it.id}`} title={`${itemName(meta, it.id)} · avg ${fmt2(it.avg)}`} style={{ "--d": `${(0.15 + Math.min(k++, 30) * 0.025).toFixed(3)}s` } as React.CSSProperties}>
                      <span className={s.ico}>
                        <ItemIcon id={it.id} name={itemName(meta, it.id)} size={44} />
                      </span>
                      <span className={s.avg}>{fmt2(it.avg)}</span>
                      <small>{itemName(meta, it.id)}</small>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <p className="tier-note">Average place of the player holding the item at the end of the game. Combined items carry the stats of their two parts.</p>
      </PanelBody>
    </>
  );
}
