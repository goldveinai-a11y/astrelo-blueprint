import { useEffect, useState } from "react";
import { Lock, Shield, Star, X } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { XRayScroller } from "./widgets/XRayScroller";
import { DynamicTimeline } from "./widgets/DynamicTimeline";
import { PricingTiers, type Tier } from "./widgets/PricingTiers";
import { lifePath, karmicDebt, zodiacSign, type DOB } from "@/lib/quiz/numerology";
import { useServerFn } from "@tanstack/react-start";
import { createCheckoutSession } from "@/lib/checkout.functions";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { TIER_PRICE_USD } from "@/lib/quiz/tiers";

const FAQ_ITEMS = [
  {
    q: "Is this really a one-time payment?",
    a: "Yes. You pay once — $19, $27, or $33 depending on tier. No subscription, no trial, no card kept on file. Your blueprint is yours forever.",
  },
  {
    q: "How accurate is numerology?",
    a: "Numerology is a reflective framework, not a scientific prediction. Most people find it gives language for patterns they already sense about themselves — take what resonates.",
  },
  {
    q: "What if it's not for me?",
    a: "We offer a money-back guarantee — see the guarantee details on this page.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your birth details and report are private and never sold or shared.",
  },
];

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
  const [partnerNameInput, setPartnerNameInput] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [loading, setLoading] = useState(false);
  const create = useServerFn(createCheckoutSession);

  useEffect(() => {
    track("view_result", { life_path: lp });
    // Fires once when the free teaser/result screen mounts — this is the pre-paywall
    // "result page" step. Do not confuse with the post-purchase report (tracked as view_report).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCheckout = async (tierOverride?: Tier) => {
    const activeTier = tierOverride ?? tier;
    if (!email) {
      toast.error("Email is missing — please go back and enter your email.");
      return;
    }
    if (loading) return;
    const value = TIER_PRICE_USD[activeTier];
    track("begin_checkout", {
      currency: "USD",
      value,
      items: [
        { item_id: activeTier, item_name: `Numerology Blueprint — ${activeTier}`, price: value, quantity: 1 },
      ],
    });
    track("checkout_opened", { tier: activeTier, value });
    setLoading(true);
    try {
      const res = await create({
        data: {
          tier: activeTier,
          email,
          fullName: name,
          dob: { day: dob.day, month: dob.month, year: dob.year },
          partnerName: partnerNameInput.trim() || partnerName || null,
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
          <span>· 2,300+ reviews</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1 font-semibold text-navy">
          <Shield className="h-3.5 w-3.5" /> Secure Checkout via Stripe
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1 font-semibold text-navy">
          <Shield className="h-3.5 w-3.5" /> Money-back guarantee
        </div>
      </div>

      <div className="rounded-2xl border border-violet/20 bg-violet/5 px-5 py-4 text-center space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet">Your Blueprint is Ready</p>
        <p className="text-sm font-semibold text-navy">
          Life Path {lp} · {zodiacSign(dob.month, dob.day)} · {name ? `${name}'s Edition` : "Personal Edition"}
        </p>
        <p className="text-[11px] text-muted-foreground">Choose your level of insight:</p>
      </div>

      <PricingTiers
        selected={tier}
        onSelect={(t) => {
          setTier(t);
          setTimeout(() => startCheckout(t), 350);
        }}
      />

      {tier !== "core" && (
        <div className="space-y-1.5">
          <label
            htmlFor="partnerName"
            className="block px-1 text-xs font-bold uppercase tracking-widest text-violet"
          >
            💞 Partner's name (for Love Compatibility)
          </label>
          <input
            id="partnerName"
            type="text"
            value={partnerNameInput}
            onChange={(e) => setPartnerNameInput(e.target.value)}
            placeholder="e.g. Alex"
            className="h-12 w-full rounded-2xl border-2 border-border bg-card px-4 text-sm font-medium outline-none transition-colors focus:border-violet"
          />
          <p className="px-1 text-[10px] text-muted-foreground">
            Optional — leave blank for a general Love Compatibility reading.
          </p>
        </div>
      )}

      <div className="rounded-2xl border-2 border-violet/20 bg-violet/5 px-5 py-5 space-y-2">
        <p className="text-lg font-bold text-navy leading-snug">Your Blueprint is ready, {name}</p>
        <p className="text-xs text-muted-foreground">10 chapters built from your exact numbers</p>
      </div>

      <div className="space-y-3">
        {[
          { emoji: "🔮", text: `Understand the patterns shaping your finances and relationships by ${new Date(Date.now()+30*86400000).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}` },
          { emoji: "📅", text: "See your exact energetic windows — dates when decisions land twice as hard" },
          { emoji: "🔓", text: "Identify the karmic blocks running quietly in the background — and when they break" },
          { emoji: "💛", text: "Yours forever — one payment, no renewal, no subscription" },
        ].map((item) => (
          <div key={item.emoji} className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <span className="text-xl shrink-0">{item.emoji}</span>
            <p className="text-sm leading-snug text-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-base font-bold text-navy">What's included?</p>
        {[
          { emoji: "📖", title: "10-Chapter Numerology Report", desc: "Life Path, Expression, Soul Urge, Personality — your complete number system, decoded from your exact date of birth." },
          { emoji: "🔮", title: "Karmic Architecture Analysis", desc: "What's actually blocking your financial and personal patterns — and the exact cycle they're tied to." },
          { emoji: "📅", title: "90-Day Energetic Windows", desc: "Specific dates when your effort moves twice as far — for wealth, decisions, and love." },
          { emoji: "❤️", title: "Love Compatibility Map", desc: "Your harmony, growth, and tension numbers — and how they play out in your relationships.", tag: "Popular & Ultimate" },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-4">
            <span className="text-2xl shrink-0">{item.emoji}</span>
            <div>
              <p className="text-sm font-bold text-navy">
                {item.title}
                {item.tag && <span className="ml-2 text-[10px] font-bold text-violet">{item.tag}</span>}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 text-center text-[11px] text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5 font-semibold text-navy">
          <Lock className="h-3 w-3" /> One-time payment — not a subscription. No trial, no recurring charges.
        </p>
        <p>A private numerologist reading typically costs $150–300+. Your personalized blueprint: from $19, yours forever.</p>
        <p className="flex items-center justify-center gap-1.5">
          <X className="h-3 w-3 shrink-0 text-destructive" />
          <span>Not like other apps: <s>$1 trial → $48/month until you notice</s></span>
        </p>
      </div>

      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4 shadow-card">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem
            key={item.q}
            value={`item-${i}`}
            className={i === FAQ_ITEMS.length - 1 ? "border-b-0" : ""}
          >
            <AccordionTrigger className="text-left text-sm font-semibold text-navy">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <button
        onClick={startCheckout}
        disabled={loading}
        className="pulse-soft sticky bottom-4 z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-5 text-sm font-bold text-white shadow-glow disabled:opacity-70"
      >
        <Lock className="h-4 w-4" />
        {loading ? "Preparing checkout…" : "Get My Numerology Blueprint →"}
      </button>

      <p className="pb-1 text-center text-[10px] text-muted-foreground">
        By continuing you agree to our Terms & Privacy Policy. Astrelo · numerology.astrelo.net
      </p>
      <p className="pb-6 text-center text-[9px] text-muted-foreground/70">
        For insight and entertainment purposes only — not professional, financial, or medical advice. Results vary by individual.
      </p>
    </div>
  );
}
