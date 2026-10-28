import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** Redirects /comps to /<locale>/comps from the Accept-Language header (and the locale cookie once chosen). */
export default createMiddleware(routing);

export const config = {
  // everything but Next internals, the API route, the metadata routes and files (sprites, robots, sitemap…)
  matcher: ["/((?!api|_next|_vercel|icon|apple-icon|manifest.webmanifest|.*\\..*).*)"],
};
