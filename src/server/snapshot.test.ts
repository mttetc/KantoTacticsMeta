import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { withSnapshot } = await import("./snapshot");

describe("withSnapshot", () => {
  it("returns the live value when the source answers", async () => {
    const r = await withSnapshot("meta", async () => ({ generated: "live", comps: [] }));
    expect(r.source).toBe("api");
    expect(r.value.generated).toBe("live");
  });
  it("falls back to the committed snapshot when the source throws", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = await withSnapshot("meta", async () => {
      throw new Error("HTTP 503");
    });
    expect(r.source).toBe("snapshot");
    expect(r.snapshotAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(Array.isArray((r.value as { comps: unknown[] }).comps)).toBe(true);
    warn.mockRestore();
  });
});
