import type { Tier } from "@/lib/types";
import { TIER_BG } from "./styles";

const SIZE = {
  "": "h-[26px] w-[26px] rounded-lg text-[.8em]",
  row: "h-8 w-8 rounded-[9px] text-[1em]",
  big: "h-9 w-9 rounded-[10px] text-[1.1em] shadow-[inset_0_2px_0_#ffffff4d,0_2px_0_#00000073] sm:h-[46px] sm:w-[46px] sm:rounded-xl sm:text-[1.5em]",
};

export function TierBadge({ tier, variant = "", title }: { tier: Tier; variant?: keyof typeof SIZE; title?: string }) {
  return (
    <span className={`inline-grid shrink-0 place-items-center border-2 border-ink leading-none font-bold text-white ${TIER_BG[tier]} ${SIZE[variant]}`} title={title ?? `Tier ${tier}`} aria-label={`Tier ${tier}`}>
      {tier}
    </span>
  );
}
