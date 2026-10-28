import "server-only";
import { cookies } from "next/headers";
import { FAV_COOKIE, parseFavorites } from "@/lib/favorites";

/** Comp ids the visitor saved, read from the request cookie (runtime API: only /favorites and the actions use it). */
export async function readFavorites(): Promise<string[]> {
  return parseFavorites((await cookies()).get(FAV_COOKIE)?.value);
}
