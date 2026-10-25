/** Raw shapes from https://einoow.com/api/meta/kanto/ (only the fields this site reads). */

export type Tier = "S" | "A" | "B" | "C" | "D";
export type ApiTier = "S" | "A" | "B" | "C";

export interface ApiStats {
  tier: ApiTier;
  avg: number;
  ic: number;
  top4: number;
  win: number;
  use: number;
  n: number;
  ne: number;
  onlyRules?: number;
}

export interface ApiUnitStat extends ApiStats {
  line: string;
}
export interface ApiItemStat extends ApiStats {
  id: string;
}
export interface ApiTraitStat extends ApiStats {
  type: string;
  level: number;
}

export interface ApiCompUnit {
  line: string;
  star: number | null;
  share: number | null;
  items: { id: string; share: number }[];
}
export interface ApiComp extends ApiStats {
  id: string;
  name: { trait: string; level: number; units: string[] };
  units: ApiCompUnit[];
  traits: { type: string; level: number; share: number | null }[];
  itemsScope?: "comp" | "global";
  placement?: { n: number; cells: { cell: number; line: string; star: number | null; share: number }[] };
  guide?: { stages: { stage: number; n: number; units: { line: string; star: number | null; share: number }[]; levels?: { level: number; share: number }[] }[] };
  variants?: { cores: string[]; share: number; avg: number; top4: number }[];
}

export interface ApiMeta {
  v: number;
  rules: number;
  generated: string;
  from: string;
  to: string;
  days: number;
  seats: number;
  ref: number;
  versions: { rules: number; n: number; from: string; to: string }[];
  thresholds: { minShow: number; minTier: number; tiers: { S: number; A: number; B: number } };
  comps: ApiComp[];
  units: ApiUnitStat[];
  items: ApiItemStat[];
  traits: ApiTraitStat[];
}

interface I18n {
  es: string;
  en: string;
}

export interface ApiLine {
  c: number;
  t: string[];
  s: number[];
  n: string[];
  range?: number;
  passive?: I18n | string;
  stars: { star: number; dex: number; name: string; move: { name: I18n; type: string; text: I18n } }[];
}
export interface ApiItem {
  en: string;
  k: "part" | "full" | "tool" | "emblem";
  stat?: string | null;
  recipe?: [string, string];
  text: I18n;
  short?: I18n;
}
export interface ApiTrait {
  en: string;
  th: number[];
  values: number[];
  desc: I18n;
}
export interface ApiSeal {
  code?: string;
  rarity: 1 | 2 | 3;
  cat?: string;
  rounds?: string[];
  hero?: string;
  /** "type": one seal per type in `types`, with {T} in the texts */
  template?: string;
  types?: string[];
  name: I18n;
  text: { round?: string; line?: I18n; detail?: I18n }[];
}
export interface ApiData {
  rules: number;
  lines: Record<string, ApiLine>;
  items: Record<string, ApiItem>;
  traits: Record<string, ApiTrait>;
  recipes: [string, string, string][];
  seals?: Record<string, ApiSeal>;
  pvp: {
    odds: Record<string, number[]>;
    pool: Record<string, number>;
    xpToNext: Record<string, number>;
    rerollCost: number;
    interest: { step: number; max: number };
    xpPerRound?: number;
    seals?: { rounds: string[]; cards: number; rerolls: number };
  };
}

/** Normalised model the pages read. Everything here is serialisable (it goes through `use cache`). */

export interface Line {
  id: string;
  cost: number | null;
  types: string[];
  range: number | null;
  /** Names by evolution stage; the last one is the line's display name. */
  names: string[];
  dex: number[];
  move: { name: string; type: string; text: string } | null;
  passive: string | null;
  /** True when the unit is newer than the game data file (rules 35 additions). */
  fromChangelog: boolean;
}

export interface Stats {
  avg: number;
  ic: number;
  top4: number;
  win: number;
  use: number;
  n: number;
  ne: number;
  onlyRules?: number;
}

export interface Unit extends Stats {
  line: string;
  tier: Tier;
}
export interface ItemStat extends Stats {
  id: string;
  tier: Tier;
}
export interface TraitStat extends Stats {
  type: string;
  level: number;
  tier: Tier;
  slug: string;
}

export type Role = "carry" | "sub" | "tank" | "holder" | null;

export interface CompUnit {
  line: string;
  star: number | null;
  share: number | null;
  items: { id: string; share: number }[];
  role: Role;
}

export interface Comp extends Stats {
  id: string;
  slug: string;
  title: string;
  /** The trait and the two lines that name the comp ("Psychic · Mewtwo & Starmie"). */
  nameTrait: string;
  nameUnits: string[];
  tier: Tier;
  apiTier: ApiTier;
  /** avg + ic: what the comp tier and the "best" sort use. */
  score: number;
  /** Fewer than MIN_NE effective games: the API only gives the 4 core units. */
  coreOnly: boolean;
  reliable: boolean;
  units: CompUnit[];
  traits: { type: string; level: number; share: number | null }[];
  keyItems: { id: string; line: string; star: number | null; share: number }[];
  /** One best setup: every final unit once, on its most frequent hex (own boards first, usual hex from other comps otherwise). */
  placement: { n: number; typical: boolean; cells: { cell: number; line: string; star: number | null; share: number | null; typical: boolean }[] } | null;
  guide: { stages: { stage: number; n: number; level: number | null; units: { line: string; star: number | null; share: number; fresh: boolean }[] }[] } | null;
  variants: { cores: string[]; share: number; avg: number; top4: number }[];
}

export interface Item {
  id: string;
  name: string;
  kind: ApiItem["k"];
  stat: string | null;
  recipe: [string, string] | null;
  text: string;
  short: string | null;
}
export interface Trait {
  id: string;
  name: string;
  thresholds: number[];
  values: number[];
  desc: string;
}
export interface Seal {
  id: string;
  code: string;
  rarity: 1 | 2 | 3;
  cat: string;
  rounds: string[];
  hero: string | null;
  /** types a "{T}" template seal exists for (empty for a normal seal) */
  types: string[];
  name: string;
  text: { round: string; line: string; detail: string | null }[];
}

export interface Meta {
  /** "api" when the live API answered, "snapshot" when the committed copy was served instead. */
  source: "api" | "snapshot";
  snapshotAt: string | null;
  generated: string;
  rules: number;
  dataRules: number;
  from: string;
  to: string;
  seats: number;
  games: number;
  ref: number;
  versions: ApiMeta["versions"];
  thresholds: ApiMeta["thresholds"];
  units: Unit[];
  items: ItemStat[];
  traits: TraitStat[];
  comps: Comp[];
  lines: Record<string, Line>;
  itemData: Record<string, Item>;
  traitData: Record<string, Trait>;
  recipes: [string, string, string][];
  seals: Seal[];
  sealRules: { rounds: string[]; cards: number; rerolls: number } | null;
  pvp: ApiData["pvp"];
}
