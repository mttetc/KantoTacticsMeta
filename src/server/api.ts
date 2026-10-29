import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/routing";
import type { ApiData, ApiLang, ApiMeta } from "@/lib/types";

/**
 * The site is built from the committed copy of the API in data/snapshot (meta.json, data.json, lang.<locale>.json),
 * refreshed by `pnpm snapshot` and the daily workflow. A data refresh is a commit and a deploy: nothing is fetched,
 * cached or regenerated at request time, so a page costs nothing after the build.
 */
const DIR = path.join(process.cwd(), "data", "snapshot");

function load<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(DIR, name), "utf8")) as T;
}

export const apiMeta = load<ApiMeta>("meta.json");
export const apiData = load<ApiData>("data.json");

const langs = new Map<Locale, ApiLang | null>();

/** The game's texts in `locale`, or null when that file is missing: the model then falls back to data.json's English. */
export function apiLang(locale: Locale): ApiLang | null {
  if (!langs.has(locale)) {
    try {
      langs.set(locale, load<ApiLang>(`lang.${locale}.json`));
    } catch {
      console.warn(`[meta] data/snapshot/lang.${locale}.json missing, falling back to data.json texts`);
      langs.set(locale, null);
    }
  }
  return langs.get(locale) ?? null;
}
