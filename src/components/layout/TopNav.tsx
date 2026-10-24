"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./layout.module.css";

export interface NavItem {
  href: string;
  label: string;
  count?: number;
}

/** The lobby's segmented nav. Client only for the active state; links prefetch like any other. */
export function TopNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/pokemon") : path.startsWith(href));
  return (
    <nav className={s.nav} aria-label="Meta sections">
      {items.map((it) => (
        <Link key={it.href} href={it.href} className={`${s.tab} ${active(it.href) ? s.on : ""}`} aria-current={active(it.href) ? "page" : undefined}>
          {it.label}
          {it.count != null && <span className={s.n}>{it.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
