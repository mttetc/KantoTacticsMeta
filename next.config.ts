import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // the API snapshot is read from disk when the live API is down: ship it with every server function
  outputFileTracingIncludes: { "/**": ["./data/snapshot/*.json"] },
};

export default nextConfig;
