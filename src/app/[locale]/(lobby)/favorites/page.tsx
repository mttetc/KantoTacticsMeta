import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CompRow } from "@/components/comps/CompRow";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ui } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import { clearFavorites } from "@/server/actions";
import { readFavorites } from "@/server/favorites";
import { getMeta } from "@/server/meta";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("favorites");
  return { title: t("title"), robots: { index: false } };
}

/** Per-visitor page: the list comes from a cookie, so it renders at request time inside the static shell. */
export default async function FavoritesPage() {
  const t = await getTranslations("favorites");
  return (
    <>
      <PanelHead title={t("title")} subtitle={t("subtitle")} />
      <PanelBody>
        <Suspense fallback={<div className={`${ui.skeleton} min-h-[160px]`} />}>
          <Saved />
        </Suspense>
      </PanelBody>
    </>
  );
}

async function Saved() {
  const [meta, favs, t] = await Promise.all([getMeta(), readFavorites(), getTranslations("favorites")]);
  const comps = favs.map((id) => meta.comps.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  if (!comps.length) {
    return (
      <div className={ui.empty}>
        {t.rich("empty", { b: (c) => <b>{c}</b>, link: (c) => <Link href="/comps">{c}</Link> })}
      </div>
    );
  }
  return (
    <>
      <div className={ui.sort}>
        <span>{t("saved", { n: comps.length })}</span>
        <form action={clearFavorites} className="ml-auto">
          <button type="submit" className={ui.chip}>
            {t("clearAll")}
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
