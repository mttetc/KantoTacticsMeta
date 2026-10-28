import { TypeName } from "@/components/ui/TypeChip";
import type { Comp, Meta } from "@/lib/types";
import { lineName, typeName } from "@/server/meta";

/** "Psychic · Mewtwo & Starmie", with the type name in the type's colour (`heading`: in the panel title, with its relief). */
export function CompTitle({ meta, comp, heading }: { meta: Meta; comp: Comp; heading?: boolean }) {
  return (
    <>
      <TypeName type={comp.nameTrait} relief={heading}>
        {typeName(meta, comp.nameTrait)}
      </TypeName>
      {" · "}
      {comp.nameUnits.map((l) => lineName(meta, l)).join(" & ")}
    </>
  );
}
