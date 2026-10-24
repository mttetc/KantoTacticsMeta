import type { ApiCompUnit, Item, Role } from "./types";

/** Item stats that make a unit deal damage, versus the ones that keep it alive. */
const OFFENSIVE = new Set(["atk", "spa", "as", "crit", "mana", "vamp"]);
const DEFENSIVE = new Set(["hp", "def", "spd", "shield"]);

export type ItemSide = "off" | "def" | "neutral";

export function itemSide(item: Item | undefined): ItemSide {
  if (!item || !item.stat) return "neutral"; // emblems, tools
  if (OFFENSIVE.has(item.stat)) return "off";
  if (DEFENSIVE.has(item.stat)) return "def";
  return "neutral";
}

export interface RoleResult {
  roles: Record<string, Role>;
  carry: string | null;
  sub: string | null;
  tank: string | null;
}

/**
 * Carry = the unit that collects the most offensive item share, sub = the second one when it is
 * geared often enough, tank = the unit with the most defensive items. Any other unit whose most
 * common item sits on it in 20 %+ of games is a "holder" (worth gearing, shown in the row).
 */
export function assignRoles(units: ApiCompUnit[], items: Record<string, Item>): RoleResult {
  const scored = units.map((u) => {
    let off = 0;
    let def = 0;
    let top = 0;
    for (const it of u.items) {
      const side = itemSide(items[it.id]);
      if (side === "off") off += it.share;
      else if (side === "def") def += it.share;
      else {
        off += it.share * 0.5;
        def += it.share * 0.5;
      }
      top = Math.max(top, it.share);
    }
    return { line: u.line, off, def, top };
  });
  const byOff = [...scored].filter((x) => x.off >= 25).sort((a, b) => b.off - a.off);
  const carry = byOff[0]?.line ?? null;
  const sub = byOff[1] && byOff[1].off >= 0.4 * byOff[0].off ? byOff[1].line : null;
  const byDef = [...scored]
    .filter((x) => x.def >= 30 && x.line !== carry && x.line !== sub && x.def > x.off)
    .sort((a, b) => b.def - a.def);
  const tank = byDef[0]?.line ?? null;
  const roles: Record<string, Role> = {};
  for (const x of scored) {
    roles[x.line] =
      x.line === carry ? "carry" : x.line === sub ? "sub" : x.line === tank ? "tank" : x.top >= 20 ? "holder" : null;
  }
  return { roles, carry, sub, tank };
}

export const ROLE_LABEL: Record<Exclude<Role, null>, string> = { carry: "CARRY", sub: "SUB", tank: "TANK", holder: "" };
