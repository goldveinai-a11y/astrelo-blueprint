import { useState } from "react";
import { Lock, Shield, Star } from "lucide-react";
import { XRayScroller } from "./widgets/XRayScroller";
import { DynamicTimeline } from "./widgets/DynamicTimeline";
import { PricingTiers, type Tier } from "./widgets/PricingTiers";
import { lifePath, karmicDebt, type DOB } from "@/lib/quiz/numerology";
import { useServerFn } from "@tanstack/react-start";
import { createCheckoutSession } from "@/lib/checkout.functions";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { toast } from "sonner";

let stripePromiseCache: Promise<Stripe | null> | null = null;
const getStripe = (pk: string) => {
  if (!stripePromiseCache) stripePromiseCache = loadStripe(pk);
  return stripePromiseCache;
};

export function Paywall({
  name,
  dob,
  email,
  partnerName,
}: {
  name: string;
  dob: DOB;
  email: string;
  partnerName?: string;
}) {
  const lp = lifePath(dob);
  const kd = karmicDebt(dob);
  const [tier, setTier] = useState<Tier>("popular");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [loading, setLoading] = useState(false);
  const create = useServerFn(createCheckoutSession);

  const startCheckout = async () => {
    if (!email) {
      toast.error("Email is missing — please go back and enter your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await create({
        data: {
          tier,
          email,
          fullName: name,
          dob: { day: dob.day, month: dob.month, year: dob.year },
          partnerName: partnerName ?? null,
        },
      });
      if (!res.clientSecret) throw new Error("No client secret");
      setStripePromise(getStripe(res.publishableKey));
      setClientSecret(res.clientSecret);
    } catch (e) {
      console.error(e);
      toast.error("Could not start checkout", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (clientSecret && stripePromise) {
    return (
      <div className="quiz-fade-in space-y-4">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet">Secure Checkout</p>
          <h2 className="mt-2 text-2xl font-bold text-navy">Finalize your blueprint, {name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">Encrypted payment via Stripe · Apple Pay · Google Pay · Card</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-card">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
        <button
          onClick={() => setClientSecret(null)}
          className="w-full rounded-xl py-2 text-xs font-semibold text-muted-foreground hover:text-navy"
        >
          ← Choose a different tier
        </button>
      </div>
    );
  }

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
          🔬 X-Ray Scan: Preview your personal blueprint
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
        onClick={startCheckout}
        disabled={loading}
        className="pulse-soft sticky bottom-4 z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-5 text-sm font-bold text-white shadow-glow disabled:opacity-70"
      >
        <Lock className="h-4 w-4" />
        {loading ? "Preparing checkout…" : "Unlock My Blueprint & Secure My Dates 🧭"}
      </button>

      <p className="pb-6 text-center text-[10px] text-muted-foreground">
        By continuing you agree to our Terms & Privacy Policy. Astrelo · numerology.astrelo.net
      </p>
    </div>
  );
}
