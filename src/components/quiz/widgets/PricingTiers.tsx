import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tier = "core" | "popular" | "ultimate";

const TIERS: Array<{
  id: Tier;
  badge: string;
  price: string;
  anchor: string;
  dailyRate: string;
  features: string[];
  highlight?: boolean;
}> = [
  {
    id: "core",
    badge: "💰 Core",
    price: "$19",
    anchor: "$89",
    dailyRate: "Less than one coffee — yours forever",
    features: [
      "Your complete number system, fully decoded",
      "Why money patterns keep repeating — and where they break",
    ],
  },
  {
    id: "popular",
    badge: "🔥 Most Popular",
    price: "$27",
    anchor: "$89",
    dailyRate: "Less than one coffee — yours forever",
    features: [
      "Your complete number system, fully decoded",
      "Why money patterns keep repeating — and where they break",
      "Your exact compatibility map, built for your relationship",
    ],
    highlight: true,
  },
  {
    id: "ultimate",
    badge: "👑 Ultimate",
    price: "$33",
    anchor: "$89",
    dailyRate: "Less than one coffee — yours forever",
    features: [
      "Your complete number system, fully decoded",
      "Why money patterns keep repeating — and where they break",
      "Your exact compatibility map, built for your relationship",
      "Month-by-month guidance for the next 12 months",
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
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm text-muted-foreground line-through">{t.anchor}</span>
                <span className="text-2xl font-bold text-navy">{t.price}</span>
              </div>
            </div>
            {active && (
              <p className="mt-0.5 text-right text-[10px] text-violet/80">{t.dailyRate}</p>
            )}
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
