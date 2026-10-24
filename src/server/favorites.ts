import "server-only";
import { cookies } from "next/headers";

export const FAV_COOKIE = "kt_favs";
export const FAV_MAX = 50;

/** Comp ids the visitor saved, read from the request cookie (runtime API: call it under Suspense). */
export async function readFavorites(): Promise<string[]> {
  const raw = (await cookies()).get(FAV_COOKIE)?.value;
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, FAV_MAX) : [];
  } catch {
    return [];
  }
}
