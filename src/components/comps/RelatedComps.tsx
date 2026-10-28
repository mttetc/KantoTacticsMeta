import { useTranslations } from "next-intl";
import { RankItem, RankList, RankThumbs, RankTitle } from "@/components/ui/RankList";
import { ui } from "@/components/ui/styles";
import { TierBadge } from "@/components/ui/TierBadge";
import { fmt2 } from "@/lib/format";
import type { Comp, Meta } from "@/lib/types";
import { CompThumbs } from "./CompThumbs";
import { CompTitle } from "./CompTitle";

/** "Best comps with it": a short ranked list, reliable samples only, best first. */
export function RelatedComps({ meta, title, comps }: { meta: Meta; title: string; comps: Comp[] }) {
  const t = useTranslations("common");
  if (!comps.length) return null;
  return (
    <div className={ui.sec}>
      <h2 className={ui.secTitle}>
        {title}
        <small>{t("reliableBest")}</small>
      </h2>
      <RankList>
        {comps.map((c) => (
          <RankItem key={c.id} href={`/comps/${c.slug}`} value={fmt2(c.avg)} valueTitle={t("averagePlace")}>
            <RankTitle>
              <TierBadge tier={c.tier} />
              <span className="t">
                <CompTitle meta={meta} comp={c} />
              </span>
            </RankTitle>
            <RankThumbs>
              <CompThumbs meta={meta} comp={c} />
            </RankThumbs>
          </RankItem>
        ))}
      </RankList>
    </div>
  );
}
