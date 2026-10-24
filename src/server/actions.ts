"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { getMeta } from "./meta";
import { FAV_COOKIE, FAV_MAX, readFavorites } from "./favorites";
import { META_TAG } from "./api";

const COOKIE_OPTS = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const, httpOnly: true, secure: process.env.NODE_ENV === "production" };

/** Save or unsave a comp for this visitor (cookie, no account). Returns the new state. */
export async function toggleFavorite(compId: string): Promise<{ saved: boolean; count: number }> {
  const meta = await getMeta();
  if (!meta.comps.some((c) => c.id === compId)) throw new Error("Unknown comp");
  const current = await readFavorites();
  const saved = !current.includes(compId);
  const next = saved ? [compId, ...current].slice(0, FAV_MAX) : current.filter((id) => id !== compId);
  (await cookies()).set(FAV_COOKIE, JSON.stringify(next), COOKIE_OPTS);
  revalidatePath("/favorites");
  return { saved, count: next.length };
}

export async function clearFavorites(): Promise<void> {
  (await cookies()).delete(FAV_COOKIE);
  revalidatePath("/favorites");
}

/**
 * Drop the cached Meta so the next request fetches the API again.
 * Protected by a shared secret: the API asks to poll at most once an hour.
 */
export async function refreshMeta(formData: FormData): Promise<{ ok: boolean }> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || formData.get("secret") !== secret) return { ok: false };
  revalidateTag(META_TAG, "max");
  return { ok: true };
}
