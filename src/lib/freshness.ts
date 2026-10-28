/**
 * When to fetch the Meta API again. It regenerates once a day at about 03:40 UTC and asks for at most one poll
 * an hour. The cached model lives until just after the next daily slot (`refreshSlot`), so the site is on the
 * day's data right after the API is, without polling it all day.
 */
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
/** Minutes after midnight UTC by which the API's daily run has normally landed. */
const SLOT_UTC = { h: 3, m: 50 };
/** Vercel's crons on the Hobby plan may fire up to an hour late; this covers both the cron and a late API. */
const MIN_LIFE = 10 * 60;

/** Start (ms) of the current refresh slot: the last 03:50 UTC at or before `now`. */
export function refreshSlot(now = Date.now()): number {
  const d = new Date(now);
  const today = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), SLOT_UTC.h, SLOT_UTC.m);
  return today <= now ? today : today - DAY;
}

export interface Life {
  stale: number;
  revalidate: number;
  expire: number;
}

/**
 * Cache life of the model built from an API answer generated at `generated`.
 * - Data of the current slot: keep it until the next slot. `expire` equals `revalidate`, so a page rendered after
 *   that point regenerates with fresh data in one pass instead of serving the old entry while it refreshes.
 * - Data older than the slot (the API's run is late, or the snapshot was served): poll again in an hour, the
 *   API's limit, and keep serving the current entry while that happens (`expire` a day later). With the API
 *   down for days, a shorter life meant every page regenerating every few minutes, each visitor waiting on the
 *   API's timeout, and a cache write per page per cycle.
 */
export function metaCacheLife(generated: string, fromSnapshot: boolean, now = Date.now()): Life {
  const slot = refreshSlot(now);
  const gen = Date.parse(generated);
  const upToDate = !fromSnapshot && Number.isFinite(gen) && gen >= slot - HOUR;
  if (!upToDate) return { stale: 3600, revalidate: 3600, expire: DAY / 1000 };
  const secs = Math.max(MIN_LIFE, Math.ceil((slot + DAY - now) / 1000));
  return { stale: Math.min(secs, 3600), revalidate: secs, expire: secs };
}
