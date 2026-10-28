"use client";

import { hasLocale, useLocale, useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const noSubscribe = () => () => {};
const none = () => null;

/** The visitor's first browser language the site has a translation for, other than the default one. */
function detect(): Locale | null {
  for (const tag of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const code = tag.toLowerCase().split("-")[0];
    if (code !== routing.defaultLocale && hasLocale(routing.locales, code)) return code;
  }
  return null;
}

/**
 * Nothing hard-coded: the language is picked automatically (proxy + cookie), and this only offers EN plus the
 * language the browser asks for, when the site has it. An English browser sees no switcher at all; a visitor
 * landing on a French link with an English browser still gets EN + FR to go back.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("layout");
  // null on the server and during hydration (the layout is static), the browser's language right after
  const detected = useSyncExternalStore(noSubscribe, detect, none);
  const second = detected ?? (locale !== routing.defaultLocale ? (locale as Locale) : null);
  if (!second) return null;
  const options: Locale[] = [routing.defaultLocale, second];
  return (
    <nav aria-label={t("language")} className="flex items-center gap-0.5 rounded-full border border-line bg-ink/60 p-0.5 text-[12px] font-bold">
      {options.map((l) => (
        <Link key={l} href={pathname} locale={l} aria-current={l === locale ? "true" : undefined} className={`rounded-full px-2 py-0.5 uppercase no-underline ${l === locale ? "bg-gold text-ink" : "text-dim hover:text-txt"}`}>
          {l}
        </Link>
      ))}
    </nav>
  );
}
