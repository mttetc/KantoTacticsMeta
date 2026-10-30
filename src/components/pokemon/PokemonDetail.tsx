import { useTranslations } from "next-intl";
import { RelatedComps } from "@/components/comps/RelatedComps";
import { ItemIcon, Sprite } from "@/components/ui/Sprite";
import { StatsRow } from "@/components/ui/Stats";
import { ui } from "@/components/ui/styles";
import { TypeChip } from "@/components/ui/TypeChip";
import { Link } from "@/i18n/navigation";
import { stars } from "@/lib/format";
import type { Line, Meta, Unit } from "@/lib/types";
import { itemName, lineDex, lineName, typeName } from "@/server/meta";
import { bestComps, itemsOnLine } from "@/server/queries";

/** Shared by the Pokémon page and its intercepted modal. */
export function PokemonDetail({ meta, unit, line }: { meta: Meta; unit: Unit; line: Line }) {
  const t = useTranslations("pokemon");
  const held = itemsOnLine(meta, unit.line);
  const comps = bestComps(meta, (c) => c.units.some((u) => u.line === unit.line && (u.share ?? 0) >= 50));
  const maxUse = Math.max(...meta.units.map((u) => u.use));
  const sComps = meta.comps.filter((c) => c.reliable && c.tier === "S");
  const inS = sComps.filter((c) => c.units.some((u) => u.line === unit.line && (u.share ?? 0) >= 50)).length;
  return (
    <>
      <div className={ui.detail}>
        <Sprite dex={lineDex(meta, unit.line)} name={lineName(meta, unit.line)} cost={line.cost} size={84} priority />
        <div>
          <div className={`${ui.strip} items-center`}>
            {line.cost && <span className={ui.trait}>{t("cost", { n: line.cost })}</span>}
            {line.types.map((t) => (
              <TypeChip key={t} type={t} name={typeName(meta, t)} />
            ))}
            {line.range && <span className={ui.trait}>{t("range", { n: line.range })}</span>}
          </div>
          {line.names.length > 1 && (
            <div className={`${ui.strip} my-1.5`}>
              {line.names.map((n, i) => (
                <span key={n} className="group flex flex-col items-center" title={n}>
                  <span className={ui.stars}>{stars(i + 1)}</span>
                  <Sprite dex={line.dex[i] ?? null} name={n} cost={line.cost} size={42} anim={false} />
                </span>
              ))}
            </div>
          )}
          {line.move && (
            <p>
              <b>{line.move.name}</b> ({typeName(meta, line.move.type)} · <span title={t(`moveHelp.${line.move.category}`)}>{t(`move.${line.move.category}`)}</span>) · {line.move.text}
            </p>
          )}
          {line.passive && (
            <p>
              <b>{line.fromChangelog ? t("rulesV", { v: meta.rules }) : t("passive")}</b> · {line.passive}
            </p>
          )}
          {line.variant && <p className={ui.note}>{t(`variant.${line.variant.kind}`, { name: lineName(meta, unit.line), line: lineName(meta, line.variant.base) })}</p>}
          {line.fromChangelog && <p className={ui.note}>{t("newNote", { rules: meta.rules, data: meta.dataRules })}</p>}
          <StatsRow s={unit} maxUse={maxUse} />
          <p className={ui.note}>
            {t.rich("tierNote", { tier: unit.tier, name: lineName(meta, unit.line), inS, total: sComps.length, b: (c) => <b className="text-txt">{c}</b> })}
            {inS > 0 && unit.tier !== "S" ? t("tierNoteWeak") : ""}.
          </p>
          {unit.onlyRules && <p className={ui.note}>{t("onlyRules", { v: unit.onlyRules })}</p>}
        </div>
      </div>
      {held.length > 0 && (
        <div className={ui.sec}>
          <h2 className={ui.secTitle}>
            {t("itemsOn")}
            <small>{t("itemsOnSub")}</small>
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {held.map((h) => (
              <Link key={h.id} href={`/items/${h.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-black/25 py-[3px] pr-2.5 pl-1 text-[.88em] font-semibold text-txt no-underline hover:border-gold">
                <ItemIcon id={h.id} name={itemName(meta, h.id)} size={24} className="rounded-[7px]" />
                {itemName(meta, h.id)}
                <i className="font-medium text-dim not-italic">{Math.round(h.share)} %</i>
              </Link>
            ))}
          </div>
        </div>
      )}
      <RelatedComps meta={meta} title={t("bestComps")} comps={comps} />
    </>
  );
}
