"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** EN · FR · ES: the same page in another language (next-intl remembers the choice in its cookie). */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("layout");
  return (
    <nav aria-label={t("language")} className="flex items-center gap-0.5 rounded-full border border-line bg-ink/60 p-0.5 text-[12px] font-bold">
      {routing.locales.map((l) => (
        <Link key={l} href={pathname} locale={l} aria-current={l === locale ? "true" : undefined} className={`rounded-full px-2 py-0.5 uppercase no-underline ${l === locale ? "bg-gold text-ink" : "text-dim hover:text-txt"}`}>
          {l}
        </Link>
      ))}
    </nav>
  );
}
