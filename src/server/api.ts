import "server-only";
import type { ApiData, ApiLang, ApiMeta } from "@/lib/types";
import { withSnapshot, type Loaded } from "./snapshot";

export const API_BASE = "https://einoow.com/api/meta/kanto/";
export const META_TAG = "meta";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: { "User-Agent": "KantoTacticsMeta (github.com/mttetc/KantoTacticsMeta)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Meta API ${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/** Not cached here: `getMeta` is the one cache boundary, so a refresh never serves one stale layer inside another. */
export const fetchMetaRaw = (): Promise<Loaded<ApiMeta>> => withSnapshot("meta", () => getJson<ApiMeta>("meta.json"));
export const fetchDataRaw = (): Promise<Loaded<ApiData>> => withSnapshot("data", () => getJson<ApiData>("data.json"));

/**
 * The game's texts in `lang`, or null when that route fails: the model then falls back to the texts of data.json
 * (English, or Spanish for es). Not cached here either, for the same reason as above.
 */
export async function fetchLangRaw(lang: string): Promise<ApiLang | null> {
  try {
    return await getJson<ApiLang>(`lang.json?lang=${encodeURIComponent(lang)}`);
  } catch (err) {
    console.warn(`[meta] lang.json?lang=${lang} failed, falling back to data.json texts:`, err instanceof Error ? err.message : err);
    return null;
  }
}
