import { useState } from "react";

export function StressSlider({
  minLabel,
  maxLabel,
  initial = 5,
  onChange,
}: {
  minLabel: string;
  maxLabel: string;
  initial?: number;
  onChange: (v: number) => void;
}) {
  const [v, setV] = useState(initial);
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-center">
        <div className="font-[family-name:var(--font-serif-display)] text-[54px] font-extrabold text-[color:var(--navy)]">
          {v}
        </div>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={v}
        onChange={(e) => {
          const n = Number(e.target.value);
          setV(n);
          onChange(n);
        }}
        className="h-[2px] w-full cursor-pointer appearance-none bg-[color:var(--paper-ink)]/20 [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[color:var(--navy)] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-[color:var(--gold)]"
      />
      <div className="flex justify-between font-[family-name:var(--font-sans)] text-[10.5px] font-semibold uppercase tracking-wide text-[color:var(--paper-muted)]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
