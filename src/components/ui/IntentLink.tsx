"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "prefetch">;

/**
 * Prefetch on intent, as in the Next docs ("hover-triggered prefetch" with Partial Prefetching): the route's shared
 * App Shell is prefetched as for any link ("auto"), and the link's own page only once the visitor hovers, touches or
 * focuses it (`true`). A grid of 70 cards then costs one shell, not 70 page fetches, and the hovered card is instant.
 */
export function IntentLink({ onMouseEnter, onTouchStart, onFocus, ...props }: Props) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={intent ? true : "auto"}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
    />
  );
}
