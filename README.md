# Kanto Tactics Meta

Tier lists and comp guides for [Kanto Tactics](https://einoow.com/kanto-tactics) Ranked, built on the game's public
[Meta API](https://einoow.com/api/meta/kanto/) and styled like the in-game Meta panel and lobby.

Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript, CSS Modules. No database:
the API is the source of truth, read on the server and cached.

## Routes and rendering

| Route | Rendering | Why |
| --- | --- | --- |
| `/` Pokémon tier list | Static shell + request-time list (`searchParams`) → client takes over | The first paint matches the shared URL; sorting and filtering 70 rows is instant in the browser and mirrored to the URL. |
| `/pokemon/[line]`, `/items/[id]`, `/types/[slug]` | SSG via `generateStaticParams`, refreshed with the Meta (ISR) | Fully known sets; prerendered pages with `generateMetadata` and OG images. |
| `/@modal/(.)pokemon/[line]` and friends | Intercepting + parallel route | Same Server Component as the page, shown as a `<dialog>` on client navigation; shareable URL, Back closes it. |
| `/comps` | Static shell + request-time list from `searchParams` | Filters are plain links (no client JS); 833 comps are too many to ship to the browser. |
| `/comps/[slug]` | SSG for reliable comps, on demand for the rest | Board, stage guide, carry and key items. The only request-time part is the **Save** button (cookie), streamed under `<Suspense>`. |
| `/favorites` | Request-time (cookie) inside the static shell | Per-visitor, no account. |
| `/seals` | Static shell + client filters | Catalogue; the API publishes no seal stats. |
| `/api/revalidate` | Route Handler | Drops the Meta cache; called by the Vercel cron after the API's daily refresh. |
| `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, `opengraph-image` | Metadata routes | SEO and social cards. |

Data layer: `src/server/api.ts` fetches the two API files under `"use cache"` with `cacheLife` (1 h) and the `meta` tag;
`src/server/meta.ts` builds the normalised model once per revalidation (tiers, carry roles, slugs, typical placement)
and exposes `React.cache`d selectors so `generateMetadata` and the page share one read. Mutations live in
`src/server/actions.ts` (`toggleFavorite`, `clearFavorites`, `refreshMeta`). Pure logic (tiers, carry, placement
geometry) sits in `src/lib` with Vitest tests.

## Develop

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # vitest
pnpm lint && pnpm typecheck
pnpm build && pnpm start
pnpm sprites      # download missing sprites into public/ after a game update
```

Copy `.env.example` to `.env.local`. `CRON_SECRET` protects `/api/revalidate`; `NEXT_PUBLIC_SITE_URL` sets the
canonical origin outside Vercel.

## Tiers

Pokémon, items and types: the game's tiers (average place against the week's reference). The API stops at C;
**D** is this site's split, mirroring S (reference + 0.5). Comps are graded on the pessimistic average
(avg + 95 % CI): S ≤ ref − 0.8, A ≤ ref − 0.15, B ≤ ref + 0.6, C ≤ ref + 1.2, D above; the "Best" sort uses
the same number. Comps under 30 effective games only have their 4 core units in the API and are hidden by default.

Carry = the unit with the most offensive item share, sub = the second when geared at least 40 % as often,
tank = the most defensive one (see `src/lib/carry.ts`).

## Credits

Unofficial fan page, not affiliated with Nintendo, Creatures or GAME FREAK. Game, data, sprites and icons belong
to Kanto Tactics by Einoow. The API is public and read-only; poll it at most once an hour and cache it.
