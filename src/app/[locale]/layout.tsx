import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/i18n/links";
import { OG_LOCALE, routing, type Locale } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "../globals.css";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fredoka", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-inter", display: "swap" });

/** Every language is built ahead: the site is static, a data refresh is a new build. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("layout");
  return {
    metadataBase: SITE_URL,
    title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
    description: t("description"),
    applicationName: SITE_NAME,
    alternates: alternates(locale, "/"),
    openGraph: { type: "website", siteName: SITE_NAME, locale: OG_LOCALE[locale] },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = { themeColor: "#111216", colorScheme: "dark", width: "device-width", initialScale: 1, viewportFit: "cover" };

/**
 * The document only. Next sends the root layout a second time in every page's payload, wrapped around the 404
 * fallback, so the lobby chrome (header, side panels, footer, modal slot) lives one level down in (lobby)/layout.tsx
 * and travels once.
 */
export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = (await getLocale()) as Locale;
  return (
    <html lang={locale} className={`${fredoka.variable} ${inter.variable}`}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
