#!/usr/bin/env node
/**
 * Refresh data/snapshot from the live API: meta.json, data.json and lang.<locale>.json for each site language.
 * The site is built from these files (see src/server/api.ts). Exits non-zero if the API cannot be read or looks
 * empty, so a failed refresh never overwrites a good copy.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const API = "https://einoow.com/api/meta/kanto/";
const LOCALES = ["en", "fr"];
const DIR = path.resolve(import.meta.dirname, "..", "data", "snapshot");
const headers = { "User-Agent": "KantoTacticsMeta snapshot (github.com/mttetc/KantoTacticsMeta)" };

async function getJson(route) {
  const res = await fetch(API + route, { headers });
  if (!res.ok) throw new Error(`${route}: HTTP ${res.status}`);
  return res.json();
}

await mkdir(DIR, { recursive: true });
try {
  const [meta, data, ...langs] = await Promise.all([getJson("meta.json"), getJson("data.json"), ...LOCALES.map((l) => getJson(`lang.json?lang=${l}`))]);
  if (meta.empty || !Array.isArray(meta.comps) || meta.comps.length === 0) throw new Error("meta.json looks empty");
  if (!data.lines || !data.items) throw new Error("data.json looks empty");
  langs.forEach((lang, i) => {
    if (!lang.pokemon) throw new Error(`lang.json?lang=${LOCALES[i]} looks empty`);
  });
  await writeFile(path.join(DIR, "meta.json"), JSON.stringify(meta));
  await writeFile(path.join(DIR, "data.json"), JSON.stringify(data));
  await Promise.all(LOCALES.map((l, i) => writeFile(path.join(DIR, `lang.${l}.json`), JSON.stringify(langs[i]))));
  console.log(`meta.json: ${meta.generated} rules v${meta.rules}; data.json: rules v${data.rules}; lang: ${LOCALES.join(", ")}`);
} catch (err) {
  console.error("snapshot not refreshed:", err instanceof Error ? err.message : err);
  process.exit(1);
}
