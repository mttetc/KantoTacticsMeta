import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Off on purpose: with it on, Next 16.4.3 re-fetches one link's RSC payload in a loop on every page view
  // (150+ identical requests per visit, seen in prod as the whole CDN / origin / CPU bill). Re-test on upgrade.
  partialPrefetching: false,
  // the API snapshot is read from disk when the live API is down: ship it with every server function
  outputFileTracingIncludes: { "/**": ["./data/snapshot/*.json"] },
};

export default nextConfig;
