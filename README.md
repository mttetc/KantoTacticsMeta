# Kanto Tactics Meta

Tier lists and comp guides for [Kanto Tactics](https://einoow.com/kanto-tactics) Ranked, built on the game's
public [Meta API](https://einoow.com/api/meta/kanto/) and styled like the in-game Meta panel and lobby.

- **Pokémon**, **Items**, **Types**: S to D tier lists, sortable and filterable, with a detail card per entry.
- **Comps**: every comp of the last 7 days with carry and key items highlighted, final team, item holders,
  placement on the hex board (real boards), stage-by-stage guide and variants.
- Side panels: snapshot of the window, tier legend, shop odds, best and most played comps.

The page is a single static `index.html` that loads `data.json`. No build step, no framework.

## Refresh the data

The API updates daily at 03:40 UTC. To rebuild `data.json` and download any missing sprite:

```sh
python3 scripts/build_data.py
```

A GitHub Action (`.github/workflows/refresh.yml`) runs it every day and commits the result.

## Run locally

Any static server works, for example:

```sh
python3 -m http.server 8080
```

then open <http://localhost:8080/>.

## Tiers

Pokémon, items and types: S, A, B and C come from the API (average place against the week's reference
place). The API stops at C; **D** is this page's split, mirroring S: average place at or above reference + 0.5.

Comps are graded stricter, on the pessimistic average (avg + 95 % CI) against the reference:
S ≤ ref − 0.8, A ≤ ref − 0.15, B ≤ ref + 0.6, C ≤ ref + 1.2, D above. Comps under 30 effective games
only have their 4 core units in the API (no stars, shares or board) and are hidden by default.

## What the API does not give

No pick rates for Seals (the augments): the Seals tab is the catalogue only. No board for comps under
50 boards: the page then shows where each unit usually stands in the comps that do have one.

## Credits

Unofficial fan page, not affiliated with Nintendo, Creatures or GAME FREAK. Game, data, sprites and icons
belong to [Kanto Tactics](https://einoow.com/kanto-tactics) by Einoow. Data is read-only and public, see the
API page for its terms (poll at most once an hour, cache on your side).

## Deploy

Static files only: import the repo in Vercel with no build command and `.` as output, or enable GitHub Pages on `main`.
`vercel.json` sets long cache for sprites and one hour for `data.json`.
