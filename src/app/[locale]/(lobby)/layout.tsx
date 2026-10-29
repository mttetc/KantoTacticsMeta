import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Background } from "@/components/layout/Background";
import { BackToTop } from "@/components/layout/BackToTop";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MetaIcon } from "@/components/layout/MetaIcon";
import { LeftPanel, RightPanel } from "@/components/layout/SidePanels";
import { TopNav } from "@/components/layout/TopNav";
import { ui } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { int } from "@/lib/format";
import { API_URL, DISCORD_URL, GAME_URL } from "@/lib/site";
import { getMeta } from "@/server/meta";

/** Side gutter that also clears a phone's system bar. */
const gutter = "pl-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))]";
/** A lobby chip ("● 15,705 games · 7 days"). */
const live = "inline-flex h-[34px] items-center gap-1.5 rounded-full border-2 bg-ink/60 pr-3 pl-2.5 text-[13px] whitespace-nowrap text-white";

/**
 * The lobby chrome, in the locale of the URL: one Meta per locale, built once and shared by every page, so the whole
 * shell prerenders. Pages render into the centre panel; @modal is the intercepted detail.
 */
export default async function LobbyLayout({ children, modal }: LayoutProps<"/[locale]">) {
  const locale = (await getLocale()) as Locale;
  const [meta, t, nav] = await Promise.all([getMeta(locale), getTranslations("layout"), getTranslations("nav")]);
  const items = [
    { href: "/", label: nav("pokemon"), count: meta.units.length },
    { href: "/comps", label: nav("comps"), count: meta.comps.filter((c) => c.reliable).length },
    { href: "/game-plan", label: nav("gamePlan") },
    { href: "/items", label: nav("items"), count: meta.items.length },
    { href: "/types", label: nav("types"), count: meta.traits.length },
    { href: "/seals", label: nav("seals"), count: meta.seals.length },
    { href: "/favorites", label: nav("saved") },
  ];
  return (
    <>
      <Background />
      {meta.stale && (
        <div role="status" className={`${gutter} border-b-2 border-[#0b0e18] bg-gold py-2 text-center text-[14px] font-semibold text-[#1a1f2e]`}>
          {t("stale", { date: meta.generated.slice(0, 10) })}
        </div>
      )}

      <div className={`${gutter} flex min-h-[74px] flex-wrap items-center gap-4 bg-linear-to-b from-[#0e1228d1] to-[#0e12288c] py-2`}>
        <div className="flex flex-[1_1_220px] animate-in-l-fast flex-wrap items-center gap-2">
          <span className={`${live} border-[#ffe066a6]`} title={t("rulesTitle")}>
            🏆 <b className="text-[17px] text-gold-hi">{t("rules", { v: meta.rules })}</b> {t("ranked")}
          </span>
          <span className={`${live} border-[#8ce99a8c]`}>
            <i className="h-[9px] w-[9px] rounded-full bg-[#69db7c] shadow-[0_0_8px_#69db7c]" />
            <b className="text-[17px] text-[#8ce99a]">{int(meta.games)}</b> {t("gamesWeek")}
          </span>
        </div>
        <Suspense fallback={<nav aria-hidden className="h-[62px] flex-none" />}>
          <TopNav items={items} label={t("navLabel")} />
        </Suspense>
        <div className="order-2 flex flex-[1_1_120px] animate-in-r-fast items-center justify-end gap-2 sm:order-none sm:flex-[1_1_220px]">
          <span className={`${ui.note} m-0`}>
            {meta.from} → {meta.to}
          </span>
          <Suspense fallback={null}>
            <LocaleSwitcher />
          </Suspense>
        </div>
      </div>

      <div className={gutter}>
        <div className="mx-auto mt-3.5 flex max-w-[1500px] flex-col gap-2.5">
          <a href={GAME_URL} target="_blank" rel="noopener" aria-label={t("openGame")} className="relative mx-auto mt-1 mb-1.5 block w-max max-w-full animate-title-drop text-center leading-[.9] no-underline">
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
          {t("play")}
        </a>

        <footer className="mx-auto mt-3.5 flex max-w-[1500px] flex-wrap items-center justify-between gap-x-[18px] gap-y-1.5 pb-4 text-[12px] leading-[1.5] text-[#1b1f4ac7] [text-shadow:0_1px_0_#ffffff59] [&_a]:font-semibold [&_a]:text-[#1b1f4ac7] [&_a]:underline">
          <span className="min-w-0 flex-[1_1_420px]">
            {t.rich("credits", { api: (c) => <a href={API_URL} target="_blank" rel="noopener">{c}</a> })}
          </span>
          <nav aria-label={t("moreLabel")} className="flex flex-wrap justify-end gap-3.5">
            <Link href="/about">{t("about")}</Link>
            <a href={`${GAME_URL}/changelog`} target="_blank" rel="noopener">
              {t("changelog")}
            </a>
            <a href={DISCORD_URL} target="_blank" rel="noopener">
              Discord
            </a>
            <a href="https://github.com/mttetc/KantoTacticsMeta" target="_blank" rel="noopener">
              {t("source")}
            </a>
          </nav>
        </footer>
      </div>
      {modal}
      <BackToTop />
    </>
  );
}
