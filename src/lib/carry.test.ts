import { describe, expect, it } from "vitest";
import { assignRoles, itemSide } from "./carry";
import type { Item } from "./types";

const item = (id: string, stat: string | null): Item => ({ id, name: id, kind: "full", stat, recipe: null, text: "", short: null });
const items: Record<string, Item> = {
  "choice-band": item("choice-band", "atk"),
  "choice-specs": item("choice-specs", "spa"),
  "scope-lens": item("scope-lens", "crit"),
  leftovers: item("leftovers", "hp"),
  "rocky-helmet": item("rocky-helmet", "hp"),
  "sitrus-berry": item("sitrus-berry", "hp"),
  "emblem-water": item("emblem-water", null),
};

describe("itemSide", () => {
  it("classifies by the stat the item gives", () => {
    expect(itemSide(items["choice-band"])).toBe("off");
    expect(itemSide(items.leftovers)).toBe("def");
    expect(itemSide(items["emblem-water"])).toBe("neutral");
    expect(itemSide(undefined)).toBe("neutral");
  });
});

describe("assignRoles", () => {
  const units = [
    { line: "mewtwo", star: 2, share: 93, items: [{ id: "choice-specs", share: 43 }, { id: "scope-lens", share: 20 }] },
    { line: "slowpoke", star: 2, share: 83, items: [{ id: "leftovers", share: 37 }, { id: "rocky-helmet", share: 20 }, { id: "sitrus-berry", share: 20 }] },
    { line: "staryu", star: 2, share: 94, items: [{ id: "choice-band", share: 26 }, { id: "scope-lens", share: 20 }] },
    { line: "mew", star: 1, share: 58, items: [] },
    { line: "jynx", star: 2, share: 70, items: [{ id: "choice-band", share: 12 }] },
  ];
  const r = assignRoles(units, items);
  it("picks the most offensively geared unit as carry and the second as sub", () => {
    expect(r.carry).toBe("mewtwo");
    expect(r.sub).toBe("staryu");
  });
  it("does not make a defensive holder the sub; it is the tank", () => {
    expect(r.tank).toBe("slowpoke");
    expect(r.roles.slowpoke).toBe("tank");
  });
  it("leaves lightly geared or bare units without a role", () => {
    expect(r.roles.mew).toBeNull();
    expect(r.roles.jynx).toBeNull();
  });
});
