import { buildReport } from "@/lib/report/buildReport";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type GeneratedNarrative = {
  "life-path": string; "expression": string; "soul-urge": string;
  "personality": string; "karmic": string; "windows": string;
  "forecast": string; "pinnacles": string; "love": string; "closing": string;
};

export async function generateNarrativeForOrder(token: string): Promise<boolean> {
  const { data: order, error: fetchErr } = await supabaseAdmin
    .from("orders")
    .select("token, full_name, dob_day, dob_month, dob_year, tier, partner_name, generated_narrative")
    .eq("token", token)
    .maybeSingle();

  if (fetchErr || !order) {
    console.error("[generateNarrative] Order not found:", token, fetchErr?.message);
    return false;
  }

  // Idempotency guard — protects against duplicate Claude billing if Stripe retries the webhook
  if (order.generated_narrative) {
    console.log("[generateNarrative] Already generated for", token);
    return false;
  }

  const fullName = order.full_name as string;
  const dob = { day: order.dob_day as number, month: order.dob_month as number, year: order.dob_year as number };
  const partnerName = order.partner_name as string | null;

  const report = buildReport({ fullName, dob });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[generateNarrative] Missing ANTHROPIC_API_KEY");
    return false;
  }

  const dobLabel = new Date(Date.UTC(dob.year, dob.month - 1, dob.day)).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });

  const zodiac = (() => {
    const m = dob.month; const d = dob.day;
    if ((m===3&&d>=21)||(m===4&&d<=19)) return "Aries";
    if ((m===4&&d>=20)||(m===5&&d<=20)) return "Taurus";
    if ((m===5&&d>=21)||(m===6&&d<=20)) return "Gemini";
    if ((m===6&&d>=21)||(m===7&&d<=22)) return "Cancer";
    if ((m===7&&d>=23)||(m===8&&d<=22)) return "Leo";
    if ((m===8&&d>=23)||(m===9&&d<=22)) return "Virgo";
    if ((m===9&&d>=23)||(m===10&&d<=22)) return "Libra";
    if ((m===10&&d>=23)||(m===11&&d<=21)) return "Scorpio";
    if ((m===11&&d>=22)||(m===12&&d<=21)) return "Sagittarius";
    if ((m===12&&d>=22)||(m===1&&d<=19)) return "Capricorn";
    if ((m===1&&d>=20)||(m===2&&d<=18)) return "Aquarius";
    return "Pisces";
  })();

  const currentAge = new Date().getFullYear() - dob.year;
  const activePinnacle = report.cycles.pinnacles.find(p => currentAge >= p.startAge && currentAge <= p.endAge);
  const topWindows = [
    ...(report.windows.wealth.slice(0,1)),
    ...(report.windows.decision.slice(0,1)),
    ...(report.windows.love.slice(0,1)),
  ].map(w => w.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })).join(", ");

  const systemPrompt = `You are writing a deeply personalized numerology report for ${fullName} (${zodiac}, Life Path ${report.core.lifePath}).

TONE: The voice of a perceptive, warm friend who has studied this person specifically — not a generic horoscope, not a corporate wellness guide. Direct, literary, occasionally sharp. Second person ("you").

TECHNIQUES TO USE IN EVERY CHAPTER:
1. Rainbow Ruse — name an outer quality the person projects AND the inner tension beneath it. "You appear X, but the people closest to you rarely see Y."
2. Life Path Archetype — LP${report.core.lifePath} carries a specific pattern: ${report.core.lifePath === 1 ? "the pioneer who takes on others' work rather than watch it done poorly — and burns out from it" : report.core.lifePath === 7 ? "the analyst who thinks several layers deeper than the room — often mistaken for distant when actually just thorough" : report.core.lifePath === 8 ? "the strategist for whom ambition is an operating system, not a choice" : report.core.lifePath === 9 ? "the humanitarian whose wisdom runs ahead of their willingness to apply it to themselves" : report.core.lifePath === 2 ? "the quiet force whose influence runs deeper than they ever show" : report.core.lifePath === 3 ? "the communicator whose best work happens when they stop editing themselves before they begin" : report.core.lifePath === 4 ? "the builder whose reliability is real, but whose rigidity is the one thing that costs them most" : report.core.lifePath === 5 ? "the freedom-seeker for whom the cage is never the bars but the belief the bars are there" : report.core.lifePath === 6 ? "the nurturer whose care runs deepest for those who rarely notice how much it costs" : "the intuitive with perception that borders on uncomfortable"}.
3. Cross-referencing — actively connect numbers. E.g. "your LP${report.core.lifePath} combined with Expression ${report.core.expression} means..."
4. Specificity anchors — reference the actual numbers (${report.core.lifePath}, ${report.core.expression}, ${report.core.soulUrge}) in the text so it feels calculated, not generic.
5. Forward hooks — end each chapter with a tension or question that pulls the reader to the next.

CHAPTER LENGTH: 220-300 words each. Flowing prose paragraphs, no bullet points inside the narrative.

FORBIDDEN: "unique potential", "harness your energy", "the universe has a plan", "journey", "authentic self", "unlock your", "cosmic blueprint", "dive deep into". No clichés.

Output ONLY valid JSON, no markdown fences, no preamble, exactly this shape: {"life-path": string, "expression": string, "soul-urge": string, "personality": string, "karmic": string, "windows": string, "forecast": string, "pinnacles": string, "love": string, "closing": string}`;

  const userPrompt = `Name: ${fullName}
Born: ${dobLabel} (${zodiac})
Current age: ${currentAge}

Core numbers:
- Life Path: ${report.core.lifePath}
- Expression: ${report.core.expression}
- Soul Urge: ${report.core.soulUrge}
- Personality: ${report.core.personality}
- Birth Day: ${report.core.birthDay}
- Maturity: ${report.core.maturity} (activates ~age 35)

Karmic profile:
- Karmic Debt: ${report.karmic.debt ?? "none"}
- Karmic Lessons (missing numbers): ${report.karmic.lessons.join(", ") || "none"}

Current cycles:
- Personal Year: ${report.cycles.personalYear}
- Active Pinnacle: ${activePinnacle ? `Pinnacle ${activePinnacle.number} (ages ${activePinnacle.startAge}–${activePinnacle.endAge})` : "transitioning"}
- Nearest energetic windows: ${topWindows || "none identified"}

Love compatibility:
- Harmony numbers: ${report.compatibility.harmony.join(", ")}
- Growth (challenging but productive): ${report.compatibility.growth.join(", ")}
- Tension numbers: ${report.compatibility.tension.join(", ")}
${partnerName ? `- Partner's name: ${partnerName}` : "- No partner name given — write Love chapter about general relationship patterns for LP${report.core.lifePath}"}

For the "closing" chapter: write a 250-word synthesis — not a single quote, but a full closing that names specific numbers, pulls together the threads from all chapters, and ends with one sharp, memorable sentence the person will remember. This is the last thing they read — make it land.

Write the 10 chapters as the JSON object.`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 6500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!resp.ok) {
    console.error("[generateNarrative] Anthropic API error:", resp.status, await resp.text());
    return false;
  }

  const data = await resp.json();
  const textBlock = (data.content as any[])?.find((b) => b.type === "text");
  if (!textBlock?.text) {
    console.error("[generateNarrative] No text in Claude response");
    return false;
  }

  let narrative: GeneratedNarrative;
  try {
    narrative = JSON.parse(textBlock.text.replace(/```json|```/g, "").trim());
  } catch (e) {
    console.error("[generateNarrative] JSON parse failed:", (e as Error).message, textBlock.text.slice(0, 200));
    return false;
  }

  const { error: updateErr } = await supabaseAdmin
    .from("orders")
    .update({ generated_narrative: narrative })
    .eq("token", token);

  if (updateErr) {
    console.error("[generateNarrative] DB update failed:", updateErr.message);
    return false;
  }

  return true;
}
