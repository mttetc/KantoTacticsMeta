import type { Metadata } from "next";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { fmt2 } from "@/lib/format";
import { API_URL } from "@/lib/site";
import { COMP_THRESHOLDS, D_GAP, MIN_NE } from "@/lib/tiers";
import { getMeta } from "@/server/meta";

export const metadata: Metadata = {
  title: "About the data",
  description: "Where the numbers come from, how tiers are computed, and what the Kanto Tactics Meta API does and does not publish.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const m = await getMeta();
  return (
    <>
      <PanelHead subtitle="About the data" />
      <PanelBody>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
          <div className="sec">
            <h2>Source</h2>
            <p className="note" style={{ fontSize: ".92em" }}>
              Everything comes from the game&apos;s public{" "}
              <a href={API_URL} target="_blank" rel="noopener">
                Meta API
              </a>
              : Ranked games, humans only, over the last {m.versions.length > 1 ? "7 days across every rules version in the window" : "7 days"} ({m.from} to {m.to}). The API regenerates daily at 03:40 UTC; this site re-reads it once an hour at most, as the API asks, so a refresh lands within the hour.
            </p>
          </div>
          <div className="sec">
            <h2>Tiers</h2>
            <p className="note" style={{ fontSize: ".92em" }}>
              Pokémon, items and types use the game&apos;s own tiers: average place against the week&apos;s reference place ({fmt2(m.ref)}), S ≤ {fmt2(m.ref + m.thresholds.tiers.S)}, A ≤ {fmt2(m.ref + m.thresholds.tiers.A)}, B ≤ {fmt2(m.ref + m.thresholds.tiers.B)}. The API stops at C; D is this site&apos;s split, mirroring S: average place at or above {fmt2(m.ref + D_GAP)}.
            </p>
            <p className="note" style={{ fontSize: ".92em" }}>
              Comps are graded stricter, on the pessimistic average (avg + 95 % CI): S ≤ {fmt2(m.ref + COMP_THRESHOLDS.S)}, A ≤ {fmt2(m.ref + COMP_THRESHOLDS.A)}, B ≤ {fmt2(m.ref + COMP_THRESHOLDS.B)}, C ≤ {fmt2(m.ref + COMP_THRESHOLDS.C)}, D above. The &ldquo;Best&rdquo; sort uses the same number, so a comp with 11 games and a ± 0.9 interval cannot sit above a steady one. Comps under {MIN_NE} effective games only have their 4 core units in the API (no stars, shares or board) and are hidden unless you include them.
            </p>
          </div>
          <div className="sec">
            <h2>Carry, sub, tank</h2>
            <p className="note" style={{ fontSize: ".92em" }}>
              Items are split by the stat they give: offensive (Attack, Sp. Atk, attack speed, crit, Energy, drain) or defensive (HP, Defense, Sp. Def, shields). The carry is the unit that collects the most offensive item share, the sub the second one when it is geared at least 40 % as often, the tank the unit with the most defensive items. Any other unit whose most common item sits on it in 20 %+ of games shows its gear in the list rows too.
            </p>
          </div>
          <div className="sec">
            <h2>What the API does not give</h2>
            <p className="note" style={{ fontSize: ".92em" }}>
              No pick rate or result for Seals (the Seals tab is a catalogue). No board for comps under 50 boards: the site then shows where each unit usually stands in the comps that do have one. New units of rules v{m.rules} that the game data file (v{m.dataRules}) does not describe yet get their cost and type from the game changelog and the standard sprite.
            </p>
          </div>
          <p className="note">Unofficial fan page, not affiliated with Nintendo, Creatures or GAME FREAK. Game, data, sprites and icons belong to Kanto Tactics by Einoow.</p>
        </div>
      </PanelBody>
    </>
  );
}
