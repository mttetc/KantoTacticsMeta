import { ImageResponse } from "next/og";

/**
 * The site icon, drawn from the game's logo: the gold "K" of KANTO with its blue outline and stacked shadow,
 * and the red "TACTICS" pill reduced to a white "T". Rendered at build time with Fredoka, like the OG images.
 */
export async function brandIcon(size: number) {
  const font = await fredoka();
  const u = size / 512; // design units on a 512 canvas
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #2a2f7a 0%, #1a2140 55%, #0f1430 100%)",
          borderRadius: 112 * u,
          fontFamily: "Fredoka",
          position: "relative",
        }}
      >
        {/* stacked "3D" K like the logo: a blue copy behind the gold one (Satori does not layer text shadows reliably) */}
        {[
          { color: "#142a5e", dy: 34 },
          { color: "#1d3a80", dy: 22 },
          { color: "#2a4fa8", dy: 11 },
          { color: "#ffd43b", dy: 0 },
        ].map((l) => (
          <div
            key={l.color}
            style={{
              position: "absolute",
              left: 84 * u,
              top: (62 + l.dy) * u,
              display: "flex",
              fontSize: 392 * u,
              fontWeight: 700,
              lineHeight: 1,
              color: l.color,
            }}
          >
            K
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            right: 48 * u,
            bottom: 52 * u,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 196 * u,
            height: 176 * u,
            borderRadius: 40 * u,
            background: "linear-gradient(#e03131, #a51111)",
            border: `${12 * u}px solid #ffffff`,
            boxShadow: `0 ${14 * u}px 0 #6b0b0b, 0 ${26 * u}px ${40 * u}px rgba(0,0,0,.45)`,
            transform: "rotate(-8deg)",
            color: "#ffffff",
            fontSize: 150 * u,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          T
        </div>
      </div>
    ),
    { width: size, height: size, fonts: font ? [{ name: "Fredoka", data: font, weight: 700, style: "normal" }] : undefined },
  );
}

/** Fredoka Bold as TTF or WOFF (an old User-Agent keeps Google Fonts off woff2, which Satori cannot read). */
async function fredoka(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:12.0) Gecko/20100101 Firefox/12.0" },
    }).then((r) => r.text());
    const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype|woff)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}
