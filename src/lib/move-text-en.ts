/**
 * English move texts the game data file still gives in Spanish (its `en` field is untranslated for these).
 * Keyed by line id, then star; the Power / scaling tail that the API already writes in English is kept as is.
 * Remove an entry once the API translates it: `buildLines` only uses these when the `en` text still looks Spanish.
 */
export const MOVE_TEXT_EN: Record<string, Record<number, string>> = {
  venomoth: {
    1: "Flaps and releases 3 clouds of scales: the first on its target and the rest on the enemies closest to it; each leaves a different status: poison, paralysis and Worn.",
    2: "Flaps and releases 3 clouds of scales: the first on its target and the rest on the enemies closest to it; each leaves a different status: poison, paralysis and Worn.",
  },
  porygon3: {
    1: "Changes its type to the one that best resists the last ability hit it took and fires a beam of that type at its target. Each Conversion in the fight deals 15% more.",
    2: "Changes its type to the one that best resists the last ability hit it took and fires a beam of that type at its target. Each Conversion in the fight deals 15% more.",
  },
  victreebel: {
    1: "Swallows its target, squeezes it (healing part of the damage) and spits it out 2 tiles away: hits 40% harder if the target was trapped.",
    2: "Swallows its target, squeezes it (healing part of the damage) and spits it out 2 tiles away: hits 40% harder if the target was trapped.",
    3: "Swallows its target, squeezes it (healing part of the damage) and spits it out 2 tiles away: hits 40% harder if the target was trapped.",
  },
  tangela4: {
    1: "Lashes vines at the 3 closest enemies: traps them for 2s (they can’t move), drains their HP and heals part of it. Also hits with its Defense and taunts.",
    2: "Lashes vines at the 3 closest enemies: traps them for 2s (they can’t move), drains their HP and heals part of it. Also hits with its Defense and taunts.",
  },
  nidoqueen: {
    1: "The ground erupts under its target and those around it (hits with its Defense) and it shields itself. 8% more per Ground ally.",
    2: "The ground erupts under its target and those around it (hits with its Defense) and it shields itself. 8% more per Ground ally.",
    3: "The ground erupts under its target and those around it (hits with its Defense) and it shields itself. 8% more per Ground ally.",
  },
  samurai: {
    1: "Grabs its target with its pincers for 1s and cuts: if it drops below 20% HP, it’s KO’d.",
    2: "Grabs its target with its pincers for 1s and cuts: if it drops below 20% HP, it’s KO’d.",
  },
  giovanni: {
    1: "Leaps at the enemy that has dealt the most damage, screeches (Worn 3s) and claws it 3 times, one more per 25% attack speed from its items.",
    2: "Leaps at the enemy that has dealt the most damage, screeches (Worn 3s) and claws it 3 times, one more per 25% attack speed from its items.",
    3: "Leaps at the enemy that has dealt the most damage, screeches (Worn 3s) and claws it 3 times, one more per 25% attack speed from its items.",
  },
};

const SPANISH = /\b(su objetivo|enemigos?|aliados?|casillas?|Potencia|daño|más cercanos?|cada)\b/i;

/**
 * The English text of a move: the API's `en` unless it is still the Spanish sentence, in which case the override
 * replaces the Spanish part. The API appends English detail sentences ("Power 93/166/129 (90% Sp. Atk)") to the
 * Spanish one; those are kept.
 */
export function moveTextEn(line: string, star: number, en: string, es: string): string {
  const override = MOVE_TEXT_EN[line]?.[star];
  if (!override || (en !== es && !SPANISH.test(en))) return en;
  // the Spanish sentence(s) come first: drop every leading sentence that still reads Spanish, keep the English tail
  const sentences = en.split(/(?<=[.!?])\s+/);
  let i = 0;
  while (i < sentences.length && SPANISH.test(sentences[i])) i++;
  const tail = sentences.slice(i).join(" ");
  // the override already says what the Spanish said; an English tail that repeats it (e.g. "+40% damage vs. trapped") stays
  return tail ? `${override} ${tail}` : override;
}
