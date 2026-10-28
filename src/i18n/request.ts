import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

/**
 * The locale comes from the `[locale]` root segment (next/root-params: [locale]/layout.tsx is the root layout, nothing
 * above it), so every page stays statically renderable. An unknown locale is a plain 404 (the proxy prefixes every path).
 * A locale passed explicitly (image routes, `getTranslations({ locale })`) wins: root params are not readable there.
 */
export default getRequestConfig(async ({ locale: forced }) => {
  const value = forced ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, value)) notFound();
  const locale = value;
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
});
