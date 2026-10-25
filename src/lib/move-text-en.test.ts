import { describe, expect, it } from "vitest";
import { moveTextEn } from "./move-text-en";

describe("moveTextEn", () => {
  it("replaces the Spanish sentence and keeps the English tail the API appends", () => {
    const en = "Salta al enemigo que más daño ha hecho, chirría (Desgaste 3 s) y le da 3 zarpazos, uno más por cada 25 % de velocidad de ataque de sus objetos. Worn 3s (−18% Defense and Sp. Def). Power 75/134/218 (100% Attack)";
    expect(moveTextEn("giovanni", 3, en, en)).toBe("Leaps at the enemy that has dealt the most damage, screeches (Worn 3s) and claws it 3 times, one more per 25% attack speed from its items. Worn 3s (−18% Defense and Sp. Def). Power 75/134/218 (100% Attack)");
  });
  it("leaves a translated text alone", () => {
    const en = "Grabs its target with its pincers for 1s and cuts: if it drops below 20% HP, it’s KO’d. Power 514/923/1638 (130% Attack)";
    expect(moveTextEn("samurai", 3, en, "Agarra a su objetivo…")).toBe(en);
  });
  it("has nothing to say for a line without an override", () => {
    expect(moveTextEn("bulbasaur", 1, "Plants a seed", "Planta una semilla")).toBe("Plants a seed");
  });
});
