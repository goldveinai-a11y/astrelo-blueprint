import { useEffect, useMemo, useRef, useState } from "react";

const ITEM_H = 38;

function Wheel({
  items,
  value,
  onChange,
  width = 70,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = Math.max(0, items.indexOf(value));
    el.scrollTo({ top: idx * ITEM_H, behavior: "auto" });
  }, [items, value]);

  function handleScroll() {
    const el = ref.current;
    if (!el) return;
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const next = items[clamped];
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      if (next !== value) onChange(next);
    }, 90);
  }

  return (
    <div className="relative" style={{ width }}>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[38px] -translate-y-1/2 border-y border-[color:var(--violet)]/30" />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ height: ITEM_H * 5 }}
      >
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((it) => (
          <div
            key={it}
            className={`flex items-center justify-center font-[family-name:var(--font-serif-display)] text-[20px] snap-center transition-opacity ${
              it === value ? "text-[color:var(--navy)] font-bold opacity-100" : "text-[color:var(--paper-muted)] opacity-50"
            }`}
            style={{ height: ITEM_H }}
          >
            {it}
          </div>
        ))}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
    </div>
  );
}

export function TimeOfBirthPicker({
  value,
  unknown,
  onChange,
  onToggleUnknown,
}: {
  value?: string;
  unknown?: boolean;
  onChange: (time: string) => void;
  onToggleUnknown: () => void;
}) {
  const init = value ?? "12:00";
  const [h24, mm] = init.split(":").map((s) => parseInt(s, 10));
  const startH = Number.isFinite(h24) ? h24 : 12;
  const startM = Number.isFinite(mm) ? mm : 0;

  const [hour, setHour] = useState(String(((startH + 11) % 12) + 1));
  const [minute, setMinute] = useState(String(startM).padStart(2, "0"));
  const [ampm, setAmpm] = useState<"AM" | "PM">(startH >= 12 ? "PM" : "AM");

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1)), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")), []);

  useEffect(() => {
    let h = parseInt(hour, 10) % 12;
    if (ampm === "PM") h += 12;
    onChange(`${String(h).padStart(2, "0")}:${minute}`);
  }, [hour, minute, ampm]);

  return (
    <div>
      <div className={`flex justify-center gap-4 transition-opacity ${unknown ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        <Wheel items={hours} value={hour} onChange={setHour} />
        <Wheel items={minutes} value={minute} onChange={setMinute} />
        <Wheel items={["AM", "PM"]} value={ampm} onChange={(v) => setAmpm(v as "AM" | "PM")} />
      </div>
      <p className="mt-6 text-center font-[family-name:var(--font-serif-body)] italic text-[12.5px] text-[color:var(--paper-muted)] px-4">
        Don't know your exact time? We'll use noon as a stable reference point — your reading stays accurate.
      </p>
      <button
        type="button"
        onClick={onToggleUnknown}
        className="mt-3 block mx-auto bg-transparent border-0 text-[color:var(--violet)] underline text-[12.5px] font-[family-name:var(--font-sans)] cursor-pointer"
      >
        {unknown ? "Actually, I do know my time" : "I'm not sure"}
      </button>
    </div>
  );
}
