"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Link } from "@/i18n/navigation";

export interface NavItem {
  href: string;
  label: string;
  count?: number;
}

/**
 * The lobby's segmented nav. Client only for the active state, read from the route tree rather than the
 * pathname: the pathname of the prerendered home shell is not "/" on the host, which left no tab lit on load.
 */
export function TopNav({ items, label }: { items: NavItem[]; label: string }) {
  const segment = useSelectedLayoutSegment(); // null on the home page
  const active = (href: string) => (href === "/" ? segment === null || segment === "pokemon" : segment === href.slice(1));
  return (
    <nav aria-label={label} className="order-3 flex max-w-full flex-1 basis-full animate-card-in gap-1 overflow-x-auto rounded-[18px] border-2 border-white/35 bg-ink/60 p-[5px] [scrollbar-width:none] sm:order-none sm:flex-none sm:basis-auto">
      {items.map((it) => {
        const on = active(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={on ? "page" : undefined}
            className={`inline-flex h-[42px] items-center gap-2 rounded-[13px] px-3 text-[14px] font-bold whitespace-nowrap no-underline transition-colors sm:h-12 sm:px-4 sm:text-[15px] ${
              on
                ? "bg-linear-to-b from-[#ffe066] via-[#fcc419] via-60% to-[#f59f00] text-[#1a1f2e] shadow-[0_3px_0_var(--color-gold-deep)] sm:px-[22px] sm:pl-4 sm:text-lg"
                : "text-[#c5cbe0] hover:bg-white/8 hover:text-white"
            }`}
          >
            {it.label}
            {it.count != null && <span className="text-[.78em] font-semibold opacity-75">{it.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
