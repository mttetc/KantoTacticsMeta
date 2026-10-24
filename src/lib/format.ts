const num2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const num0 = new Intl.NumberFormat("en-US");

export const fmt2 = (n: number | null | undefined) => (n == null ? "–" : num2.format(n));
export const pct = (n: number | null | undefined) => (n == null ? "–" : `${num1.format(n)} %`);
export const int = (n: number | null | undefined) => (n == null ? "–" : num0.format(n));
export const stars = (n: number | null | undefined) => "★".repeat(Math.max(1, Math.min(3, n ?? 1)));

/** Comp ids are "a,b,c,d"; the URL slug joins the same lines with "_". */
export const compSlug = (id: string) => id.split(",").join("_");
export const compIdFromSlug = (slug: string) => slug.split("_").join(",");
export const traitSlug = (type: string, level: number) => `${type}-${level}`;
export const parseTraitSlug = (slug: string): { type: string; level: number } | null => {
  const m = /^([a-z]+)-(\d)$/.exec(slug);
  return m ? { type: m[1], level: Number(m[2]) } : null;
};
