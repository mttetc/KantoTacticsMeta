import { defineRouting } from "next-intl/routing";

/** The site's languages: UI strings in messages/*.json, game texts from the API's lang.json in the same language. */
export const routing = defineRouting({ locales: ["en", "fr"], defaultLocale: "en" });
export type Locale = (typeof routing.locales)[number];

/** Prerendered at build; the other locales render on first visit and join the cache like any page. */
export const PRERENDERED_LOCALES: Locale[] = ["en"];

export const OG_LOCALE: Record<Locale, string> = { en: "en_US", fr: "fr_FR" };
