import { describe, expect, it } from "vitest";
import { teamCode } from "./team-code";

describe("teamCode", () => {
  it("writes one unit per cell, sorted, with the usual items", () => {
    const code = teamCode(
      { rules: 36 },
      {
        title: "Psychic · Mewtwo & Starmie",
        units: [
          { line: "mewtwo", star: 2, share: 80, items: [{ id: "choice-specs", share: 40 }, { id: "quick-claw", share: 37 }, { id: "x", share: 5 }], role: "carry" },
          { line: "staryu", star: 2, share: 85, items: [], role: null },
        ],
        placement: { n: 10, typical: false, cells: [{ cell: 21, line: "staryu", star: 2, share: 20, typical: false }, { cell: 3, line: "mewtwo", star: null, share: 20, typical: false }] },
      },
    );
    expect(code).toBe("KT1;r36;xm=pvp;xn=Psychic%20%C2%B7%20Mewtwo%20%26%20Starmie;mewtwo:2:3:choice-specs.quick-claw;staryu:2:21");
  });
  it("is null without a board", () => {
    expect(teamCode({ rules: 36 }, { title: "x", units: [], placement: null })).toBeNull();
  });
});
