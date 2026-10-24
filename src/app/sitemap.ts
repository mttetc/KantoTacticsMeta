import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getMeta } from "@/server/meta";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const m = await getMeta();
  const at = new Date(m.generated);
  const url = (p: string) => new URL(p, SITE_URL).toString();
  return [
    { url: url("/"), lastModified: at, changeFrequency: "daily", priority: 1 },
    { url: url("/comps"), lastModified: at, changeFrequency: "daily", priority: 0.9 },
    { url: url("/game-plan"), lastModified: at, changeFrequency: "daily", priority: 0.8 },
    { url: url("/items"), lastModified: at, changeFrequency: "daily", priority: 0.7 },
    { url: url("/types"), lastModified: at, changeFrequency: "daily", priority: 0.7 },
    { url: url("/seals"), lastModified: at, changeFrequency: "weekly", priority: 0.5 },
    { url: url("/about"), lastModified: at, changeFrequency: "monthly", priority: 0.3 },
    ...m.units.map((u) => ({ url: url(`/pokemon/${u.line}`), lastModified: at, changeFrequency: "daily" as const, priority: 0.8 })),
    ...m.items.map((i) => ({ url: url(`/items/${i.id}`), lastModified: at, changeFrequency: "daily" as const, priority: 0.6 })),
    ...m.traits.map((t) => ({ url: url(`/types/${t.slug}`), lastModified: at, changeFrequency: "daily" as const, priority: 0.6 })),
    ...m.comps.filter((c) => c.reliable).map((c) => ({ url: url(`/comps/${c.slug}`), lastModified: at, changeFrequency: "daily" as const, priority: 0.7 })),
  ];
}
