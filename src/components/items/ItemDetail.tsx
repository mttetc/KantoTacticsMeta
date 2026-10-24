import Link from "next/link";
import { RelatedComps } from "@/components/comps/RelatedComps";
import { ItemIcon, Sprite } from "@/components/ui/Sprite";
import { StatsRow } from "@/components/ui/Stats";
import { ui } from "@/components/ui/styles";
import type { Item, ItemStat, Meta } from "@/lib/types";
import { bestComps, itemName, lineDex, lineName } from "@/server/meta";

const KIND = { full: "combined", part: "component", tool: "tool", emblem: "emblem" } as const;

export function ItemDetail({ meta, stat, item }: { meta: Meta; stat: ItemStat; item: Item }) {
  const holders: Record<string, number> = {};
  for (const c of meta.comps) {
    if (!c.reliable) continue;
    for (const u of c.units) for (const x of u.items) if (x.id === item.id) holders[u.line] = (holders[u.line] ?? 0) + x.share * c.n;
  }
  const top = Object.entries(holders)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const comps = bestComps(meta, (c) => c.units.some((u) => u.items.some((x) => x.id === item.id && x.share >= 15)));
  const makes = meta.recipes.filter((r) => r[0] === item.id || r[1] === item.id).map((r) => r[2]);
  const maxUse = Math.max(...meta.items.map((i) => i.use));
  return (
    <>
      <div className={ui.detail}>
        <span className="grid h-[84px] w-[84px] place-items-center rounded-2xl border-2 border-ink bg-surface">
          <ItemIcon id={item.id} name={item.name} size={56} className="rounded-xl" />
        </span>
        <div>
          <div className={ui.strip}>
            <span className={ui.trait}>{KIND[item.kind] ?? item.kind}</span>
            {item.stat && <span className={ui.trait}>{item.stat}</span>}
          </div>
          <p>{item.text}</p>
          {item.recipe && (
            <p>
              <b>Recipe</b>{" "}
              <span className="inline-flex items-center gap-1 align-middle [&>span]:font-bold [&>span]:text-dim">
                <Link href={`/items/${item.recipe[0]}`}><ItemIcon id={item.recipe[0]} name={itemName(meta, item.recipe[0])} size={24} /></Link>
                <span>+</span>
                <Link href={`/items/${item.recipe[1]}`}><ItemIcon id={item.recipe[1]} name={itemName(meta, item.recipe[1])} size={24} /></Link>
                <span>=</span>
                <ItemIcon id={item.id} name={item.name} size={24} />
              </span>{" "}
              <small className="text-dim">
                {itemName(meta, item.recipe[0])} + {itemName(meta, item.recipe[1])}
              </small>
            </p>
          )}
          {makes.length > 0 && (
            <p className="flex flex-wrap items-center gap-1">
              <b>Makes</b>{" "}
              {makes.map((id) => (
                <Link key={id} href={`/items/${id}`} title={itemName(meta, id)}>
                  <ItemIcon id={id} name={itemName(meta, id)} size={24} />
                </Link>
              ))}
            </p>
          )}
          {top.length > 0 && (
            <p className="flex flex-wrap items-center gap-1">
              <b>Usually on</b>{" "}
              {top.map(([l]) => (
                <Link key={l} href={`/pokemon/${l}`} title={lineName(meta, l)} className="group">
                  <Sprite dex={lineDex(meta, l)} name={lineName(meta, l)} cost={meta.lines[l]?.cost} size={38} anim={false} />
                </Link>
              ))}
            </p>
          )}
          <StatsRow s={stat} maxUse={maxUse} />
        </div>
      </div>
      <RelatedComps meta={meta} title="Best comps with it" comps={comps} />
    </>
  );
}
