#!/usr/bin/env node
/**
 * Refresh data/snapshot/{meta,data}.json from the live API. The site serves these files when the API is down.
 * Exits non-zero if the API cannot be read, so a failed refresh never overwrites a good snapshot.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const API = "https://einoow.com/api/meta/kanto/";
const DIR = path.resolve(import.meta.dirname, "..", "data", "snapshot");
await mkdir(DIR, { recursive: true });
for (const name of ["meta", "data"]) {
  const res = await fetch(`${API}${name}.json`, { headers: { "User-Agent": "KantoTacticsMeta snapshot (github.com/mttetc/KantoTacticsMeta)" } });
  if (!res.ok) {
    console.error(`${name}.json: HTTP ${res.status}`);
    process.exit(1);
  }
  const json = await res.json();
  if (name === "meta" && (!Array.isArray(json.comps) || json.comps.length === 0 || json.empty)) {
    console.error("meta.json looks empty, keeping the previous snapshot");
    process.exit(1);
  }
  await writeFile(path.join(DIR, `${name}.json`), JSON.stringify(json));
  console.log(`${name}.json: ${json.generated ?? json.at ?? ""} rules v${json.rules}`);
}
