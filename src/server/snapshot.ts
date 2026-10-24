import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type Source = "api" | "snapshot";
export interface Loaded<T> {
  value: T;
  source: Source;
  /** When the snapshot file was written (its `generated` field when it has one). */
  snapshotAt: string | null;
}

export const SNAPSHOT_DIR = path.join(process.cwd(), "data", "snapshot");

/**
 * Try the live source; if it throws or returns nothing usable, serve the committed snapshot instead.
 * The snapshot is the last known-good copy of the API, refreshed daily by `pnpm snapshot` (GitHub Action).
 */
export async function withSnapshot<T>(name: "meta" | "data", live: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { value: await live(), source: "api", snapshotAt: null };
  } catch (err) {
    console.warn(`[meta] live ${name}.json failed, serving snapshot:`, err instanceof Error ? err.message : err);
    const raw = await readFile(path.join(SNAPSHOT_DIR, `${name}.json`), "utf8");
    const value = JSON.parse(raw) as T;
    const generated = (value as { generated?: string; at?: string }).generated ?? (value as { at?: string }).at ?? null;
    return { value, source: "snapshot", snapshotAt: generated };
  }
}
