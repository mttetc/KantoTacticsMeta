# Kanto Tactics Meta

**Live: [kanto-tactics-meta.vercel.app](https://kanto-tactics-meta.vercel.app/)**

Tier lists and comp guides for [Kanto Tactics](https://einoow.com/kanto-tactics) Ranked, built on the game's public
[Meta API](https://einoow.com/api/meta/kanto/) and styled like the in-game Meta panel and lobby. Updated daily.

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=fff)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-deployed-000?logo=vercel&logoColor=fff)](https://kanto-tactics-meta.vercel.app/)

![Pokémon tier list, styled like the game's lobby](docs/screenshot-home.png)

![A comp page: carry, sub and tank, key items, final team and hex placement](docs/screenshot-comp.png)

## What it shows

- **Pokémon, items, types**: S to D tier lists from the week's average place, sortable and filterable, each with its own page (and a modal when you click from a list): items players put on it, best comps with it, synergy thresholds.
- **Comps**: every comp of the last 7 days with **carry, sub and tank** marked, key items, final team with item shares, placement on the hex board from real games, stage-by-stage guide and variants. Filters are URL links; tier S is the default view.
- **Seals**: catalogue of the game's augments by round, rarity and category (the API publishes no stats for them).
- **Saved comps**: a cookie, no account.
- Side panels like the lobby: snapshot of the window, tier legend, shop odds, best and most played comps of the week.

## Stack

Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript, CSS Modules, Vitest, pnpm.
No database: the API is the source of truth, read on the server and cached for an hour.

| Route | Rendering | Why |
| --- | --- | --- |
| `/` Pokémon tier list | Static shell + request-time list (`searchParams`) → client takes over | The first paint matches the shared URL; sorting and filtering 70 rows is instant in the browser and mirrored to the URL. |
| `/pokemon/[line]`, `/items/[id]`, `/types/[slug]` | SSG via `generateStaticParams`, refreshed with the Meta (ISR) | Fully known sets; prerendered pages with `generateMetadata` and OG images. |
| `@modal/(.)pokemon/[line]` and friends | Intercepting + parallel route | The same Server Component as the page, shown as a `<dialog>` on client navigation; shareable URL, Back closes it. |
| `/comps` | Static shell + request-time list from `searchParams` | Filters are plain links, no client JS; 833 comps are too many to ship to the browser. |
| `/comps/[slug]` | SSG for reliable comps, on demand for the rest | The only request-time part is the **Save** button (cookie), streamed under `<Suspense>`. |
| `/favorites` | Request-time (cookie) inside the static shell | Per-visitor. |
| `/api/revalidate` | Route Handler | Drops the Meta cache; called by the Vercel cron after the API's daily refresh. |
| `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, `opengraph-image` | Metadata routes | SEO and social cards. |

- `src/server/api.ts` fetches the two API files under `"use cache"` with `cacheLife` (1 h) and the `meta` tag.
- `src/server/meta.ts` builds the normalised model once per revalidation (tiers, carry roles, slugs, typical placement) and exposes `React.cache`d selectors so `generateMetadata` and the page share one read.
- `src/server/actions.ts` holds the Server Actions (`toggleFavorite`, `clearFavorites`, `refreshMeta`).
- `src/lib` is pure logic (tiers, carry, placement geometry) covered by Vitest.

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

## If the API goes down

`data/snapshot/meta.json` and `data.json` are a committed copy of the two API files. When a live read fails
(network error, non-200, timeout), the server serves the snapshot instead, shows a yellow banner with its date,
and retries the API every few minutes. A GitHub Action (`.github/workflows/snapshot.yml`) refreshes the snapshot
daily after the API's 03:40 UTC regeneration; run `pnpm snapshot` to do it by hand.

## How the numbers are read

- **Pokémon, items, types** use the game's tiers: average place against the week's reference place. The API stops at C; **D** is this site's split, mirroring S (reference + 0.5). A Pokémon's tier is the average of every board it ends on, in any comp, so a unit can be B on its own and still sit in most tier S comps; its page says in how many.
- **Comps** are graded on the pessimistic average (avg + 95 % CI): S ≤ ref − 0.8, A ≤ ref − 0.15, B ≤ ref + 0.6, C ≤ ref + 1.2, D above. The "Best" sort uses the same number. Comps under 30 effective games only have their 4 core units in the API and are hidden by default.
- **Carry** = the unit with the most offensive item share (Attack, Sp. Atk, speed, crit, Energy, drain), **sub** = the second when geared at least 40 % as often, **tank** = the most defensive one (HP, defenses, shields). See `src/lib/carry.ts`.
- **Placement**: the API gives a board for comps with 50+ boards; below that the site shows where each unit usually stands in the comps that do have one.

## Credits

Unofficial fan page, not affiliated with Nintendo, Creatures or GAME FREAK. Game, data, sprites and icons belong
to [Kanto Tactics](https://einoow.com/kanto-tactics) by Einoow. The API is public and read-only: poll it at most
once an hour and cache it on your side.
