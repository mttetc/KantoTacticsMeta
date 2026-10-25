"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ui } from "@/components/ui/styles";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

const DEBOUNCE_MS = 250;

/**
 * The comps search box. Typing updates the URL with a soft navigation (the list streams in, the page stays),
 * instead of the full reload a GET form gave. `base` carries the other filters of the current URL.
 */
export function CompsSearch({ q, base }: { q: string; base: Record<string, string> }) {
  const router = useRouter();
  const [value, setValue] = useState(q);
  const [fromUrl, setFromUrl] = useState(q);
  // the URL changed under us (back button, a filter link): take its query
  if (q !== fromUrl) {
    setFromUrl(q);
    setValue(q);
  }
  const [pending, startTransition] = useTransition();
  const { debounced: search, flush } = useDebouncedCallback((next: string) => {
    const p = new URLSearchParams(base);
    if (next.trim()) p.set("q", next.trim());
    startTransition(() => router.replace(`/comps${p.size ? `?${p}` : ""}`, { scroll: false }));
  }, DEBOUNCE_MS);
  return (
    <span className="relative ml-auto inline-flex">
      <input
        className={`${ui.chip} min-w-[220px] pr-7`}
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          search(e.target.value);
        }}
        onKeyDown={(e) => e.key === "Enter" && flush()}
        placeholder="Search a Pokémon, item or type…"
        aria-label="Search comps"
      />
      {pending && <span aria-hidden className="absolute top-1/2 right-2.5 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-dim/40 border-t-gold" />}
    </span>
  );
}
