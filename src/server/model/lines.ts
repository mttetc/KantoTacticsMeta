import "server-only";
import { FALLBACK_LINES } from "@/lib/fallback-lines";
import { moveTextEn } from "@/lib/move-text-en";
import type { ApiData, ApiMeta, Line, MoveCategory } from "@/lib/types";

const category = (scale: { atk: number; spa: number } | null | undefined): MoveCategory => (!scale || (!scale.atk && !scale.spa) ? "utility" : scale.atk && scale.spa ? "mixed" : scale.atk ? "physical" : "special");

/** Pokémon lines from the game data file, completed by the changelog fallbacks and by whatever the Meta still names. */
export function buildLines(data: ApiData, meta: ApiMeta): Record<string, Line> {
  const lines: Record<string, Line> = {};
  for (const [id, l] of Object.entries(data.lines)) {
    const last = l.stars[l.stars.length - 1];
    const passive = typeof l.passive === "string" ? l.passive : (l.passive?.en ?? null);
    lines[id] = {
      id,
      cost: l.c,
      types: l.t,
      range: l.range ?? null,
      names: l.stars.map((s) => s.name),
      dex: l.stars.map((s) => s.dex),
      move: last ? { name: last.move.name.en, type: last.move.type, text: moveTextEn(id, last.star, last.move.text.en, last.move.text.es), category: category(last.move.scale) } : null,
      passive,
      fromChangelog: false,
    };
  }
  for (const [id, l] of Object.entries(FALLBACK_LINES)) lines[id] ??= l;
  for (const u of meta.units) {
    lines[u.line] ??= { id: u.line, cost: null, types: [], range: null, names: [u.line], dex: [], move: null, passive: null, fromChangelog: true };
  }
  return lines;
}
