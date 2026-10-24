import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ApiData, ApiMeta } from "@/lib/types";

export const API_BASE = "https://einoow.com/api/meta/kanto/";
export const META_TAG = "meta";

/** The API regenerates once a day (03:40 UTC) and asks for at most one poll an hour, cached on our side. */
const LIFE = { stale: 3600, revalidate: 3600, expire: 60 * 60 * 24 * 3 } as const;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE + path, { headers: { "User-Agent": "KantoTacticsMeta (github.com/mttetc/KantoTacticsMeta)" } });
  if (!res.ok) throw new Error(`Meta API ${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchMetaRaw(): Promise<ApiMeta> {
  "use cache";
  cacheLife(LIFE);
  cacheTag(META_TAG);
  return getJson<ApiMeta>("meta.json");
}

export async function fetchDataRaw(): Promise<ApiData> {
  "use cache";
  cacheLife(LIFE);
  cacheTag(META_TAG);
  return getJson<ApiData>("data.json");
}
