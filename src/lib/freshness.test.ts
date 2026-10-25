import { describe, expect, it } from "vitest";
import { metaCacheLife, refreshSlot } from "./freshness";

const at = (iso: string) => Date.parse(iso);

describe("refreshSlot", () => {
  it("is today's 03:50 UTC once passed, yesterday's before", () => {
    expect(new Date(refreshSlot(at("2026-10-25T10:58:00Z"))).toISOString()).toBe("2026-10-25T03:50:00.000Z");
    expect(new Date(refreshSlot(at("2026-10-25T03:20:00Z"))).toISOString()).toBe("2026-10-24T03:50:00.000Z");
  });
});

describe("metaCacheLife", () => {
  it("keeps today's data until the next slot, with a hard expiry", () => {
    const now = at("2026-10-25T10:58:00Z");
    const life = metaCacheLife("2026-10-25T03:32:36.917Z", false, now);
    expect(life.revalidate).toBe(Math.ceil((at("2026-10-26T03:50:00Z") - now) / 1000));
    expect(life.expire).toBe(life.revalidate);
    expect(life.stale).toBe(3600);
  });
  it("polls hourly while the API's run is late", () => {
    const now = at("2026-10-25T05:00:00Z");
    expect(metaCacheLife("2026-10-24T03:32:46.853Z", false, now).revalidate).toBe(3600);
  });
  it("accepts a run that landed just before the slot, and never keeps an entry under ten minutes", () => {
    const now = at("2026-10-25T03:45:00Z"); // after the API's 03:32 run, before the 03:50 slot
    const life = metaCacheLife("2026-10-25T03:32:00Z", false, now);
    expect(life.revalidate).toBe(600);
  });
  it("retries the snapshot every five minutes", () => {
    expect(metaCacheLife("2026-10-25T03:32:00Z", true).revalidate).toBe(300);
  });
});
