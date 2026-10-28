import { useTranslations } from "next-intl";
import { RelatedComps } from "@/components/comps/RelatedComps";
import { Sprite, TypeIcon } from "@/components/ui/Sprite";
import { StatsRow } from "@/components/ui/Stats";
import { typeColor, ui } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import type { Meta, Trait, TraitStat } from "@/lib/types";
import { lineDex, lineName } from "@/server/meta";
import { bestComps } from "@/server/queries";

export function TraitDetail({ meta, stat, trait }: { meta: Meta; stat: TraitStat; trait: Trait }) {
  const t = useTranslations("type");
  const users = meta.units.filter((u) => meta.lines[u.line]?.types.includes(stat.type)).sort((a, b) => a.avg - b.avg);
  const comps = bestComps(meta, (c) => c.traits.some((x) => x.type === stat.type && x.level >= stat.level && (x.share ?? 0) >= 50));
  const maxUse = Math.max(...meta.traits.map((x) => x.use));
  return (
    <>
      <div className={ui.detail}>
        <span className="grid h-[84px] w-[84px] place-items-center rounded-2xl border-2 border-ink bg-surface">
          <TypeIcon type={stat.type} name={trait.name} size={72} />
        </span>
        <div>
          <div className={ui.strip}>
            {trait.thresholds.map((th, i) => (
              <span key={th} className={ui.trait} style={i + 1 === stat.level ? { borderColor: typeColor(stat.type), color: typeColor(stat.type) } : undefined}>
                {t("units", { n: th })} · {trait.desc.replace("{v}", String(trait.values[i]))}
              </span>
            ))}
          </div>
          {users.length > 0 && (
            <p className="flex flex-wrap items-center gap-1">
              <b>{t("pokemonOf", { name: trait.name })}</b>{" "}
              {users.map((u) => (
                <Link key={u.line} href={`/pokemon/${u.line}`} title={lineName(meta, u.line)} className="group">
                  <Sprite dex={lineDex(meta, u.line)} name={lineName(meta, u.line)} cost={meta.lines[u.line]?.cost} size={38} anim={false} />
                </Link>
              ))}
            </p>
          )}
          <StatsRow s={stat} maxUse={maxUse} />
          {stat.onlyRules && <p className={ui.note}>{t("onlyRules", { v: stat.onlyRules })}</p>}
        </div>
      </div>
      <RelatedComps meta={meta} title={t("bestComps", { name: trait.name, level: stat.level })} comps={comps} />
    </>
  );
}
