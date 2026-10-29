import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // the site is built from the committed API files; the few runtime functions (comps list, favourites, OG images) read them too
  outputFileTracingIncludes: { "/**": ["./data/snapshot/*.json"] },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
