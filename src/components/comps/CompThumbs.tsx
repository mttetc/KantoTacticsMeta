import Image from "next/image";
import type { Comp, Meta } from "@/lib/types";
import { unitDex, unitName } from "@/server/meta";

/** Tiny static thumbnails of a comp's units, for lists. */
export function CompThumbs({ meta, comp, max = 9 }: { meta: Meta; comp: Comp; max?: number }) {
  return (
    <>
      {comp.units.slice(0, max).map((u) => {
        const dex = unitDex(meta, u.line, u.star);
        return dex ? <Image key={u.line} src={`/thumb/${dex}.webp`} alt="" title={unitName(meta, u.line, u.star)} width={24} height={24} unoptimized /> : null;
      })}
    </>
  );
}
