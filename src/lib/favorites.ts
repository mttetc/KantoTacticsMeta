/** Saved comps live in a cookie (no account). Shared by the server (write, /favorites) and the browser (read). */
export const FAV_COOKIE = "kt_favs";
export const FAV_MAX = 50;

export function parseFavorites(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, FAV_MAX) : [];
  } catch {
    return [];
  }
}

/**
 * Browser side. The cookie is readable by scripts on purpose (it only holds comp ids), so a comp page can be
 * fully static and still show whether this comp is saved, without a request-time render for every visitor.
 */
export function readFavoritesCookie(): string[] {
  if (typeof document === "undefined") return [];
  const entry = document.cookie.split("; ").find((c) => c.startsWith(`${FAV_COOKIE}=`));
  if (!entry) return [];
  const raw = entry.slice(FAV_COOKIE.length + 1);
  try {
    return parseFavorites(decodeURIComponent(raw));
  } catch {
    return parseFavorites(raw);
  }
}
