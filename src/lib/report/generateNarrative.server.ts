import { buildReport } from "@/lib/report/buildReport";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type GeneratedNarrative = {
  "life-path": string; "expression": string; "soul-urge": string;
  "personality": string; "karmic": string; "windows": string;
  "forecast": string; "pinnacles": string; "love": string; "closing": string;
};

export async function generateNarrativeForOrder(token: string): Promise<void> {
  const { data: order, error: fetchErr } = await supabaseAdmin
    .from("orders")
    .select("token, full_name, dob_day, dob_month, dob_year, tier, partner_name, generated_narrative")
    .eq("token", token)
    .maybeSingle();

  if (fetchErr || !order) {
    console.error("[generateNarrative] Order not found:", token, fetchErr?.message);
    return;
  }

  // Idempotency guard — protects against duplicate Claude billing if Stripe retries the webhook
  if (order.generated_narrative) {
    console.log("[generateNarrative] Already generated for", token);
    return;
  }

  const fullName = order.full_name as string;
  const dob = { day: order.dob_day as number, month: order.dob_month as number, year: order.dob_year as number };
  const partnerName = order.partner_name as string | null;

  const report = buildReport({ fullName, dob });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[generateNarrative] Missing ANTHROPIC_API_KEY");
    return;
  }

  const systemPrompt = `You are writing a personalized numerology report for ${fullName}. Warm, direct, mystical-but-grounded tone, second person ("you"). Write all 10 chapters as one cohesive narrative — cross-reference how the numbers relate to each other, don't write isolated paragraphs. Each chapter 120-200 words. Output ONLY valid JSON, no markdown fences, no preamble, exactly this shape: {"life-path": string, "expression": string, "soul-urge": string, "personality": string, "karmic": string, "windows": string, "forecast": string, "pinnacles": string, "love": string, "closing": string}`;

  const dobLabel = new Date(Date.UTC(dob.year, dob.month - 1, dob.day)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const userPrompt = `Name: ${fullName}
DOB: ${dobLabel}
${partnerName ? `Partner name (for Love Compatibility chapter): ${partnerName}` : "No partner given — write Love Compatibility about general relationship patterns for this number combination."}

Core numbers — Life Path: ${report.core.lifePath}, Expression: ${report.core.expression}, Soul Urge: ${report.core.soulUrge}, Personality: ${report.core.personality}, Birth Day: ${report.core.birthDay}, Maturity: ${report.core.maturity}
Karmic Debt: ${report.karmic.debt ?? "none"}; Karmic Lessons: ${report.karmic.lessons.join(", ") || "none"}
Personal Year: ${report.cycles.personalYear}
Compatibility — Harmony: ${report.compatibility.harmony.join(", ")}; Growth: ${report.compatibility.growth.join(", ")}; Tension: ${report.compatibility.tension.join(", ")}

Write the 10 chapters as the JSON object described.`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!resp.ok) {
    console.error("[generateNarrative] Anthropic API error:", resp.status, await resp.text());
    return;
  }

  const data = await resp.json();
  const textBlock = (data.content as any[])?.find((b) => b.type === "text");
  if (!textBlock?.text) {
    console.error("[generateNarrative] No text in Claude response");
    return;
  }

  let narrative: GeneratedNarrative;
  try {
    narrative = JSON.parse(textBlock.text.replace(/```json|```/g, "").trim());
  } catch (e) {
    console.error("[generateNarrative] JSON parse failed:", (e as Error).message, textBlock.text.slice(0, 200));
    return;
  }

  const { error: updateErr } = await supabaseAdmin
    .from("orders")
    .update({ generated_narrative: narrative })
    .eq("token", token);

  if (updateErr) console.error("[generateNarrative] DB update failed:", updateErr.message);
}
