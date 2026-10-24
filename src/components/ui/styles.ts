/** Shared Tailwind class strings for the game's recurring pieces: one place to keep them identical everywhere. */
export const ui = {
  /** the dark card gradient the game uses for panels and rows */
  card: "bg-linear-to-b from-surface-hi to-surface to-60%",
  sec: "min-w-0 rounded-[14px] border-2 border-ink bg-linear-to-b from-surface-hi to-surface to-60% p-3 shadow-panel",
  secTitle: "m-0 mb-2 text-[1em] font-bold [&>small]:ml-1.5 [&>small]:font-medium [&>small]:text-dim",
  note: "mt-2 text-[.78em] leading-[1.4] text-dim/85",
  chip: "inline-flex min-h-8 items-center gap-1.5 rounded-full border border-line bg-black/20 px-3 py-[5px] text-[.84em] leading-tight font-semibold text-dim no-underline hover:bg-white/6 hover:text-txt",
  chipOn: "border-ink bg-gold text-ink hover:bg-gold-hi hover:text-ink",
  trait: "inline-flex items-center gap-1 rounded-full border border-line bg-black/25 px-[9px] py-0.5 text-[.8em] font-semibold text-txt no-underline [&>i]:not-italic [&>i]:opacity-60",
  btn: "inline-flex items-center gap-1.5 rounded-[10px] border-2 border-ink bg-linear-to-b from-surface-3 to-surface-2 to-55% px-3.5 py-[7px] font-semibold whitespace-nowrap text-txt no-underline shadow-raised active:translate-y-px disabled:cursor-default disabled:opacity-60",
  btnGold: "inline-flex items-center gap-1.5 rounded-[10px] border-2 border-[#0b0e18] bg-linear-to-b from-gold-hi via-[#fcc419] via-55% to-[#f08c00] px-3.5 py-[7px] font-semibold whitespace-nowrap text-ink no-underline shadow-[0_3px_0_#0b0e18] hover:brightness-105 active:translate-y-px disabled:cursor-default disabled:opacity-60",
  back: "inline-flex items-center gap-1 rounded-full border border-line bg-black/25 py-1 pr-2.5 pl-1.5 text-[.9em] font-bold text-dim no-underline hover:text-txt",
  strip: "flex flex-wrap gap-1",
  sort: "mb-2.5 flex flex-wrap items-center gap-1.5 text-[.84em] text-dim",
  sep: "mx-1 h-5 w-px bg-line",
  empty: "rounded-[14px] border-2 border-dashed border-line p-6 text-center text-dim",
  skeleton: "min-h-16 animate-shimmer rounded-xl bg-[linear-gradient(90deg,#ffffff0a,#ffffff1c,#ffffff0a)] bg-[size:200%_100%]",
  tierNote: "mx-0.5 mt-1.5 text-[.78em] text-dim",
  pill: "rounded-full bg-ink/60 px-2 py-0.5 text-[12px] font-bold whitespace-nowrap text-[#fff3bf] tabular-nums shadow-[inset_0_0_0_1.5px_#ffd43bbf]",
  /** the ★★ line above a unit */
  stars: "block h-[13px] text-center text-[11px] leading-[13px] tracking-[-1px] text-gold",
  /** a unit card: sprite, number, name */
  unit: "group relative flex w-[76px] flex-col items-center rounded-xl text-inherit no-underline sm:w-[94px] [&>small]:mt-0.5 [&>small]:w-full [&>small]:truncate [&>small]:text-center [&>small]:text-[.74em] [&>small]:text-dim",
  /** detail header grid: big sprite on the left, text on the right */
  detail: "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3.5 [&_p]:my-1 [&_p]:text-[.92em] [&_p]:leading-[1.45] [&_p]:text-dim [&_p>b]:text-txt",
  table: "overflow-x-auto rounded-[14px] border-2 border-ink bg-linear-to-b from-surface-hi to-surface to-60% shadow-panel [&_table]:w-full [&_table]:border-collapse [&_table]:text-[.9em] [&_table]:tabular-nums [&_th]:p-2 [&_th]:text-left [&_th]:text-[.8em] [&_th]:font-semibold [&_th]:whitespace-nowrap [&_th]:text-dim [&_td]:border-t [&_td]:border-line [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-middle",
} as const;

/** CSS variable for a type's colour (defined in the Tailwind theme). */
export const typeColor = (type: string) => `var(--color-type-${type}, var(--color-dim))`;
export const costColor = (cost: number) => `var(--color-cost-${cost})`;
export const TIER_BG: Record<string, string> = { S: "bg-tier-s", A: "bg-tier-a", B: "bg-tier-b", C: "bg-tier-c", D: "bg-tier-d" };
