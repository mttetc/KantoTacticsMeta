import type { Tier } from "@/lib/types";

export function TierBadge({ tier, variant = "", title }: { tier: Tier; variant?: "" | "big" | "row"; title?: string }) {
  return (
    <span className={`tier t${tier} ${variant}`} title={title ?? `Tier ${tier}`} aria-label={`Tier ${tier}`}>
      {tier}
    </span>
  );
}
