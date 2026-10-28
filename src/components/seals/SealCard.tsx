import { useTranslations } from "next-intl";
import { Sprite, TypeGlyph } from "@/components/ui/Sprite";
import { ui } from "@/components/ui/styles";
import type { Seal } from "@/lib/types";

export interface SealRow extends Seal {
  heroName: string | null;
  heroDex: number | null;
  heroCost: number | null;
}

const RARITY_STYLE: Record<1 | 2 | 3, { ring: string; badge: string }> = {
  1: { ring: "shadow-[var(--shadow-panel),inset_0_0_0_2px_#adb5bd8c]", badge: "bg-[#adb5bd]" },
  2: { ring: "shadow-[var(--shadow-panel),inset_0_0_0_2px_#4dabf78c]", badge: "bg-[#4dabf7]" },
  3: { ring: "shadow-[var(--shadow-panel),inset_0_0_0_2px_#ffd43b8c,0_0_14px_#ffd43b40]", badge: "bg-gold" },
};
/** The category ids the API uses; their names live in messages (seals.cat). */
export const SEAL_CATEGORIES = ["eco", "shop", "xp", "item", "combat", "board", "role", "trait", "hero", "risk", "later", "rule"] as const;
export type SealCategory = (typeof SEAL_CATEGORIES)[number];
export const isSealCategory = (c: string): c is SealCategory => (SEAL_CATEGORIES as readonly string[]).includes(c);

/** One seal as the game shows it: code, name, rarity, effect at the given round, hero or eligible types. */
export function SealCard({ seal: x, round, delay }: { seal: SealRow; round: string; delay: number }) {
  const t = useTranslations("seals");
  const otherRounds = x.rounds.filter((r) => r !== round);
  return (
    <article className={`${ui.card} flex min-w-0 animate-card-in flex-col gap-1 rounded-xl border-2 border-ink px-3 py-2.5 ${RARITY_STYLE[x.rarity].ring}`} style={{ animationDelay: `${delay.toFixed(3)}s` } as React.CSSProperties}>
      <div className="flex min-w-0 items-center gap-2">
        <span className="rounded-md border border-line px-[5px] text-[.7em] text-dim tabular-nums">{x.code}</span>
        <b className="min-w-0 flex-1 truncate text-[1em]">{x.name}</b>
        <span className={`rounded-full px-[7px] text-[.68em] font-bold tracking-[.06em] text-[#1a1f2e] uppercase ${RARITY_STYLE[x.rarity].badge}`}>{t(`rarityName.${x.rarity}`)}</span>
      </div>
      {x.text
        .filter((t) => !t.round || t.round === round)
        .map((t, i) => (
          <div key={i}>
            <div className="text-[.92em] leading-[1.35]">{t.line}</div>
            {t.detail && <div className="text-[.8em] leading-[1.4] text-dim">{t.detail}</div>}
          </div>
        ))}
      {x.types.length > 0 && (
        <span className="flex flex-wrap items-center gap-1 pt-1" title={t("onePerType", { types: x.types.join(", ") })}>
          {x.types.map((t) => (
            <TypeGlyph key={t} type={t} size={16} />
          ))}
        </span>
      )}
      <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[.72em] text-dim">
        {x.hero && (
          <>
            <Sprite dex={x.heroDex} name={x.heroName ?? x.hero} cost={x.heroCost} size={26} anim={false} /> {x.heroName} ·{" "}
          </>
        )}
        {isSealCategory(x.cat) ? t(`cat.${x.cat}`) : x.cat}
        {otherRounds.length > 0 && ` · ${t("alsoAt", { rounds: otherRounds.join(", ") })}`}
      </span>
    </article>
  );
}
