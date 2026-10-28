import { routing, type Locale } from "./routing";

/** `alternates` for a page's metadata: canonical in the current locale, hreflang for the others, x-default on the default locale. */
export function alternates(locale: Locale, path: string) {
  const at = (l: string) => `/${l}${path === "/" ? "" : path}`;
  return {
    canonical: at(locale),
    languages: { ...Object.fromEntries(routing.locales.map((l) => [l, at(l)])), "x-default": at(routing.defaultLocale) },
  };
}
