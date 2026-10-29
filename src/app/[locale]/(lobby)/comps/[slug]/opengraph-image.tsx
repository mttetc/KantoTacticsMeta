import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { fmt2, pct } from "@/lib/format";
import { getComp, lineName, unitName } from "@/server/meta";

export const alt = "Kanto Tactics Meta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TIER_BG: Record<string, string> = { S: "#e03131", A: "#f08c00", B: "#2f9e44", C: "#1c7ed6", D: "#6b7290" };

/** Social card. An image route cannot read root params, so the locale comes from `params`. */
export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const [r, t] = await Promise.all([getComp(slug, locale), getTranslations({ locale, namespace: "og" })]);
  const title = r?.comp.title ?? slug;
  const tier = r?.comp.tier ?? "?";
  const carry = r?.comp.units.find((u) => u.role === "carry");
  const team = r ? r.comp.units.map((u) => unitName(r.meta, u.line, u.star)).join(" · ") : "";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "linear-gradient(135deg, #2a2f7a 0%, #6b3fa0 45%, #f0727a 100%)", color: "#f4f6fb", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 120, height: 120, borderRadius: 28, background: TIER_BG[tier] ?? "#6b7290", border: "6px solid #0b0e18", fontSize: 76, fontWeight: 800, flexShrink: 0 }}>{tier}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 60, fontWeight: 800, color: "#ffd43b", textShadow: "0 4px 0 #b8860b", lineHeight: 1.1 }}>{title}</div>
            <div style={{ fontSize: 28, opacity: 0.9, marginTop: 8 }}>{carry && r ? t("carry", { name: lineName(r.meta, carry.line) }) : t("comp")}</div>
          </div>
        </div>
        <div style={{ fontSize: 28, opacity: 0.9, lineHeight: 1.3 }}>{team}</div>
        <div style={{ display: "flex", gap: 40, fontSize: 34 }}>
          {[
            [t("avgPlace"), r ? `${fmt2(r.comp.avg)} ± ${fmt2(r.comp.ic)}` : "–"],
            [t("top4"), r ? pct(r.comp.top4) : "–"],
            [t("wins"), r ? pct(r.comp.win) : "–"],
            [t("games"), r ? String(r.comp.n) : "–"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", padding: "14px 22px", borderRadius: 18, background: "#0a0e1a99", border: "3px solid #ffffff33" }}>
              <div style={{ fontSize: 40, fontWeight: 800 }}>{value}</div>
              <div style={{ fontSize: 22, opacity: 0.8 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
