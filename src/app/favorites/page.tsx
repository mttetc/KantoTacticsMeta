import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CompRow } from "@/components/comps/CompRow";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ui } from "@/components/ui/styles";
import { clearFavorites } from "@/server/actions";
import { readFavorites } from "@/server/favorites";
import { getMeta } from "@/server/meta";

export const metadata: Metadata = { title: "Saved comps", robots: { index: false } };

/** Per-visitor page: the list comes from a cookie, so it renders at request time inside the static shell. */
export default function FavoritesPage() {
  return (
    <>
      <PanelHead subtitle="Saved comps · kept in a cookie on this browser, no account" />
      <PanelBody>
        <Suspense fallback={<div className={`${ui.skeleton} min-h-[160px]`} />}>
          <Saved />
        </Suspense>
      </PanelBody>
    </>
  );
}

async function Saved() {
  const [meta, favs] = await Promise.all([getMeta(), readFavorites()]);
  const comps = favs.map((id) => meta.comps.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  if (!comps.length) {
    return (
      <div className={ui.empty}>
        Nothing saved yet. Open a comp and press <b>☆ Save comp</b>; it will wait for you here. <Link href="/comps">Browse the comps</Link>.
      </div>
    );
  }
  return (
    <>
      <div className={ui.sort}>
        <span>{comps.length} saved</span>
        <form action={clearFavorites} className="ml-auto">
          <button type="submit" className={ui.chip}>
            Clear all
          </button>
        </form>
      </div>
      <div className="flex flex-col gap-2">
        {comps.map((c, i) => (
          <CompRow key={c.id} meta={meta} comp={c} index={i} />
        ))}
      </div>
    </>
  );
}
