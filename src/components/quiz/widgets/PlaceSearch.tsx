import { useEffect, useRef, useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import type { GeoPoint } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

type Props = {
  value?: GeoPoint;
  onChange: (geo: GeoPoint) => void;
  placeholder?: string;
};

type PhotonFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    name: string;
    country?: string;
    state?: string;
    osm_id?: number;
  };
};

type PhotonResponse = { features: PhotonFeature[] };

function label(f: PhotonFeature): string {
  const p = f.properties;
  const parts = [p.name];
  if (p.state) parts.push(p.state);
  if (p.country) parts.push(p.country);
  return parts.join(", ");
}

async function geocode(q: string, signal: AbortSignal): Promise<PhotonFeature[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lang=en&limit=5`;
  try {
    const r = await fetch(url, { signal, headers: { Accept: "application/json" } });
    if (!r.ok) return [];
    const data = (await r.json()) as PhotonResponse;
    return data.features ?? [];
  } catch {
    return [];
  }
}

export function PlaceSearch({ value, onChange, placeholder = "City, country" }: Props) {
  const [q, setQ] = useState(value?.name ?? "");
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQ(value?.name ?? "");
  }, [value?.name]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    if (value && query === value.name) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await geocode(query, ctrl.signal);
      setResults(r);
      setLoading(false);
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
      setLoading(false);
    };
  }, [q, open, value]);

  function pick(f: PhotonFeature) {
    const [lng, lat] = f.geometry.coordinates;
    const name = label(f);
    onChange({ name, lat, lng });
    setQ(name);
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative font-[family-name:var(--font-serif-body)]">
      <div
        className={cn(
          "flex h-14 items-center gap-3 border-b border-[color:var(--paper-ink)]/20 px-1 transition-colors",
          open && "border-[color:var(--violet)]/50",
        )}
      >
        <Search className="h-4 w-4 text-[color:var(--violet)]/70 shrink-0" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] italic text-[color:var(--paper-ink)] placeholder:text-[color:var(--paper-muted)] placeholder:not-italic focus:outline-none"
          autoComplete="off"
          inputMode="search"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-[color:var(--violet)]/70 shrink-0" />}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-auto border border-[color:var(--paper-ink)]/15 bg-[color:var(--paper)] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)]">
          {results.map((f, i) => (
            <li key={`${f.properties.osm_id ?? i}-${i}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(f)}
                className="flex w-full items-start gap-2 px-4 py-3 text-left text-[14px] text-[color:var(--paper-ink)] border-b border-[color:var(--paper-ink)]/8 last:border-0 transition-colors hover:bg-[color:var(--paper-2)]"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--violet)]/70" />
                <span className="line-clamp-2">{label(f)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
