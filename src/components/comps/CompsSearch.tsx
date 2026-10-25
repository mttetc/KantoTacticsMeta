"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ui } from "@/components/ui/styles";

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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const go = (next: string) => {
    const p = new URLSearchParams(base);
    if (next.trim()) p.set("q", next.trim());
    startTransition(() => router.replace(`/comps${p.size ? `?${p}` : ""}`, { scroll: false }));
  };
  return (
    <span className="relative ml-auto inline-flex">
      <input
        className={`${ui.chip} min-w-[220px] pr-7`}
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => go(e.target.value), 250);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (timer.current) clearTimeout(timer.current);
            go(value);
          }
        }}
        placeholder="Search a Pokémon, item or type…"
        aria-label="Search comps"
      />
      {pending && <span aria-hidden className="absolute top-1/2 right-2.5 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-dim/40 border-t-gold" />}
    </span>
  );
}
