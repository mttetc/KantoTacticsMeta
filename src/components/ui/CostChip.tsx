import Image from "next/image";

/** "Cost 5" with the game's Pokédollar coin. */
export function CostChip({ cost }: { cost: number }) {
  return (
    <span className="trait" style={{ "--ty": `var(--c${cost})` } as React.CSSProperties}>
      <Image className="coin" src="/coin.webp" alt="" width={16} height={16} unoptimized aria-hidden />
      Cost <b style={{ color: `var(--c${cost})` }}>{cost}</b>
    </span>
  );
}
