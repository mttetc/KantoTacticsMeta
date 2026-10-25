import type { SelectHTMLAttributes } from "react";
import { ui } from "./styles";

/**
 * A native select dressed as a chip. The browser's own arrow is hidden (it spilled out of the pill) and a
 * chevron is drawn in its place; the options still open the platform picker, so keyboard and touch work as usual.
 */
export function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <select {...rest} className={`${ui.chip} w-full cursor-pointer appearance-none pr-8 [&>option]:bg-surface [&>option]:text-txt`}>
        {children}
      </select>
      <svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 text-dim">
        <path d="M2 4.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
