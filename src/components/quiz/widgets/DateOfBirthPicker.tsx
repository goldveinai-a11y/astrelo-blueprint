import { useState } from "react";
import type { DOB } from "@/lib/quiz/numerology";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function DateOfBirthPicker({ onChange }: { onChange: (d: DOB | undefined) => void }) {
  const [m, setM] = useState<string>("");
  const [d, setD] = useState<string>("");
  const [y, setY] = useState<string>("");

  const update = (nm: string, nd: string, ny: string) => {
    setM(nm); setD(nd); setY(ny);
    if (nm && nd && ny) onChange({ month: Number(nm), day: Number(nd), year: Number(ny) });
    else onChange(undefined);
  };

  const Sel = ({ value, onValue, placeholder, children }: { value: string; onValue: (v: string) => void; placeholder: string; children: React.ReactNode }) => (
    <select
      value={value}
      onChange={(e) => onValue(e.target.value)}
      aria-label={placeholder}
      className="h-14 w-full rounded-2xl border-2 border-border bg-card px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-violet"
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );

  const currentYear = new Date().getFullYear();

  return (
    <div className="grid grid-cols-3 gap-2">
      <Sel value={m} onValue={(v) => update(v, d, y)} placeholder="Month">
        {MONTHS.map((mm, i) => <option key={mm} value={i + 1}>{mm}</option>)}
      </Sel>
      <Sel value={d} onValue={(v) => update(m, v, y)} placeholder="Day">
        {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
      </Sel>
      <Sel value={y} onValue={(v) => update(m, d, v)} placeholder="Year">
        {Array.from({ length: 100 }, (_, i) => currentYear - 13 - i).map((yr) => (
          <option key={yr} value={yr}>{yr}</option>
        ))}
      </Sel>
    </div>
  );
}
