"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { ui } from "@/components/ui/styles";
import { readFavoritesCookie } from "@/lib/favorites";
import { toggleFavorite } from "@/server/actions";

const noSubscribe = () => () => {};
const notSaved = () => false;

/**
 * Save a comp for later. The page is static: the saved state comes from the cookie, read in the browser after
 * hydration; the cookie is written by a Server Action and the button flips at once.
 */
export function FavoriteButton({ compId }: { compId: string }) {
  const [pending, start] = useTransition();
  const fromCookie = useSyncExternalStore(noSubscribe, () => readFavoritesCookie().includes(compId), notSaved);
  const [toggled, setToggled] = useState<boolean | null>(null);
  const saved = toggled ?? fromCookie;
  return (
    <button
      type="button"
      className={saved ? ui.btnGold : ui.btn}
      aria-pressed={saved}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setToggled(!saved);
          const r = await toggleFavorite(compId);
          setToggled(r.saved);
        })
      }
    >
      {saved ? "★ Saved" : "☆ Save comp"}
    </button>
  );
}
