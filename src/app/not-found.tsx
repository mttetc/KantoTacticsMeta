import Link from "next/link";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ui } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <>
      <PanelHead subtitle="Nothing here" />
      <PanelBody>
        <div className={ui.empty}>
          That page does not exist, or this Pokémon, item or comp is not in this week&apos;s Meta. <Link href="/">Back to the tier list</Link>.
        </div>
      </PanelBody>
    </>
  );
}
