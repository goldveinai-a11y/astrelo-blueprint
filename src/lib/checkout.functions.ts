import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TIER_PRICES = {
  core: "price_1TkSVwLWKarlNrJhDbMQ1Ezj",
} as const;

const InputSchema = z.object({
  tier: z.enum(["core"]),
  email: z.string().email(),
  fullName: z.string().min(1),
  dob: z.object({
    day: z.number().int().min(1).max(31),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(1900).max(2100),
  }),
  partnerName: z.string().optional().nullable(),
  birthTime: z.string().optional().nullable(),
  birthTimeUnknown: z.boolean().optional(),
  birthPlace: z.object({
    name: z.string(),
    lat: z.number(),
    lng: z.number(),
  }).optional().nullable(),
});

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!stripeKey || !publishableKey) throw new Error("Stripe keys missing");

    const { default: Stripe } = await import("stripe");
    const { randomBytes } = await import("crypto");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const token = randomBytes(32).toString("hex");

    const { error: insertErr } = await supabaseAdmin.from("orders").insert({
      token,
      email: data.email,
      full_name: data.fullName,
      dob_day: data.dob.day,
      dob_month: data.dob.month,
      dob_year: data.dob.year,
      tier: data.tier,
      partner_name: data.partnerName ?? null,
      status: "pending",
    });
    if (insertErr) throw new Error(`DB error: ${insertErr.message}`);

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      line_items: [{ price: TIER_PRICES[data.tier], quantity: 1 }],
      customer_email: data.email,
      metadata: { token, tier: data.tier },
      payment_intent_data: { metadata: { token, tier: data.tier } },
      return_url: `${process.env.PUBLIC_SITE_URL ?? "https://numerology.astrelo.net"}/report/${token}`,
    });

    return {
      clientSecret: session.client_secret,
      publishableKey,
    };
  });

const TIER_AMOUNTS = {
  core: 1900,
} as const;

const PaymentIntentSchema = InputSchema.extend({
  quizToken: z.string().min(1),
});

export const generateQuizToken = createServerFn({ method: "POST" })
  .handler(async () => {
    const { randomBytes } = await import("crypto");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token = randomBytes(32).toString("hex");
    const { error } = await supabaseAdmin.from("quiz_tokens" as never).insert({ token } as never);
    if (error) throw new Error(`Token error: ${error.message}`);
    return { quizToken: token };
  });

export const createPaymentIntent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PaymentIntentSchema.parse(input))
  .handler(async ({ data }) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!stripeKey || !publishableKey) throw new Error("Stripe keys missing");

    const { default: Stripe } = await import("stripe");
    const { randomBytes } = await import("crypto");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from("quiz_tokens" as never)
      .select("token, used, created_at")
      .eq("token", data.quizToken)
      .eq("used", false)
      .gt("created_at", cutoff)
      .maybeSingle();
    if (tokenErr) throw new Error(`Token check failed: ${tokenErr.message}`);
    if (!tokenRow) throw new Error("Invalid session. Please complete the quiz again.");

    const { error: markErr } = await supabaseAdmin
      .from("quiz_tokens" as never)
      .update({ used: true } as never)
      .eq("token", data.quizToken)
      .eq("used", false);
    if (markErr) throw new Error("Invalid session. Please complete the quiz again.");

    const token = randomBytes(32).toString("hex");

    const { error: insertErr } = await supabaseAdmin.from("orders").insert({
      token,
      email: data.email,
      full_name: data.fullName,
      dob_day: data.dob.day,
      dob_month: data.dob.month,
      dob_year: data.dob.year,
      tier: data.tier,
      partner_name: data.partnerName ?? null,
      birth_time: data.birthTime ?? null,
      birth_time_unknown: data.birthTimeUnknown ?? false,
      birth_place_name: data.birthPlace?.name ?? null,
      birth_lat: data.birthPlace?.lat ?? null,
      birth_lng: data.birthPlace?.lng ?? null,
      status: "pending",
    });
    if (insertErr) throw new Error(`DB error: ${insertErr.message}`);

    const stripe = new Stripe(stripeKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: TIER_AMOUNTS[data.tier],
      currency: "usd",
      receipt_email: data.email,
      metadata: { token, tier: data.tier },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      publishableKey,
      token,
      amount: TIER_AMOUNTS[data.tier],
    };
  });
