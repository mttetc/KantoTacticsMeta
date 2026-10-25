"use client";

export interface TabItem<K extends string> {
  key: K;
  label: string;
  sub?: string;
  count?: number;
}

/** A segmented tab strip in the lobby's style. The parent owns the selected key and renders the panel. */
export function Tabs<K extends string>({ items, value, onChange, label }: { items: TabItem<K>[]; value: K; onChange: (k: K) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="mb-3 flex gap-1 overflow-x-auto rounded-[14px] border-2 border-ink bg-ink/60 p-1 [scrollbar-width:none]">
      {items.map((it) => {
        const on = it.key === value;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={on}
            id={`tab-${it.key}`}
            aria-controls={`panel-${it.key}`}
            onClick={() => onChange(it.key)}
            className={`flex min-w-0 flex-1 flex-col items-center rounded-[10px] px-3 py-1.5 leading-tight whitespace-nowrap transition-colors ${on ? "bg-linear-to-b from-[#ffe066] via-[#fcc419] via-60% to-[#f59f00] text-[#1a1f2e] shadow-[0_2px_0_var(--color-gold-deep)]" : "text-[#c5cbe0] hover:bg-white/8 hover:text-white"}`}
          >
            <span className="text-[.95em] font-bold">
              {it.label}
              {it.count != null && <span className="ml-1 text-[.8em] font-semibold opacity-75">{it.count}</span>}
            </span>
            {it.sub && <span className={`text-[.72em] font-medium ${on ? "opacity-80" : "text-dim"}`}>{it.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}
