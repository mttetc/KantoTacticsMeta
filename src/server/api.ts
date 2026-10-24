import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ApiData, ApiMeta } from "@/lib/types";
import { withSnapshot, type Loaded } from "./snapshot";

export const API_BASE = "https://einoow.com/api/meta/kanto/";
export const META_TAG = "meta";

/** The API regenerates once a day (03:40 UTC) and asks for at most one poll an hour, cached on our side. */
const LIFE = { stale: 3600, revalidate: 3600, expire: 60 * 60 * 24 * 3 } as const;
/** When the API is down we serve the snapshot but retry it every few minutes. */
const LIFE_FALLBACK = { stale: 60, revalidate: 300, expire: 3600 } as const;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: { "User-Agent": "KantoTacticsMeta (github.com/mttetc/KantoTacticsMeta)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Meta API ${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchMetaRaw(): Promise<Loaded<ApiMeta>> {
  "use cache";
  cacheTag(META_TAG);
  const r = await withSnapshot("meta", () => getJson<ApiMeta>("meta.json"));
  cacheLife(r.source === "api" ? LIFE : LIFE_FALLBACK);
  return r;
}

export async function fetchDataRaw(): Promise<Loaded<ApiData>> {
  "use cache";
  cacheTag(META_TAG);
  const r = await withSnapshot("data", () => getJson<ApiData>("data.json"));
  cacheLife(r.source === "api" ? LIFE : LIFE_FALLBACK);
  return r;
}
