import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { getMeta } from "@/server/meta";

type Freq = "daily" | "weekly" | "monthly";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // slugs are ids, the same in every language: the default locale's model lists them
  const m = await getMeta(routing.defaultLocale);
  const at = new Date(m.generated);
  const pages: [string, Freq, number][] = [
    ["/", "daily", 1],
    ["/comps", "daily", 0.9],
    ["/game-plan", "daily", 0.8],
    ["/items", "daily", 0.7],
    ["/types", "daily", 0.7],
    ["/seals", "weekly", 0.5],
    ["/about", "monthly", 0.3],
    ...m.units.map((u): [string, Freq, number] => [`/pokemon/${u.line}`, "daily", 0.8]),
    ...m.items.map((i): [string, Freq, number] => [`/items/${i.id}`, "daily", 0.6]),
    ...m.traits.map((t): [string, Freq, number] => [`/types/${t.slug}`, "daily", 0.6]),
    ...m.comps.filter((c) => c.reliable).map((c): [string, Freq, number] => [`/comps/${c.slug}`, "daily", 0.7]),
  ];
  const url = (locale: string, p: string) => new URL(`/${locale}${p === "/" ? "" : p}`, SITE_URL).toString();
  return pages.flatMap(([p, changeFrequency, priority]) =>
    routing.locales.map((locale) => ({
      url: url(locale, p),
      lastModified: at,
      changeFrequency,
      priority,
      alternates: { languages: { ...Object.fromEntries(routing.locales.map((l) => [l, url(l, p)])), "x-default": url(routing.defaultLocale, p) } },
    })),
  );
}
