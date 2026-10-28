"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

const onPopState = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
};
const getSearch = () => window.location.search;
/** On the server and during hydration: the page is prerendered with the defaults, so it is fully static. */
const noSearch = () => "";

/**
 * Client-owned filter state mirrored to the URL's query string with native history: no server request,
 * the link stays shareable. The page never reads the URL on the server (that would make every visit a
 * function call): it prerenders with `defaults`, and a deep link's filters are applied right after
 * hydration through `fromParams`. `toParams` writes only the non-default keys.
 */
export function useUrlState<T extends object>(defaults: T, toParams: (state: T) => Record<string, string | undefined>, fromParams: (p: URLSearchParams) => Partial<T>) {
  const search = useSyncExternalStore(onPopState, getSearch, noSearch);
  const fromUrl = useMemo(() => (search ? { ...defaults, ...fromParams(new URLSearchParams(search)) } : defaults), [search, defaults, fromParams]);
  const [edited, setEdited] = useState<T | null>(null);
  const update = useCallback(
    (patch: Partial<T>) => {
      setEdited((prev) => {
        const next = { ...(prev ?? fromUrl), ...patch };
        const p = new URLSearchParams();
        for (const [k, v] of Object.entries(toParams(next))) if (v) p.set(k, v);
        window.history.replaceState(null, "", `${window.location.pathname}${p.size ? `?${p}` : ""}`);
        return next;
      });
    },
    [toParams, fromUrl],
  );
  return [edited ?? fromUrl, update] as const;
}
