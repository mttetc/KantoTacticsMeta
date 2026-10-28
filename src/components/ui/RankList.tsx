import { IntentLink } from "./IntentLink";
import type { ReactNode } from "react";

const NUM_BG = [
  "bg-linear-to-b from-[#ffe066] via-[#fcc419] to-[#f59f00] text-[#1a1f2e] [text-shadow:0_1px_0_#ffffff80]", // gold
  "bg-linear-to-b from-[#f1f3f5] via-[#ced4da] to-[#868e96] text-[#1a1f2e] [text-shadow:0_1px_0_#ffffff80]", // silver
  "bg-linear-to-b from-[#f3c9a0] via-[#d9843a] to-[#a0522d] text-[#2b1d00] [text-shadow:0_1px_0_#ffffff66]", // bronze
];
const NUM_DEFAULT = "bg-linear-to-b from-[#74c0fc] via-[#1c7ed6] to-[#1257a0] text-white [text-shadow:0_2px_0_#1257a0,0_0_2px_#0a0e1a]";

/** A ranked list like the lobby's leaderboard: medal numbers, a link body, a value pill. Full width everywhere. */
export function RankList({ children }: { children: ReactNode }) {
  return <ul className="m-0 flex w-full list-none flex-col gap-1.5 p-0">{children}</ul>;
}

export function RankItem({ rank, href, value, valueTitle, children }: { rank?: number; href: string; value: string; valueTitle?: string; children: ReactNode }) {
  return (
    <li className="grid w-full items-center gap-2 rounded-[10px] border-2 border-ink bg-sunk p-1 pr-2 shadow-[inset_0_2px_0_#00000073,inset_0_0_0_1px_#96acff38] hover:bg-[#151b40]" style={{ gridTemplateColumns: rank != null ? "34px minmax(0,1fr) auto" : "minmax(0,1fr) auto" }}>
      {rank != null && (
        <span className={`grid h-[38px] w-[34px] place-items-center rounded-lg text-[20px] font-bold ${NUM_BG[rank - 1] ?? NUM_DEFAULT}`}>{rank}</span>
      )}
      <IntentLink href={href} className="flex min-w-0 flex-col gap-[3px] text-inherit no-underline">
        {children}
      </IntentLink>
      <span className="rounded-full bg-ink/60 px-2 py-0.5 text-[12px] font-bold whitespace-nowrap text-[#fff3bf] tabular-nums shadow-[inset_0_0_0_1.5px_#ffd43bbf]" title={valueTitle}>
        {value}
      </span>
    </li>
  );
}

/** Title line of a rank item: badge + ellipsised text. */
export function RankTitle({ children }: { children: ReactNode }) {
  return <b className="flex min-w-0 items-center gap-1.5 text-[14px] [&>.t]:min-w-0 [&>.t]:truncate">{children}</b>;
}

export function RankThumbs({ children }: { children: ReactNode }) {
  return <span className="flex flex-wrap gap-0.5 [&_img]:h-6 [&_img]:w-6 [&_img]:object-contain [&_img]:[image-rendering:pixelated]">{children}</span>;
}
