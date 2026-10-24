import Image from "next/image";
import type { Role } from "@/lib/types";
import { ROLE_LABEL } from "@/lib/carry";

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

/** A Pokémon in its square frame, like the game's unit cards. Pure and serialisable: usable from client components. */
export function Sprite({ dex, name, cost, size = 44, anim = true, items, itemSize = 20, role, tag, className = "", priority }: SpriteProps) {
  const cls = ["mon", cost ? `c${cost}` : "", role ? `role-${role}` : "", items?.length ? "hasItems" : "", dex ? "" : "unknown", className].join(" ");
  const style = { "--s": `${size}px`, "--is": `${itemSize}px` } as React.CSSProperties;
  return (
    <span className={cls} style={style} title={name}>
      {tag && role && role !== "holder" && <span className={`role-tag ${role}`}>{ROLE_LABEL[role]}</span>}
      {dex ? (
        <span className="img">
          <Image src={anim ? `/sd/${dex}.gif` : `/thumb/${dex}.webp`} alt={name} width={size} height={size} unoptimized priority={priority} />
        </span>
      ) : (
        name.slice(0, 3).toUpperCase()
      )}
      {items && items.length > 0 && (
        <span className="items">
          {items.map((i) => (
            <ItemIcon key={i.id} id={i.id} name={i.name} />
          ))}
        </span>
      )}
    </span>
  );
}

export function ItemIcon({ id, name, size, className = "" }: { id: string; name: string; size?: number; className?: string }) {
  const style = size ? ({ "--is": `${size}px` } as React.CSSProperties) : undefined;
  return <Image className={`it ${className}`} style={style} src={`/items/${id}.png`} alt={name} title={name} width={size ?? 20} height={size ?? 20} unoptimized />;
}

export function TypeGlyph({ type, size = 15 }: { type: string; size?: number }) {
  return <Image src={`/types/${type}-g.png`} alt="" width={size} height={size} unoptimized aria-hidden />;
}

export function TypeIcon({ type, name, size = 54 }: { type: string; name: string; size?: number }) {
  return <Image src={`/types/${type}.png`} alt={name} width={size} height={size} unoptimized style={{ borderRadius: 8 }} />;
}
