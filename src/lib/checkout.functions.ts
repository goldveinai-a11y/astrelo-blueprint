import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TIER_PRICES = {
  core: "price_1TkSVwLWKarlNrJhDbMQ1Ezj",
  popular: "price_1TkSWXLWKarlNrJhmX9lpOqZ",
  ultimate: "price_1TkSWkLWKarlNrJhiu8GZHaJ",
} as const;

const InputSchema = z.object({
  tier: z.enum(["core", "popular", "ultimate"]),
  email: z.string().email(),
  fullName: z.string().min(1),
  dob: z.object({
    day: z.number().int().min(1).max(31),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(1900).max(2100),
  }),
  partnerName: z.string().optional().nullable(),
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
