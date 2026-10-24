import { typeVar } from "@/components/ui/TypeChip";
import type { Comp, Meta } from "@/lib/types";
import { lineName, typeName } from "@/server/meta";

/** "Psychic · Mewtwo & Starmie", with the type name in the type's colour. */
export function CompTitle({ meta, comp }: { meta: Meta; comp: Comp }) {
  return (
    <>
      <span className="ty-name" style={typeVar(comp.nameTrait)}>
        {typeName(meta, comp.nameTrait)}
      </span>
      {" · "}
      {comp.nameUnits.map((l) => lineName(meta, l)).join(" & ")}
    </>
  );
}
