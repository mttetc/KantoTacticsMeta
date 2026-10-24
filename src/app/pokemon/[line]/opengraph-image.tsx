import { ImageResponse } from "next/og";
import { fmt2, pct } from "@/lib/format";
import { getUnit, lineName, typeName } from "@/server/meta";

export const alt = "Kanto Tactics Meta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TIER_BG: Record<string, string> = { S: "#e03131", A: "#f08c00", B: "#2f9e44", C: "#1c7ed6", D: "#6b7290" };

/** Social card: name, tier, the three numbers. Text only, so it renders without the pixel sprites. */
export default async function Image({ params }: { params: Promise<{ line: string }> }) {
  const { line } = await params;
  const r = await getUnit(line);
  const name = r ? lineName(r.meta, line) : line;
  const tier = r?.unit.tier ?? "?";
  const types = r ? r.line.types.map((t) => typeName(r.meta, t)).join(" · ") : "";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "linear-gradient(135deg, #2a2f7a 0%, #6b3fa0 45%, #f0727a 100%)", color: "#f4f6fb", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 120, height: 120, borderRadius: 28, background: TIER_BG[tier] ?? "#6b7290", border: "6px solid #0b0e18", fontSize: 76, fontWeight: 800 }}>{tier}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 72, fontWeight: 800, color: "#ffd43b", textShadow: "0 4px 0 #b8860b" }}>{name}</div>
            <div style={{ fontSize: 30, opacity: 0.9 }}>{`${types}${r?.line.cost ? ` · Cost ${r.line.cost}` : ""}`}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 48, fontSize: 34 }}>
          <Stat label="avg place" value={r ? fmt2(r.unit.avg) : "–"} />
          <Stat label="top 4" value={r ? pct(r.unit.top4) : "–"} />
          <Stat label="wins" value={r ? pct(r.unit.win) : "–"} />
          <Stat label="usage" value={r ? pct(r.unit.use) : "–"} />
        </div>
        <div style={{ fontSize: 26, opacity: 0.85 }}>{`Kanto Tactics Meta · Ranked, last 7 days${r ? ` · rules v${r.meta.rules}` : ""}`}</div>
      </div>
    ),
    size,
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "16px 24px", borderRadius: 18, background: "#0a0e1a99", border: "3px solid #ffffff33" }}>
      <div style={{ fontSize: 44, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 22, opacity: 0.8 }}>{label}</div>
    </div>
  );
}
