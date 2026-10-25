import "server-only";
import { assignRoles } from "@/lib/carry";
import { compFamily } from "@/lib/comp-family";
import { compSlug } from "@/lib/format";
import { bestSetup, buildTypicalCells } from "@/lib/placement";
import { compScore, compTier, MIN_NE } from "@/lib/tiers";
import type { ApiMeta, Comp, Item, Line, Trait } from "@/lib/types";

/** The Meta's comps as the pages read them: roles, key items, one best setup, the stage guide, the site's tier. */
export function buildComps(meta: ApiMeta, lines: Record<string, Line>, items: Record<string, Item>, traits: Record<string, Trait>): Comp[] {
  const typical = buildTypicalCells(meta.comps);
  const ranges = Object.fromEntries(Object.values(lines).map((l) => [l.id, l.range]));
  const name = (line: string) => lines[line]?.names.at(-1) ?? line;
  return meta.comps.map((c) => {
    const coreOnly = c.units.some((u) => u.share == null);
    const { roles } = coreOnly ? { roles: {} as Record<string, never> } : assignRoles(c.units, items);
    const keyItems = coreOnly
      ? []
      : c.units
          .flatMap((u) => u.items.map((i) => ({ id: i.id, line: u.line, star: u.star, share: i.share, w: i.share * ((u.share ?? 0) / 100) })))
          .sort((a, b) => b.w - a.w)
          .slice(0, 3)
          .map((k) => ({ id: k.id, line: k.line, star: k.star, share: k.share }));
    let prev = new Set<string>();
    const guide = c.guide
      ? {
          stages: c.guide.stages.map((s) => {
            const units = s.units.map((u) => ({ ...u, fresh: prev.size > 0 && !prev.has(u.line) }));
            prev = new Set(s.units.map((u) => u.line));
            const level = (s.levels ?? []).reduce<{ level: number; share: number } | null>((best, l) => (!best || l.share > best.share ? l : best), null)?.level ?? null;
            return { stage: s.stage, n: s.n, level, units };
          }),
        }
      : null;
    return {
      id: c.id,
      slug: compSlug(c.id),
      title: `${traits[c.name.trait]?.name ?? c.name.trait} · ${c.name.units.map(name).join(" & ")}`,
      nameTrait: c.name.trait,
      nameUnits: c.name.units,
      family: compFamily(c.name.trait, c.name.units),
      tier: compTier(c.avg, c.ic, meta.ref),
      apiTier: c.tier,
      score: compScore(c.avg, c.ic),
      coreOnly,
      reliable: c.ne >= MIN_NE && !coreOnly,
      avg: c.avg,
      ic: c.ic,
      top4: c.top4,
      win: c.win,
      use: c.use,
      n: c.n,
      ne: c.ne,
      onlyRules: c.onlyRules,
      units: c.units.map((u) => ({ ...u, role: coreOnly ? null : (roles[u.line] ?? null) })),
      traits: c.traits,
      keyItems,
      placement: coreOnly ? null : bestSetup(c.units, c.placement, typical, Object.entries(roles).find(([, r]) => r === "carry")?.[0] ?? null, ranges),
      guide,
      variants: c.variants ?? [],
    };
  });
}
