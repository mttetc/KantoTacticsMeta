import { describe, expect, it } from "vitest";
import { compScore, compTier, entityTier } from "./tiers";

const ref = 4.01;

describe("entityTier", () => {
  it("keeps the API tier for S, A, B", () => {
    expect(entityTier("S", 3.0, ref)).toBe("S");
    expect(entityTier("A", 3.7, ref)).toBe("A");
    expect(entityTier("B", 4.1, ref)).toBe("B");
  });
  it("splits C into C and D at ref + 0.5", () => {
    expect(entityTier("C", 4.3, ref)).toBe("C");
    expect(entityTier("C", 4.51, ref)).toBe("D");
  });
});

describe("compTier", () => {
  it("grades on avg + CI, so a noisy sample cannot be S", () => {
    expect(compTier(1.9, 0.1, ref)).toBe("S");
    expect(compTier(1.9, 1.5, ref)).toBe("A"); // 3.4 − 4.01 = −0.61: above the S line once the CI is counted
  });
  it("uses the thresholds relative to the reference", () => {
    expect(compTier(3.3, 0.0, ref)).toBe("A"); // −0.71
    expect(compTier(4.4, 0.1, ref)).toBe("B"); // +0.49
    expect(compTier(5.0, 0.1, ref)).toBe("C"); // +1.09
    expect(compTier(5.5, 0.1, ref)).toBe("D"); // +1.59
  });
  it("compScore is avg + ic and tolerates a missing ic", () => {
    expect(compScore(2, 0.5)).toBe(2.5);
    expect(compScore(2, undefined as unknown as number)).toBe(2);
  });
});
