/** Absolute origin for metadata, sitemap and OG images. Vercel sets VERCEL_PROJECT_PRODUCTION_URL; override with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
);
export const SITE_NAME = "Kanto Tactics Meta";
export const GAME_URL = "https://einoow.com/kanto-tactics";
export const API_URL = "https://einoow.com/api/meta/kanto/";
export const DISCORD_URL = "https://discord.gg/Z6VCz2F3TN";
