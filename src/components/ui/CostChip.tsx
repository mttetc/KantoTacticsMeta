import Image from "next/image";
import { useTranslations } from "next-intl";
import { costColor, ui } from "./styles";

/** "Cost 5" with the game's Pokédollar coin: a 16-frame sprite sheet, spun by CSS. */
export function CostChip({ cost }: { cost: number }) {
  const t = useTranslations("common");
  return (
    <span className={ui.trait}>
      <span className="relative inline-block h-4 w-4 overflow-hidden align-[-3px]" aria-hidden>
        <Image className="absolute top-0 left-0 h-4 w-64 max-w-none animate-coin [image-rendering:pixelated]" src="/coin.webp" alt="" width={256} height={16} unoptimized />
      </span>
      {t("cost")} <b style={{ color: costColor(cost) }}>{cost}</b>
    </span>
  );
}
