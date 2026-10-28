import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { TIERS } from "@/lib/tiers";
import type { Tier } from "@/lib/types";
import { ui } from "./styles";
import { TierBadge } from "./TierBadge";

/** The S → D rows of a tier list. `render` gives the cards of one tier; an empty tier says so. */
export function TierRows({ render }: { render: (tier: Tier) => ReactNode[] }) {
  const t = useTranslations("common");
  return (
    <div className="flex flex-col gap-2">
      {TIERS.map((tier, i) => {
        const cards = render(tier);
        return (
          <section key={tier} aria-label={t("tier", { tier: tier })} className={`${ui.card} grid animate-card-in grid-cols-[46px_minmax(0,1fr)] overflow-hidden rounded-[14px] border-2 border-ink shadow-panel sm:grid-cols-[60px_minmax(0,1fr)]`} style={{ animationDelay: `${(0.1 + i * 0.07).toFixed(2)}s` } as React.CSSProperties}>
            <div className="grid place-items-center border-r border-line bg-black/13 px-1.5 py-2.5">
              <TierBadge tier={tier} variant="big" />
            </div>
            <div className="flex min-w-0 flex-wrap content-start gap-x-1.5 gap-y-2.5 p-2.5">
              {cards.length ? cards : <span className="px-0.5 py-1 text-[.85em] text-dim">{t("nothingHere")}</span>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
