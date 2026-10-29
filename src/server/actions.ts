"use server";

import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import { getMeta } from "./meta";
import { FAV_COOKIE, FAV_MAX } from "@/lib/favorites";
import { readFavorites } from "./favorites";

// not httpOnly: the browser reads it to show the saved state on static comp pages (lib/favorites); it holds comp ids only
const COOKIE_OPTS = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const, httpOnly: false, secure: process.env.NODE_ENV === "production" };

/** Save or unsave a comp for this visitor (cookie, no account). Returns the new state. */
export async function toggleFavorite(compId: string): Promise<{ saved: boolean; count: number }> {
  // ids are language-independent; root params are not readable in a Server Action, so the default locale's model does
  const meta = await getMeta(routing.defaultLocale);
  if (!meta.comps.some((c) => c.id === compId)) throw new Error("Unknown comp");
  const current = await readFavorites();
  const saved = !current.includes(compId);
  const next = saved ? [compId, ...current].slice(0, FAV_MAX) : current.filter((id) => id !== compId);
  (await cookies()).set(FAV_COOKIE, JSON.stringify(next), COOKIE_OPTS);
  return { saved, count: next.length };
}

export async function clearFavorites(): Promise<void> {
  (await cookies()).delete(FAV_COOKIE);
}
