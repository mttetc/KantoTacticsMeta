import Link from "next/link";
import { traitSlug } from "@/lib/format";
import { TypeGlyph } from "./Sprite";
import { typeColor, ui } from "./styles";

/** A type (trait) chip in the type's colour; links to the trait page when a level is given. */
export function TypeChip({ type, name, level, share }: { type: string; name: string; level?: number; share?: number | null }) {
  const style = { borderColor: `color-mix(in srgb, ${typeColor(type)} 60%, transparent)`, color: `color-mix(in srgb, ${typeColor(type)} 85%, #fff)` };
  const body = (
    <>
      <TypeGlyph type={type} />
      {name}
      {level ? ` ${level}` : ""}
      {share != null && <i>· {Math.round(share)} %</i>}
    </>
  );
  return level ? (
    <Link className={ui.trait} style={style} href={`/types/${traitSlug(type, level)}`}>
      {body}
    </Link>
  ) : (
    <span className={ui.trait} style={style}>
      {body}
    </span>
  );
}

/** A word in its type's colour (used in comp titles). */
export function TypeName({ type, children }: { type: string; children: React.ReactNode }) {
  return <span style={{ color: typeColor(type) }}>{children}</span>;
}
