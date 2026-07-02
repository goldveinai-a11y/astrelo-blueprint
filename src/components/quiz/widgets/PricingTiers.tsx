import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tier = "core";

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
    badge: "📖 Your Book",
    price: "$19",
    anchor: "",
    dailyRate: "Less than one astrologer session — yours forever",
    features: [
      "15 personal chapters, built from your exact data",
      "Palm Reading included",
      "One payment, nothing recurring",
    ],
    highlight: true,
  },
];

interface PricingTiersProps {
  selected: Tier;
  onSelect: (tier: Tier) => void;
}

export function PricingTiers({ selected, onSelect }: PricingTiersProps) {
  return (
    <div className="space-y-3">
      {TIERS.map((tier) => (
        <button
          key={tier.id}
          type="button"
          onClick={() => onSelect(tier.id)}
          className={cn(
            "w-full rounded-2xl border-2 p-4 text-left transition-all",
            selected === tier.id
              ? "border-gold bg-gold/10 shadow-glow"
              : "border-border bg-card hover:border-gold/50",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-bold text-navy">{tier.badge}</span>
            <div className="text-right">
              <span className="text-xl font-black text-gold">{tier.price}</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{tier.dailyRate}</p>
          <ul className="mt-2 space-y-1">
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-xs text-foreground">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                {f}
              </li>
            ))}
          </ul>
        </button>
      ))}
    </div>
  );
}
