import type { Line } from "./types";

/**
 * Units the Meta knows but the game data file does not describe yet (rules 35 additions; the character
 * Pokémon Koga, Giovanni and Samurai are in the data file since rules 36, with their own sprites).
 * Cost, types and notes come from the game changelog; sprites are the standard Pokémon.
 */
const F = (
  id: string,
  names: string[],
  dex: number[],
  cost: number | null,
  types: string[],
  passive: string | null,
): Line => ({ id, names, dex, cost, types, range: null, move: null, passive, fromChangelog: true });

export const FALLBACK_LINES: Record<string, Line> = Object.fromEntries(
  [
    F("venomoth", ["Venomoth"], [49], 3, ["bug", "poison"], "Ranged attacker."),
    F("porygon3", ["Porygon"], [137], 3, ["normal"], "Conversion changes its type to one that resists the last hit."),
    F("omastar", ["Omastar"], [139], 3, ["rock", "water"], "Throws rocks and hides in its shell."),
    F("victreebel", ["Victreebel"], [71], 4, ["grass", "poison"], null),
    F("tangela4", ["Tangela"], [114], 4, ["grass"], "A tank that drains life."),
    F("primeape", ["Primeape"], [57], 4, ["fighting"], "An anti-tank specialist."),
    F("nidoqueen", ["Nidoqueen"], [31], 4, ["poison", "ground"], "Tank."),
    F("kabutops", ["Kabutops"], [141], 4, ["rock", "water"], "Leaps at the backmost enemy and slashes it."),
    F("pikachu-partner", ["Partner Pikachu"], [25], null, ["electric"], "Hero Pikachu from the Partner Seal."),
  ].map((l) => [l.id, l]),
);
