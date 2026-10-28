"use client";

import Image from "next/image";
import type { Role } from "@/lib/types";
import { ROLE_LABEL } from "@/lib/carry";
import { costColor } from "./styles";

export interface SpriteProps {
  dex: number | null;
  name: string;
  cost?: number | null;
  /** Box size in px. */
  size?: number;
  /** Animated GIF (the game's battle sprite) or the static thumbnail. */
  anim?: boolean;
  items?: { id: string; name: string }[];
  itemSize?: number;
  role?: Role;
  /** Show the CARRY / SUB / TANK tag above the box. */
  tag?: boolean;
  className?: string;
  priority?: boolean;
}

const RING: Record<Exclude<Role, null>, string> = {
  holder: "shadow-[0_0_0_2px_var(--color-gold)]",
  carry: "border-gold-hi! shadow-[0_0_0_3px_var(--color-gold),0_0_16px_#ffd43bb3]",
  sub: "border-[#e3e9f0]! shadow-[0_0_0_3px_#c9d3e0,0_0_12px_#c9d3e080]",
  tank: "border-[#96f2d7]! shadow-[0_0_0_3px_#63e6be,0_0_12px_#63e6be80]",
};
const TAG_BG: Record<Exclude<Role, null>, string> = {
  carry: "bg-linear-to-b from-gold-hi to-[#fcc419]",
  sub: "bg-linear-to-b from-[#e3e9f0] to-[#aeb9c7]",
  tank: "bg-linear-to-b from-[#96f2d7] to-[#38d9a9]",
  holder: "",
};

/**
 * A Pokémon in its square frame, like the game's unit cards: the image is clipped inside, items overhang the
 * bottom edge above the ring, the frame grows on hover of the enclosing `group`. Pure and serialisable.
 * A client component on purpose: a page shows up to ~130 of these, and the RSC payload then carries a few
 * props per sprite instead of its whole markup (3x smaller pages, faster navigation).
 */
export function Sprite({ dex, name, cost, size = 44, anim = true, items, itemSize = 20, role, tag, className = "", priority }: SpriteProps) {
  const glow = cost === 4 ? "shadow-[0_0_8px_#cc5de873]" : cost === 5 ? "shadow-[0_0_12px_#fcc41999]" : "";
  return (
    <span
      className={`relative block shrink-0 rounded-[23%] border-2 bg-black/25 transition-[transform,box-shadow] duration-150 ease-out group-hover:z-[2] group-hover:scale-[1.08] ${role ? RING[role] : glow} ${dex ? "" : "grid place-items-center border-dashed border-line text-[.75em] font-bold text-dim"} ${className}`}
      style={{ width: size, height: size, borderColor: cost && !role ? costColor(cost) : undefined }}
      title={name}
    >
      {tag && role && role !== "holder" && (
        <span className={`absolute -top-9 left-1/2 z-[4] -translate-x-1/2 -rotate-[4deg] rounded-full border-[1.5px] border-ink px-1.5 text-[9px] leading-[14px] font-bold tracking-[.06em] whitespace-nowrap text-[#1a1f2e] shadow-[0_2px_0_#0a0e1a] ${TAG_BG[role]}`}>
          {ROLE_LABEL[role]}
        </span>
      )}
      {dex ? (
        <span className="absolute inset-0 grid place-items-center overflow-hidden rounded-[inherit] p-[3px]">
          <Image className="h-full w-full object-contain select-none [image-rendering:pixelated]" src={anim ? `/sd/${dex}.gif` : `/thumb/${dex}.webp`} alt={name} width={size} height={size} unoptimized priority={priority} draggable={false} />
        </span>
      ) : (
        name.slice(0, 3).toUpperCase()
      )}
      {items && items.length > 0 && (
        <span className="absolute -bottom-2.5 left-1/2 z-[3] flex -translate-x-1/2 gap-px drop-shadow-[0_1px_0_#0a0e1a]">
          {items.map((i) => (
            <ItemIcon key={i.id} id={i.id} name={i.name} size={itemSize} />
          ))}
        </span>
      )}
    </span>
  );
}

export function ItemIcon({ id, name, size = 20, className = "" }: { id: string; name: string; size?: number; className?: string }) {
  return <Image className={`block shrink-0 rounded-[5px] border border-ink bg-surface [image-rendering:pixelated] ${className}`} style={{ width: size, height: size }} src={`/items/${id}.png`} alt={name} title={name} width={size} height={size} unoptimized />;
}

export function TypeGlyph({ type, size = 15 }: { type: string; size?: number }) {
  return <Image src={`/types/${type}-g.png`} alt="" width={size} height={size} unoptimized aria-hidden />;
}

export function TypeIcon({ type, name, size = 54 }: { type: string; name: string; size?: number }) {
  return <Image className="rounded-lg" src={`/types/${type}.png`} alt={name} width={size} height={size} unoptimized />;
}
