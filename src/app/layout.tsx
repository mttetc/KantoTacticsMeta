import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Background } from "@/components/layout/Background";
import { BackToTop } from "@/components/layout/BackToTop";
import { MetaIcon } from "@/components/layout/MetaIcon";
import { LeftPanel, RightPanel } from "@/components/layout/SidePanels";
import { TopNav } from "@/components/layout/TopNav";
import { ui } from "@/components/ui/styles";
import { int } from "@/lib/format";
import { API_URL, DISCORD_URL, GAME_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import { getMeta } from "@/server/meta";
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

/** Side gutter that also clears a phone's system bar. */
const gutter = "pl-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))]";
/** A lobby chip ("● 15,705 games · 7 days"). */
const live = "inline-flex h-[34px] items-center gap-1.5 rounded-full border-2 bg-ink/60 pr-3 pl-2.5 text-[13px] whitespace-nowrap text-white";

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
          <div role="status" className={`${gutter} border-b-2 border-[#0b0e18] bg-gold py-2 text-center text-[14px] font-semibold text-[#1a1f2e]`}>
            The game&apos;s API is not answering right now. Showing the last snapshot{meta.snapshotAt ? ` from ${meta.snapshotAt.slice(0, 10)}` : ""}; the live data comes back on its own.
          </div>
        )}

        <div className={`${gutter} flex min-h-[74px] flex-wrap items-center gap-4 bg-linear-to-b from-[#0e1228d1] to-[#0e12288c] py-2`}>
          <Suspense fallback={<nav aria-hidden className="h-[62px] flex-none" />}>
            <TopNav items={nav} />
          </Suspense>
          <div className="flex animate-in-l-fast flex-wrap items-center gap-2">
            <span className={`${live} border-[#ffe066a6]`} title="Game rules version in this window">
              🏆 <b className="text-[17px] text-gold-hi">Rules v{meta.rules}</b> Ranked
            </span>
            <span className={`${live} border-[#8ce99a8c]`}>
              <i className="h-[9px] w-[9px] rounded-full bg-[#69db7c] shadow-[0_0_8px_#69db7c]" />
              <b className="text-[17px] text-[#8ce99a]">{int(meta.games)}</b> games · 7 days
            </span>
          </div>
          <span className={`${ui.note} m-0 ml-auto animate-in-r-fast`}>
            {meta.from} → {meta.to}
          </span>
        </div>

        <div className={gutter}>
          <div className="mx-auto mt-3.5 flex max-w-[1500px] flex-col gap-2.5">
            <a href={GAME_URL} target="_blank" rel="noopener" aria-label="Kanto Tactics, open the game" className="relative mx-auto mt-1 mb-1.5 block w-max max-w-full animate-title-drop text-center leading-[.9] no-underline">
              <span className="block text-[clamp(44px,6vw,76px)] font-bold tracking-[.02em] whitespace-nowrap">
                {["K", "A", "N", "T", "O"].map((ch, i) => (
                  <span
                    key={ch}
                    style={{ animationDelay: `${(i * 0.11).toFixed(2)}s, ${(1 + i * 0.09).toFixed(2)}s` }}
                    className="inline-block animate-letter text-gold [-webkit-text-stroke:3px_#2a4fa8] [paint-order:stroke] [text-shadow:0_2px_#2a4fa8,0_4px_#2a4fa8,0_6px_#1d3a80,0_8px_#1d3a80,0_10px_#142a5e,0_14px_18px_#00000073]"
                  >
                    {ch}
                  </span>
                ))}
              </span>
              <span className="mt-1.5 inline-block -rotate-2 rounded-xl border-[3px] border-white bg-linear-to-b from-[#e03131] to-[#a51111] px-4 pt-[3px] pb-[5px] text-[clamp(16px,2vw,24px)] font-bold tracking-[.32em] text-white [text-indent:.32em] shadow-[0_5px_#6b0b0b,0_10px_20px_#0006] [text-shadow:0_2px_#6b0b0b]">
                TACTICS
              </span>
              <span className="mt-2.5 ml-3 inline-flex rotate-2 items-center gap-1.5 rounded-full border-2 border-gold-hi bg-linear-to-b from-[#0e1228eb] to-[#1a2140e0] py-1 pr-3 pl-[9px] align-bottom text-[16px] font-bold text-gold-hi shadow-[0_3px_0_#0a0e1acc,0_0_16px_#ffe0664d]">
                <MetaIcon className="h-[18px] w-[18px]" />
                Meta
              </span>
            </a>

            {/* one column on phones and tablets, three from xl: side panels stretch to the meta panel's height and stick */}
            <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(220px,260px)_minmax(0,1fr)_minmax(240px,300px)]">
              <LeftPanel meta={meta} />
              <main className="order-1 relative flex min-w-0 animate-meta-pop flex-col overflow-hidden rounded-[20px] border-4 border-paper bg-linear-to-b from-[#1b2030fa] to-[#10131efc] shadow-[inset_0_0_0_3px_var(--color-gold),inset_0_0_0_6px_#0b0e18,0_0_0_3px_#0b0e18,0_18px_60px_#0009] xl:order-none">
                {children}
              </main>
              <RightPanel meta={meta} />
            </div>
          </div>

          <a
            href={GAME_URL}
            target="_blank"
            rel="noopener"
            className="mx-auto mt-[18px] flex min-h-[72px] w-[min(640px,100%)] animate-pulse-gold items-center justify-center gap-3.5 rounded-[22px] border-4 border-ink bg-linear-to-b from-[#ffe066] via-[#fcc419] via-60% to-[#f59f00] px-7 text-[clamp(24px,3.4vw,36px)] font-bold text-[#1a1f2e] no-underline hover:brightness-105 active:translate-y-[3px] active:shadow-[0_3px_#0a0e1a]"
          >
            <svg className="h-[.9em] w-[.9em]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M7 4.5v15l12-7.5z" />
            </svg>
            Play Kanto Tactics!
          </a>

          <footer className="mx-auto mt-3.5 flex max-w-[1500px] flex-wrap items-center justify-between gap-x-[18px] gap-y-1.5 pb-4 text-[12px] leading-[1.5] text-[#1b1f4ac7] [text-shadow:0_1px_0_#ffffff59] [&_a]:font-semibold [&_a]:text-[#1b1f4ac7] [&_a]:underline">
            <span className="min-w-0 flex-[1_1_420px]">
              Data:{" "}
              <a href={API_URL} target="_blank" rel="noopener">
                Kanto Tactics Meta API
              </a>
              , Ranked, humans only · Unofficial fan page, not affiliated with Nintendo, Creatures or GAME FREAK · Sprites and icons belong to the game
            </span>
            <nav aria-label="More" className="flex flex-wrap justify-end gap-3.5">
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
