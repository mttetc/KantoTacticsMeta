import type { Comp, Meta } from "./types";

/** An item goes into the code when this share of the comp's games put it on that unit. */
const ITEM_SHARE = 20;

/**
 * The game's team code (API doc, "Team codes"): `KT1;r<rules>;xm=pvp;xn=<name>;<line>:<stars>:<cell>[:<item>.<item>]`,
 * one unit per cell, sorted by cell. Built from the comp's best setup and each unit's usual items, so a player can
 * paste the board into the game. Null when the comp has no board.
 */
export function teamCode(meta: Pick<Meta, "rules">, comp: Pick<Comp, "title" | "units" | "placement">): string | null {
  const cells = comp.placement?.cells ?? [];
  if (!cells.length) return null;
  const seen = new Set<number>();
  const units = [...cells]
    .sort((a, b) => a.cell - b.cell)
    .filter((c) => !seen.has(c.cell) && seen.add(c.cell))
    .map((c) => {
      const u = comp.units.find((x) => x.line === c.line);
      const items = (u?.items ?? [])
        .filter((i) => i.share >= ITEM_SHARE)
        .sort((a, b) => b.share - a.share)
        .slice(0, 3)
        .map((i) => i.id);
      return `${c.line}:${c.star ?? u?.star ?? 1}:${c.cell}${items.length ? `:${items.join(".")}` : ""}`;
    });
  return ["KT1", `r${meta.rules}`, "xm=pvp", `xn=${encodeURIComponent(comp.title.slice(0, 40))}`, ...units].join(";");
}
