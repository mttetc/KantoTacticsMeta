"use client";

import { useCallback, useEffect, useRef } from "react";

/** The latest `fn`, called once `ms` after the last `debounced()` call; `flush()` runs a pending call now. */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  const fnRef = useRef(fn);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<A | null>(null);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);
  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);
  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current) {
      const args = pending.current;
      pending.current = null;
      fnRef.current(...args);
    }
  }, []);
  const debounced = useCallback(
    (...args: A) => {
      pending.current = args;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, ms);
    },
    [flush, ms],
  );
  return { debounced, flush };
}
