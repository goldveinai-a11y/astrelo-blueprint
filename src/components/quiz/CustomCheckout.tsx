import { useEffect, useRef, useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  PaymentRequestButtonElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe as StripeType, type PaymentRequest } from "@stripe/stripe-js";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CheckoutProps {
  clientSecret: string;
  publishableKey: string;
  token: string;
  amount: number; // in cents
  name: string;
  tier: "core" | "popular" | "ultimate";
  onBack: () => void;
}

const TIER_LABELS = { core: "Core Edition", popular: "Popular Edition", ultimate: "Ultimate Edition" };

// ─── Stripe element style ──────────────────────────────────────────────────────
const ELEMENT_STYLE = {
  style: {
    base: {
      fontSize: "15px",
      color: "#0A183B",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      "::placeholder": { color: "#C4BAD8" },
    },
    invalid: { color: "#ef4444" },
  },
};

// ─── Inner form (has access to useStripe/useElements) ────────────────────────
function CheckoutForm({ clientSecret, token, amount, name, tier, onBack }: CheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [nameOnCard, setNameOnCard] = useState(name);
  const dollars = (amount / 100).toFixed(2);

  // ── Apple Pay / Google Pay ──────────────────────────────────────────────────
  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: `Astrelo ${TIER_LABELS[tier]}`, amount },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
    });
    pr.on("paymentmethod", async ({ paymentMethod, complete }) => {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });
      if (error) {
        complete("fail");
        toast.error(error.message);
      } else {
        complete("success");
        if (paymentIntent?.status === "succeeded") {
          track("purchase", { transaction_id: token, value: amount / 100, currency: "USD", tier });
          window.location.href = `/report/${token}`;
        }
      }
    });
  }, [stripe]);

  // ── Card payment ────────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!stripe || !elements || loading) return;
    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) return;
    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: { name: nameOnCard },
        },
      });
      if (error) {
        toast.error(error.message ?? "Payment failed. Please try again.");
      } else if (paymentIntent?.status === "succeeded") {
        track("purchase", { transaction_id: token, value: amount / 100, currency: "USD", tier });
        window.location.href = `/report/${token}`;
      }
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-fade-in flex flex-col">
      {/* Top bar */}
      <div className="bg-navy px-5 py-4">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to plans
        </button>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">{TIER_LABELS[tier]}</p>
            <p className="text-sm font-medium text-white/70 mt-0.5">{name}'s Numerology Blueprint</p>
          </div>
          <p className="text-2xl font-black text-gold">${dollars}</p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm font-bold text-navy">Select payment method</p>

        {/* Apple Pay / Google Pay */}
        {paymentRequest && (
          <>
            <PaymentRequestButtonElement
              options={{
                paymentRequest,
                style: {
                  paymentRequestButton: { type: "default", theme: "dark", height: "48px" },
                },
              }}
            />
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">or pay by card</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        {/* Card section header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-navy">Card details</p>
          <div className="flex gap-1.5 text-[9px] font-bold text-muted-foreground">
            {["VISA", "MC", "AMEX"].map((c) => (
              <span key={c} className="rounded border border-border px-1.5 py-0.5">{c}</span>
            ))}
          </div>
        </div>

        {/* Card number */}
        <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3.5 focus-within:border-violet">
          <div className="flex-1">
            <CardNumberElement options={ELEMENT_STYLE} />
          </div>
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-border bg-card px-4 py-3.5 focus-within:border-violet">
            <CardExpiryElement options={ELEMENT_STYLE} />
          </div>
          <div className="rounded-2xl border-2 border-border bg-card px-4 py-3.5 focus-within:border-violet">
            <CardCvcElement options={ELEMENT_STYLE} />
          </div>
        </div>

        {/* Name on card */}
        <input
          value={nameOnCard}
          onChange={(e) => setNameOnCard(e.target.value)}
          placeholder="Name on card"
          className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3.5 text-sm font-medium text-navy outline-none focus:border-violet"
        />

        {/* Total */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-bold text-navy">Total</span>
          <span className="text-lg font-black text-navy">${dollars}</span>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading || !stripe}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet py-4 text-sm font-bold text-white disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          {loading ? "Processing…" : `Pay $${dollars} Securely`}
        </button>

        {/* Security note */}
        <p className="text-center text-[10px] text-muted-foreground">
          Encrypted & secured by <strong>Stripe</strong> · 256-bit SSL
        </p>
      </div>
    </div>
  );
}

// ─── Wrapper with Elements provider ────────────────────────────────────────────
export function CustomCheckout(props: CheckoutProps) {
  const [stripePromise] = useState(() => loadStripe(props.publishableKey));

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: "stripe",
          variables: { colorPrimary: "#7C3AED", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}
