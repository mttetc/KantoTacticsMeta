import "server-only";
import type { ApiLang } from "@/lib/types";

interface I18n {
  es: string;
  en: string;
}

/**
 * How the model reads a text: lang.json in the site's locale when it answered, else data.json's own English field
 * (its Spanish one would serve an `es` locale). One object so every builder picks the same way.
 */
export interface Texts {
  locale: string;
  lang: ApiLang | null;
  /** data.json's bilingual field in the best available language */
  pick: (v: I18n | string | null | undefined) => string;
}

export function makeTexts(locale: string, lang: ApiLang | null): Texts {
  const key: keyof I18n = locale === "es" ? "es" : "en";
  return {
    locale,
    lang,
    pick: (v) => (v == null ? "" : typeof v === "string" ? v : (v[key] ?? v.en ?? v.es ?? "")),
  };
}
