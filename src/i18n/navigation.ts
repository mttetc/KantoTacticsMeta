import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Locale-aware wrappers of Next's navigation: `Link` prefixes hrefs with the current locale. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
