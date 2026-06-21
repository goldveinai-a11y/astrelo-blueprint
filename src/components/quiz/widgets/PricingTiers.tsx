import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tier = "core" | "popular" | "ultimate";

const TIERS: Array<{
  id: Tier;
  badge: string;
  price: string;
  features: string[];
  highlight?: boolean;
}> = [
  {
    id: "core",
    badge: "💰 Core",
    price: "$19",
    features: ["10-Chapter Core Report", "Wealth & Karmic Codes"],
  },
  {
    id: "popular",
    badge: "🔥 Most Popular",
    price: "$27",
    features: [
      "10-Chapter Core Report",
      "Wealth & Karmic Codes",
      "Love Compatibility (+ Partner's Name)",
    ],
    highlight: true,
  },
  {
    id: "ultimate",
    badge: "👑 Ultimate",
    price: "$33",
    features: [
      "10-Chapter Core Report",
      "Wealth & Karmic Codes",
      "Love Compatibility (+ Partner's Name)",
      "2026 Personal Year Full Month Forecast",
    ],
  },
];

export function PricingTiers({
  selected,
  onSelect,
}: {
  selected: Tier;
  onSelect: (t: Tier) => void;
}) {
  return (
    <div className="space-y-3">
      {TIERS.map((t) => {
        const active = selected === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={cn(
              "relative w-full rounded-2xl border-2 bg-card p-4 text-left transition-all",
              active ? "border-violet ring-glow" : "border-border hover:border-violet/60",
              t.highlight && !active && "border-gold/70",
            )}
          >
            {t.highlight && (
              <span className="absolute -top-2 right-4 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
                Most Popular
              </span>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-navy">{t.badge}</span>
              <span className="text-2xl font-bold text-navy">{t.price}</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
