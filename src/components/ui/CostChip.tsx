import Image from "next/image";

/** "Cost 5" with the game's Pokédollar coin: a 16-frame sprite sheet, spun by CSS. */
export function CostChip({ cost }: { cost: number }) {
  return (
    <span className="trait" style={{ "--ty": `var(--c${cost})` } as React.CSSProperties}>
      <span className="coin" aria-hidden>
        <Image src="/coin.webp" alt="" width={256} height={16} unoptimized />
      </span>
      Cost <b style={{ color: `var(--c${cost})` }}>{cost}</b>
    </span>
  );
}
