import Link from "next/link";
import { traitSlug } from "@/lib/format";
import { TypeGlyph } from "./Sprite";
import { typeColor, ui } from "./styles";

/** A type (trait) chip in the type's colour; links to the trait page when a level is given. */
/** `count` = units of the type needed for that level (what the game shows); without it the level number is shown. */
export function TypeChip({ type, name, level, count, share }: { type: string; name: string; level?: number; count?: number; share?: number | null }) {
  const style = { borderColor: `color-mix(in srgb, ${typeColor(type)} 60%, transparent)`, color: `color-mix(in srgb, ${typeColor(type)} 85%, #fff)` };
  const body = (
    <>
      <TypeGlyph type={type} />
      {name}
      {count ? ` ${count}` : level ? ` ${level}` : ""}
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

/** A word in its type's colour (used in comp titles). `relief` gives it the panel title's 3D shadow in a darker shade of that colour. */
export function TypeName({ type, relief, children }: { type: string; relief?: boolean; children: React.ReactNode }) {
  return <span style={{ color: typeColor(type), textShadow: relief ? `0 3px 0 color-mix(in srgb, ${typeColor(type)} 45%, #000)` : undefined }}>{children}</span>;
}
