"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFavorite } from "@/server/actions";

/** Save a comp for later. The cookie is written by a Server Action; the UI flips optimistically. */
export function FavoriteButton({ compId, saved }: { compId: string; saved: boolean }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(saved);
  return (
    <button
      type="button"
      className={`btn ${optimistic ? "gold" : ""}`}
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
