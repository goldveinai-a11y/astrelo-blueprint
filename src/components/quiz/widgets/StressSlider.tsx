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
    <div className="space-y-5">
      <div className="flex items-center justify-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white"
          style={{ background: "var(--gradient-cosmic)" }}
        >
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
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-violet [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-navy [&::-webkit-slider-thumb]:shadow-lg"
      />
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span>1 — {minLabel}</span>
        <span>10 — {maxLabel}</span>
      </div>
    </div>
  );
}
