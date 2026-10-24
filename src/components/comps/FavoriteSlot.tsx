import { readFavorites } from "@/server/favorites";
import { FavoriteButton } from "./FavoriteButton";

/**
 * Reads the visitor's cookie, so it is the only request-time part of a comp page.
 * Render it under <Suspense>: the rest of the page stays in the static shell.
 */
export async function FavoriteSlot({ compId }: { compId: string }) {
  const favs = await readFavorites();
  return <FavoriteButton compId={compId} saved={favs.includes(compId)} />;
}

export function FavoriteSlotFallback() {
  return (
    <button type="button" className="btn" disabled aria-hidden>
      ☆ Save comp
    </button>
  );
}
