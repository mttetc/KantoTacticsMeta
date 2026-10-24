import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Background } from "@/components/layout/Background";
import { BackToTop } from "@/components/layout/BackToTop";
import { MetaIcon } from "@/components/layout/MetaIcon";
import { LeftPanel, RightPanel } from "@/components/layout/SidePanels";
import { TopNav } from "@/components/layout/TopNav";
import { int } from "@/lib/format";
import { API_URL, DISCORD_URL, GAME_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import { getMeta } from "@/server/meta";
import s from "@/components/layout/layout.module.css";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fredoka", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: "Tier lists and comp guides for Kanto Tactics Ranked, from the game's public Meta API. Pokémon, comps, items, types and seals, updated daily.",
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#111216", colorScheme: "dark", width: "device-width", initialScale: 1, viewportFit: "cover" };

/**
 * The lobby chrome. The Meta is read once (cached, shared by every page); the side panels are static per
 * refresh, so the whole shell prerenders. Pages stream into the centre panel; @modal is the intercepted detail.
 */
export default async function RootLayout({ children, modal }: LayoutProps<"/">) {
  const meta = await getMeta();
  const nav = [
    { href: "/", label: "Pokémon", count: meta.units.length },
    { href: "/comps", label: "Comps", count: meta.comps.filter((c) => c.reliable).length },
    { href: "/items", label: "Items", count: meta.items.length },
    { href: "/types", label: "Types", count: meta.traits.length },
    { href: "/seals", label: "Seals", count: meta.seals.length },
    { href: "/favorites", label: "Saved" },
  ];
  return (
    <html lang="en" className={`${fredoka.variable} ${inter.variable}`}>
      <body>
        <Background />

        {meta.source === "snapshot" && (
          <div className={`${s.banner} gutter`} role="status">
            The game&apos;s API is not answering right now. Showing the last snapshot{meta.snapshotAt ? ` from ${meta.snapshotAt.slice(0, 10)}` : ""}; the live data comes back on its own.
          </div>
        )}
        <div className={`${s.top} gutter`}>
          <div className={s.chips}>
            <span className={`${s.live} ${s.gold}`} title="Game rules version in this window">
              🏆 <b>Rules v{meta.rules}</b> Ranked
            </span>
            <span className={s.live}>
              <i />
              <b>{int(meta.games)}</b> games · 7 days
            </span>
          </div>
          <Suspense fallback={<nav className={s.nav} aria-hidden />}>
            <TopNav items={nav} />
          </Suspense>
          <div className={s.right}>
            <span className="note" style={{ margin: 0 }}>
              {meta.from} → {meta.to}
            </span>
          </div>
        </div>

        <div className="gutter">
          <div className={s.lobby}>
            <a className={s.logo} href={GAME_URL} target="_blank" rel="noopener" aria-label="Kanto Tactics, open the game">
              <span className={s.kanto}>
                <span>K</span><span>A</span><span>N</span><span>T</span><span>O</span>
              </span>
              <span className={s.tactics}>TACTICS</span>
              <span className={s.metaTag}>
                <MetaIcon />
                Meta
              </span>
            </a>
            <div className={s.cols}>
              <LeftPanel meta={meta} />
              <main className={`${s.panel} ${s.center}`}>{children}</main>
              <RightPanel meta={meta} />
            </div>
          </div>
          <a className={s.bigPlay} href={GAME_URL} target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M7 4.5v15l12-7.5z" />
            </svg>
            Play Kanto Tactics!
          </a>
          <footer className={s.foot}>
            <span>
              Data:{" "}
              <a href={API_URL} target="_blank" rel="noopener">
                Kanto Tactics Meta API
              </a>
              , Ranked, humans only · Unofficial fan page, not affiliated with Nintendo, Creatures or GAME FREAK · Sprites and icons belong to the game
            </span>
            <nav aria-label="More">
              <Link href="/about">About the data</Link>
              <a href={`${GAME_URL}/changelog`} target="_blank" rel="noopener">
                Changelog
              </a>
              <a href={DISCORD_URL} target="_blank" rel="noopener">
                Discord
              </a>
              <a href="https://github.com/mttetc/KantoTacticsMeta" target="_blank" rel="noopener">
                Source
              </a>
            </nav>
          </footer>
        </div>
        {modal}
        <BackToTop />
      </body>
    </html>
  );
}
