import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Lock, Shield, Star, X } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { DynamicTimeline } from "./widgets/DynamicTimeline";
import { lifePath, zodiacSign, type DOB } from "@/lib/quiz/numerology";
import type { GeoPoint } from "@/lib/quiz/types";
import { useServerFn } from "@tanstack/react-start";
import { createPaymentIntent } from "@/lib/checkout.functions";
import { toast } from "sonner";
import { track } from "@/lib/analytics";

const FLAT_PRICE_USD = 19;

const FAQ_ITEMS = [
  {
    q: "Is this really a one-time payment?",
    a: "Yes. You pay once — $19. No subscription, no trial, no card kept on file. Your book is yours forever.",
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
    a: "Yes. Your birth details and book are private and never sold or shared.",
  },
];

const CustomCheckout = lazy(() =>
  import("./CustomCheckout").then((module) => ({ default: module.CustomCheckout })),
);

function CheckoutLoading() {
  return (
    <div className="quiz-fade-in flex min-h-[420px] flex-col items-center justify-center gap-3 px-5 text-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      <p className="text-sm font-semibold text-navy">Loading secure checkout…</p>
      <p className="text-xs text-muted-foreground">Please keep this page open.</p>
    </div>
  );
}

export function Paywall({
  name,
  dob,
  email,
  partnerName,
  birthTime,
  birthTimeUnknown,
  birthPlace,
  quizToken,
}: {
  name: string;
  dob: DOB;
  email: string;
  partnerName?: string;
  birthTime?: string;
  birthTimeUnknown?: boolean;
  birthPlace?: GeoPoint;
  quizToken: string | null;
}) {
  const lp = lifePath(dob);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<{ publishableKey: string; token: string; amount: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const create = useServerFn(createPaymentIntent);

  useEffect(() => {
    if (clientSecret && checkoutRef.current) {
      setTimeout(() => checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [clientSecret]);

  useEffect(() => {
    track("view_result", { life_path: lp });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCheckout = async () => {
    if (!email) {
      toast.error("Email is missing — please go back and enter your email.");
      return;
    }
    if (!quizToken) {
      toast.error("Session not ready — please wait a moment and try again.");
      return;
    }
    if (loading) return;
    track("begin_checkout", {
      currency: "USD",
      value: FLAT_PRICE_USD,
      items: [
        { item_id: "core", item_name: "Numerology Blueprint", price: FLAT_PRICE_USD, quantity: 1 },
      ],
    });
    setLoading(true);
    try {
      const res = await create({
        data: {
          tier: "core",
          email,
          fullName: name,
          dob: { day: dob.day, month: dob.month, year: dob.year },
          partnerName: partnerName || null,
          birthTime: birthTime || null,
          birthTimeUnknown: birthTimeUnknown ?? false,
          birthPlace: birthPlace || null,
          quizToken,
        },
      });
      if (!res.clientSecret) throw new Error("No client secret");
      setClientSecret(res.clientSecret);
      setCheckoutData({ publishableKey: res.publishableKey, token: res.token, amount: res.amount });
    } catch (e) {
      console.error(e);
      toast.error("Could not start checkout", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (clientSecret && checkoutData) {
    return (
      <Suspense fallback={<CheckoutLoading />}>
        <CustomCheckout
          clientSecret={clientSecret}
          publishableKey={checkoutData.publishableKey}
          token={checkoutData.token}
          amount={checkoutData.amount}
          name={name}
          tier="core"
          onBack={() => { setClientSecret(null); setCheckoutData(null); }}
        />
      </Suspense>
    );
  }

  return (
    <div className="quiz-fade-in space-y-6">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet">Your Book Is Ready</p>
        <h2 className="mt-2 text-2xl font-bold text-navy">{name}, unlock your full blueprint</h2>
      </div>

      <div className="rounded-2xl border border-violet/20 bg-violet/5 px-5 py-4 text-center space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet">Personal Edition</p>
        <p className="text-sm font-semibold text-navy">
          Life Path {lp} · {zodiacSign(dob.month, dob.day)} · {name ? `${name}'s Edition` : "Personal Edition"}
        </p>
      </div>

      <DynamicTimeline name={name} />

      {/* Comparison framing */}
      <div className="space-y-3">
        <p className="px-1 text-xs font-bold uppercase tracking-widest text-violet">Compare</p>
        {[
          { label: "Subscription apps", price: "$1 trial → $48/mo", note: "Charges silently until you cancel.", bad: true },
          { label: "Private numerologist reading", price: "$150–$300+", note: "One session, one voice, no record.", bad: true },
          { label: "Your Astrelo book", price: "$19 once", note: "Written from your exact numbers. Yours forever.", bad: false },
        ].map((row) => (
          <div
            key={row.label}
            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 ${
              row.bad ? "border-border bg-muted/30" : "border-gold/60 bg-card shadow-card"
            }`}
          >
            <div>
              <p className={`text-sm font-bold ${row.bad ? "text-muted-foreground line-through" : "text-navy"}`}>
                {row.label}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{row.note}</p>
            </div>
            <p className={`shrink-0 text-sm font-bold ${row.bad ? "text-muted-foreground" : "text-navy"}`}>
              {row.price}
            </p>
          </div>
        ))}
      </div>

      {partnerName && (
        <p className="text-center text-xs text-violet font-medium">
          💞 Love Compatibility personalised for: <strong>{partnerName}</strong>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground shadow-card">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />)}
          <span className="ml-1 font-semibold text-foreground">4.8</span>
          <span>· 2,300+ reviews</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1 font-semibold text-navy">
          <Shield className="h-3.5 w-3.5" /> Secure Stripe
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1 font-semibold text-navy">
          <Shield className="h-3.5 w-3.5" /> Money-back
        </div>
      </div>

      <div className="space-y-1.5 text-center text-[11px] text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5 font-semibold text-navy">
          <Lock className="h-3 w-3" /> One-time $19 payment. No trial. No recurring charges.
        </p>
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
        {loading ? "Preparing checkout…" : "Unlock My Book — $19"}
      </button>

      <p className="pb-1 text-center text-[10px] text-muted-foreground">
        By continuing you agree to our Terms & Privacy Policy. Astrelo · numerology.astrelo.net
      </p>
      <p className="pb-6 text-center text-[9px] text-muted-foreground/70">
        For insight and entertainment purposes only — not professional, financial, or medical advice. Results vary by individual.
      </p>

      {clientSecret && checkoutData && (
        <div ref={checkoutRef} className="pt-2">
          <Suspense fallback={<CheckoutLoading />}>
            <CustomCheckout
              clientSecret={clientSecret}
              publishableKey={checkoutData.publishableKey}
              token={checkoutData.token}
              amount={checkoutData.amount}
              name={name}
              tier="core"
              onBack={() => { setClientSecret(null); setCheckoutData(null); }}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
