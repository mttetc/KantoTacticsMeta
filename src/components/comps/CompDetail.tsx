import { useTranslations } from "next-intl";
import { ItemIcon, Sprite } from "@/components/ui/Sprite";
import { StatsRow } from "@/components/ui/Stats";
import { ui } from "@/components/ui/styles";
import { TypeChip } from "@/components/ui/TypeChip";
import { Link } from "@/i18n/navigation";
import { fmt2, int, pct, stars } from "@/lib/format";
import { MIN_NE } from "@/lib/tiers";
import type { Comp, Meta, Role } from "@/lib/types";
import { itemName, lineDex, lineName, typeName, unitDex, unitName } from "@/server/meta";
import { Board } from "./Board";
import { CompPath } from "./CompPath";

const ROLE_ORDER = { carry: 0, sub: 1, tank: 2, holder: 3 } as const;
const rank = (r: Role) => (r ? ROLE_ORDER[r] : 4);
const ROLE_TEXT: Record<string, string> = { carry: "text-gold-hi font-bold", sub: "text-[#e3e9f0] font-bold", tank: "text-[#96f2d7] font-bold" };

/** Everything the API knows about one comp. Server component, static per Meta refresh. */
export function CompDetail({ meta, comp: c }: { meta: Meta; comp: Comp }) {
  const t = useTranslations("comp");
  const tr = useTranslations("roles.name");
  const maxUse = Math.max(...meta.comps.map((x) => x.use));
  if (c.coreOnly) {
    return (
      <>
        <div className={ui.strip}>{c.traits.map((x) => <TypeChip key={x.type} type={x.type} name={typeName(meta, x.type)} level={x.level} count={meta.traitData[x.type]?.thresholds[x.level - 1]} />)}</div>
        <StatsRow s={c} maxUse={maxUse} />
        <div className={ui.sec}>
          <h2 className={ui.secTitle}>
            {t("coreUnits")}
            <small>{t("coreUnitsSub", { n: int(c.n) })}</small>
          </h2>
          <div className="flex flex-wrap gap-x-2 gap-y-2.5 pt-3.5">
            {c.units.map((u) => (
              <Link key={u.line} className={`${ui.unit} w-[78px]! [&>small]:mt-2.5`} href={`/pokemon/${u.line}`} title={lineName(meta, u.line)}>
                <Sprite dex={lineDex(meta, u.line)} name={lineName(meta, u.line)} cost={meta.lines[u.line]?.cost} size={66} items={u.items.slice(0, 3).map((i) => ({ id: i.id, name: itemName(meta, i.id) }))} itemSize={24} />
                <small>{lineName(meta, u.line)}</small>
              </Link>
            ))}
          </div>
          <p className={ui.note}>{t("coreNote", { avg: fmt2(c.avg), ic: fmt2(c.ic) })}</p>
        </div>
      </>
    );
  }

  const ordered = [...c.units].sort((a, b) => rank(a.role) - rank(b.role) || (b.share ?? 0) - (a.share ?? 0));
  const holders = ordered.filter((u) => u.items.length > 0);
  // the 8 most played units are the level 8 board; the rest is what players add at level 9
  const board = new Set(
    [...c.units]
      .sort((a, b) => (b.share ?? 0) - (a.share ?? 0))
      .slice(0, 8)
      .map((u) => u.line),
  );
  const atEight = ordered.filter((u) => board.has(u.line));
  const atNine = ordered.filter((u) => !board.has(u.line));
  const card = (u: (typeof ordered)[number]) => {
    const lead = u.role === "carry";
    return (
      <Link key={u.line} className={`${ui.unit} ${lead ? "w-[94px]!" : "w-[78px]!"} [&>small:first-of-type]:mt-2.5`} href={`/pokemon/${u.line}`} title={t("unitTitle", { name: unitName(meta, u.line, u.star), pct: pct(u.share) })}>
        <span className={ui.stars}>{stars(u.star)}</span>
        <Sprite
          dex={unitDex(meta, u.line, u.star)}
          name={unitName(meta, u.line, u.star)}
          cost={meta.lines[u.line]?.cost}
          size={lead ? 80 : 66}
          role={u.role}
          tag
          items={u.items.slice(0, 3).map((i) => ({ id: i.id, name: itemName(meta, i.id) }))}
          itemSize={lead ? 28 : 24}
        />
        <small className={u.role ? ROLE_TEXT[u.role] : ""}>{unitName(meta, u.line, u.star)}</small>
        <small className="text-txt!">{Math.round(u.share ?? 0)} %</small>
      </Link>
    );
  };
  return (
    <>
      <div className={ui.strip}>{c.traits.map((x) => <TypeChip key={x.type} type={x.type} name={typeName(meta, x.type)} level={x.level} count={meta.traitData[x.type]?.thresholds[x.level - 1]} share={x.share} />)}</div>
      <StatsRow s={c} maxUse={maxUse} />
      {c.apiTier !== c.tier && <p className={`${ui.note} m-0`}>{t("tierNote", { api: c.apiTier, tier: c.tier, score: fmt2(c.score), ref: fmt2(meta.ref) })}</p>}
      {c.ne < MIN_NE && <p className={`${ui.note} m-0`}>{t("fewGames", { n: int(c.ne) })}</p>}
      {c.keyItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[.84em] text-dim" title={t("itemsToBuildTitle")}>
            {t("itemsToBuild")}
          </span>
          {c.keyItems.map((k, i) => {
            const recipe = meta.itemData[k.id]?.recipe;
            return (
              <Link key={`${k.id}-${k.line}`} href={`/items/${k.id}`} className="inline-flex items-center gap-1.5 rounded-full border-2 border-gold bg-ink/60 py-0.5 pr-2.5 pl-[3px] text-[.84em] font-semibold text-txt no-underline shadow-[0_0_12px_#ffd43b59] [&>i]:font-medium [&>i]:not-italic [&>i]:text-dim">
                <ItemIcon id={k.id} name={itemName(meta, k.id)} size={30} className="rounded-[9px]" />
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gold text-[.8em] font-bold text-ink">{i + 1}</span>
                {itemName(meta, k.id)}
                {recipe && (
                  <span className="inline-flex items-center gap-0.5 text-dim" title={`${itemName(meta, recipe[0])} + ${itemName(meta, recipe[1])}`}>
                    <i>=</i>
                    <ItemIcon id={recipe[0]} name={itemName(meta, recipe[0])} size={20} />
                    <i>+</i>
                    <ItemIcon id={recipe[1]} name={itemName(meta, recipe[1])} size={20} />
                  </span>
                )}
                <i>{t("on")}</i>
                <Sprite dex={unitDex(meta, k.line, k.star)} name={unitName(meta, k.line, k.star)} cost={meta.lines[k.line]?.cost} size={22} anim={false} />
                <i>{Math.round(k.share)} %</i>
              </Link>
            );
          })}
        </div>
      )}

      <div className={ui.sec}>
        <h2 className={ui.secTitle}>
          {t("finalTeam")}
          <small>{t("finalTeamSub")}</small>
        </h2>
        {/* top padding leaves room for the role tags above the stars */}
        <div className="flex flex-wrap gap-x-2 gap-y-2.5 pt-5.5">{atEight.map(card)}</div>
        {atNine.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-start gap-x-2 gap-y-2.5 border-t border-line pt-5.5">
            <span className="mt-6 mr-1 inline-flex items-center rounded-full border border-line bg-black/20 px-2.5 py-0.5 text-[.8em] font-bold text-gold-hi" title={t("level9Title")}>
              {t("level9")}
            </span>
            {atNine.map(card)}
          </div>
        )}
        {holders.length > 0 && (
          <ul className="m-0 mt-2.5 flex list-none flex-col gap-1 border-t border-line p-0 pt-2 text-[.88em]">
            {holders.map((u) => {
              const its = [...u.items].sort((a, b) => b.share - a.share);
              return (
                <li key={u.line} className="grid grid-cols-1 items-center gap-x-2.5 gap-y-1.5 border-b border-[#96acff1f] py-[3px] last:border-b-0 sm:grid-cols-[200px_minmax(0,1fr)]">
                  <b className={`inline-flex min-w-0 items-center gap-2 truncate ${u.role && u.role !== "holder" ? ROLE_TEXT[u.role] : ""}`}>
                    <Sprite dex={unitDex(meta, u.line, u.star)} name={unitName(meta, u.line, u.star)} cost={meta.lines[u.line]?.cost} size={38} anim={false} />
                    {unitName(meta, u.line, u.star)}
                    {u.role && u.role !== "holder" ? ` · ${tr(u.role)}` : ""}
                  </b>
                  <span className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-2.5 gap-y-1 text-dim">
                    {its.map((i, k) => (
                      <Link key={i.id} href={`/items/${i.id}`} className={`inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap no-underline hover:text-txt ${k === 0 ? "font-semibold text-txt [&>img]:shadow-[0_0_0_2px_var(--color-gold)]" : "text-inherit"}`}>
                        <ItemIcon id={i.id} name={itemName(meta, i.id)} size={22} />
                        {itemName(meta, i.id)}
                        <i className="ml-auto pl-1.5 text-[.85em] not-italic opacity-70">{Math.round(i.share)} %</i>
                      </Link>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <CompPath meta={meta} comp={c} />
      <Board meta={meta} comp={c} />

      {c.variants.length > 0 && (
        <div className={ui.sec}>
          <h2 className={ui.secTitle}>
            {t("variants")}
            <small>{t("variantsSub")}</small>
          </h2>
          {c.variants.slice(0, 8).map((v) => (
            <div className="flex flex-wrap items-center gap-2.5 border-b border-line py-1.5 text-[.88em] text-dim last:border-b-0 [&_b]:text-txt" key={v.cores.join()}>
              <span className={ui.strip}>
                {v.cores.map((l) => (
                  <Sprite key={l} dex={lineDex(meta, l)} name={lineName(meta, l)} cost={meta.lines[l]?.cost} size={42} anim={false} />
                ))}
              </span>
              <span>{t("ofGames", { pct: pct(v.share) })}</span>
              <span>
                {t("avg")} <b>{fmt2(v.avg)}</b>
              </span>
              <span>
                {t("top4")} <b>{pct(v.top4)}</b>
              </span>
            </div>
          ))}
        </div>
      )}
      {c.onlyRules && <p className={ui.note}>{t("onlyRules", { v: c.onlyRules })}</p>}
    </>
  );
}
