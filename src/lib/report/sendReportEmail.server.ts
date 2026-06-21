import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function sendReportEmail(token: string): Promise<void> {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("email, full_name")
    .eq("token", token)
    .maybeSingle();

  if (error || !order) {
    console.error("[sendReportEmail] Order not found:", token, error?.message);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[sendReportEmail] Missing RESEND_API_KEY");
    return;
  }

  const reportUrl = `${process.env.PUBLIC_SITE_URL ?? "https://numerology.astrelo.net"}/report/${token}`;
  const firstName = (order.full_name as string).split(" ")[0];

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "Astrelo <numerology@astrelo.net>",
      to: order.email,
      subject: "Your Numerology Blueprint is ready",
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0A183B;">
          <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #B8860B; margin-bottom: 8px;">Astrelo</p>
          <h1 style="font-size: 22px; margin: 0 0 16px;">Your blueprint is ready, ${firstName}</h1>
          <p style="font-size: 15px; line-height: 1.6;">We've decoded your numbers. Your personalized Numerology Blueprint is ready to read.</p>
          <a href="${reportUrl}" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: #0A183B; color: #F3BA25; text-decoration: none; border-radius: 999px; font-weight: 600;">View My Blueprint</a>
          <p style="margin-top: 28px; font-size: 12px; color: #888;">If the button doesn't work, copy this link: ${reportUrl}</p>
        </div>
      `,
    }),
  });

  if (!resp.ok) {
    console.error("[sendReportEmail] Resend API error:", resp.status, await resp.text());
  }
}
