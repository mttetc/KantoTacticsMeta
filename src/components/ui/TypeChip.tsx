import Link from "next/link";
import { traitSlug } from "@/lib/format";
import { TypeGlyph } from "./Sprite";

export const typeVar = (type: string) => ({ "--ty": `var(--ty-${type}, var(--dim))` }) as React.CSSProperties;

/** A type (trait) chip in the type's colour; links to the trait page when a level is given. */
export function TypeChip({ type, name, level, share }: { type: string; name: string; level?: number; share?: number | null }) {
  const body = (
    <>
      <TypeGlyph type={type} />
      {name}
      {level ? ` ${level}` : ""}
      {share != null && <i>· {Math.round(share)} %</i>}
    </>
  );
  return level ? (
    <Link className="trait ty" style={typeVar(type)} href={`/types/${traitSlug(type, level)}`}>
      {body}
    </Link>
  ) : (
    <span className="trait ty" style={typeVar(type)}>
      {body}
    </span>
  );
}
