#!/usr/bin/env node
/**
 * Download into public/ any sprite the current Meta needs and the repo does not have yet:
 *   public/sd/{dex}.gif      animated battle sprite
 *   public/thumb/{dex}.webp  static thumbnail
 *   public/items/{id}.png, public/types/{type}.png and {type}-g.png
 * Run it when the game adds Pokémon or items (new rules version). Idempotent; only missing files are fetched.
 */
import { mkdir, access, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://einoow.com/api/meta/kanto/";
const PK = "https://einoow.com/playables/kanto-tactics/pk/";
const PUB = path.resolve(import.meta.dirname, "..", "public");
// the same rules-35 additions as src/lib/fallback-lines.ts (dex numbers only)
const EXTRA_DEX = [49, 137, 139, 71, 114, 57, 31, 141, 25];

const exists = (p) => access(p).then(() => true, () => false);
async function fetchTo(rel, dest) {
  if (await exists(dest)) return false;
  const res = await fetch(PK + rel);
  if (!res.ok) {
    console.warn(`skip ${rel}: HTTP ${res.status}`);
    return false;
  }
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return true;
}

const [meta, data] = await Promise.all([fetch(API + "meta.json").then((r) => r.json()), fetch(API + "data.json").then((r) => r.json())]);
const dex = new Set(EXTRA_DEX);
for (const l of Object.values(data.lines)) for (const d of l.s) dex.add(d);
let n = 0;
for (const d of [...dex].sort((a, b) => a - b)) {
  n += await fetchTo(`sd/${d}.gif`, path.join(PUB, "sd", `${d}.gif`));
  n += await fetchTo(`thumb/${d}.webp`, path.join(PUB, "thumb", `${d}.webp`));
}
for (const id of new Set([...Object.keys(data.items), ...meta.items.map((i) => i.id)])) n += await fetchTo(`items/${id}.png`, path.join(PUB, "items", `${id}.png`));
for (const t of Object.keys(data.traits)) {
  n += await fetchTo(`types/${t}.png`, path.join(PUB, "types", `${t}.png`));
  n += await fetchTo(`types/${t}-g.png`, path.join(PUB, "types", `${t}-g.png`));
}
console.log(`rules v${meta.rules}: ${n} new sprite file(s)`);
