import { useState } from "react";
import { Lock, Shield, Star } from "lucide-react";
import { XRayScroller } from "./widgets/XRayScroller";
import { DynamicTimeline } from "./widgets/DynamicTimeline";
import { PricingTiers, type Tier } from "./widgets/PricingTiers";
import { lifePath, karmicDebt, type DOB } from "@/lib/quiz/numerology";
import { toast } from "sonner";

export function Paywall({ name, dob }: { name: string; dob: DOB }) {
  const lp = lifePath(dob);
  const kd = karmicDebt(dob);
  const [tier, setTier] = useState<Tier>("popular");

  return (
    <div className="quiz-fade-in space-y-6">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet">Your Free Insight</p>
        <h2 className="mt-2 text-2xl font-bold text-navy">{name}, your matrix is decoded</h2>
      </div>

      <div className="rounded-2xl border-2 border-gold/60 bg-gradient-to-br from-card to-accent p-5 shadow-card">
        <p className="text-sm leading-relaxed text-foreground">
          Your <span className="font-bold text-navy">Life Path Number is {lp}</span>.
          People with Number {lp} are natural builders, but they often carry the
          {" "}<span className="font-bold text-navy">Karmic Debt of {kd ?? "19/1"}</span>.
          This is exactly why your career feels like an "uphill battle". Your
          numbers show a massive financial unlock waiting for you, but it is
          currently blocked by your current cycle.
        </p>
      </div>

      <div>
        <p className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-violet">
          🔬 X-Ray Scan: Preview your 31-page blueprint
        </p>
        <XRayScroller name={name} />
      </div>

      <DynamicTimeline name={name} />

      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground shadow-card">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />)}
          <span className="ml-1 font-semibold text-foreground">4.8</span>
          <span>· Trustpilot</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />)}
          <span>· Sitejabber</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1 font-semibold text-navy">
          <Shield className="h-3.5 w-3.5" /> Secure Checkout via Stripe
        </div>
      </div>

      <PricingTiers selected={tier} onSelect={setTier} />

      <button
        onClick={() => toast.success("Stripe checkout would open here", { description: `Selected tier: ${tier}` })}
        className="pulse-soft sticky bottom-4 z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-5 text-sm font-bold text-white shadow-glow"
      >
        <Lock className="h-4 w-4" /> Unlock My Blueprint & Secure My Dates 🧭
      </button>

      <p className="pb-6 text-center text-[10px] text-muted-foreground">
        By continuing you agree to our Terms & Privacy Policy. Astrelo · numerology.astrelo.net
      </p>
    </div>
  );
}
