"use client";

import { useOptimistic, useTransition } from "react";
import { ui } from "@/components/ui/styles";
import { toggleFavorite } from "@/server/actions";

/** Save a comp for later. The cookie is written by a Server Action; the UI flips optimistically. */
export function FavoriteButton({ compId, saved }: { compId: string; saved: boolean }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(saved);
  return (
    <button
      type="button"
      className={optimistic ? ui.btnGold : ui.btn}
      aria-pressed={optimistic}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleFavorite(compId);
        })
      }
    >
      {optimistic ? "★ Saved" : "☆ Save comp"}
    </button>
  );
}
