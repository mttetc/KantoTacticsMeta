"use client";

import { useCallback, useState } from "react";

/**
 * Client-owned filter state mirrored to the URL's query string with native history: no server request,
 * the link stays shareable and Next keeps `useSearchParams` in sync. `toParams` writes only the non-default keys.
 */
export function useUrlState<T extends object>(initial: T, toParams: (state: T) => Record<string, string | undefined>) {
  const [state, setState] = useState<T>(initial);
  const update = useCallback(
    (patch: Partial<T>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        const p = new URLSearchParams();
        for (const [k, v] of Object.entries(toParams(next))) if (v) p.set(k, v);
        window.history.replaceState(null, "", `${window.location.pathname}${p.size ? `?${p}` : ""}`);
        return next;
      });
    },
    [toParams],
  );
  return [state, update] as const;
}
