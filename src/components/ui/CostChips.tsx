import { COSTS, type Cost } from "@/lib/constants";
import { costColor, ui } from "./styles";

/** The 1–5 cost filter chips; `value` 0 = any cost. A click on the active chip clears it. */
export function CostChips({ value, onChange }: { value: number; onChange: (cost: Cost | 0) => void }) {
  return (
    <>
      <span className="mr-0.5">Cost</span>
      {COSTS.map((c) => (
        <button key={c} type="button" className={`${ui.chip} ${value === c ? ui.chipOn : ""}`} onClick={() => onChange(value === c ? 0 : c)} aria-pressed={value === c}>
          <i className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_1px_#0008]" style={{ background: costColor(c) }} />
          {c}
        </button>
      ))}
    </>
  );
}
