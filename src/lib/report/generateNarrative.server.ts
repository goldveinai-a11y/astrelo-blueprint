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
2. Life Path Archetype — LP${report.core.lifePath} carries a specific pattern: ${
    report.core.lifePath === 1 ? "natural authority and a first-mover instinct — a secret fear of failure makes them ultra-driven in every endeavor; they move before others finish deciding and are already running toward the next finish line before they cross the current one; cooperating feels like losing freedom, isolation follows them everywhere but also fuels their progress, and a thriving love life is rarely their priority" :
    report.core.lifePath === 2 ? "a heart-centered peacemaker whose entire existence is built around creating harmony — they thrive in partnership and will sacrifice anything for unity, but suffer from a chronic inability to put their own needs first; their subconscious reads people and rooms before the words are spoken, which gives them an uncanny intuition that feels almost psychic, but staying silent to avoid rocking the boat is the recurring cost they pay for peace" :
    report.core.lifePath === 3 ? "a charming communicator who sees opportunity in everything and draws people effortlessly — they live in the moment where everything looks like a chance for expression and enjoyment, but forming real deep bonds is where they consistently fall short; vulnerability feels like giving up the very freedom that defines them, and there's an untapped spiritual depth they have never fully entered" :
    report.core.lifePath === 4 ? "a dedicated builder for whom constant steady effort is the only path that makes sense — they are a natural teacher who speaks with such clarity and authority that others accept what they say, but they make firm decisions about what is right and close the door on anything new; stuck with outdated methods while chasing a ceiling they almost reach, their loyalty in relationships is absolute but their stability can easily become stagnation" :
    report.core.lifePath === 5 ? "a freedom-seeker who learns by living and cannot tolerate routine — they adapt to anything, want every experience this world offers, and are genuinely exciting to be around, but they lose interest and disappear before any connection deepens; they don't always know where they're going but they're guaranteed an epic journey, and the moment a situation outwears its interest they are already mentally gone" :
    report.core.lifePath === 6 ? "a natural nurturer who leads with their heart and gives off warmth others actively seek out — they are the humanitarian in every room, giving endlessly and seeing the infinite shades of grey others reduce to black and white, but they give so completely that they forget they are also individuals; sacrificing themselves for love feels noble but costs them their own wholeness, and they must learn to direct onto themselves the same attention they lavish on everyone else" :
    report.core.lifePath === 7 ? "an eternal student of the universe who combines exacting analytical powers with deep spiritual intuition — they go it alone by preference, not by accident, and their social circle is deliberately small; they dive deeper than anyone into a problem and emerge with the most viable solution, but connecting emotionally is where they consistently fall short — they love the part of getting to know someone but often lack the interest or ability to build a heartfelt bond beyond that" :
    report.core.lifePath === 8 ? "a hard worker chasing hard lessons — they get their worth from accomplishing great things and the bigger the goal the more satisfying the achievement; money and material success are reminders of all the effort put in, but dealing with authority is difficult because they are supremely confident in their own judgment; stress is their all-too-familiar enemy, and their relationships can look more like business arrangements than passionate love affairs because they see themselves as providers first" :
    report.core.lifePath === 9 ? "a sage who has fought through many challenges and carries wisdom others haven't earned yet — they naturally end up in roles of support and advice, feel a deep devotion to their fellow humans, and have a special kind of spiritual connection that functions as a safety net; but they have become so accustomed to enduring their own challenges that others don't notice when they are struggling, and they have a very difficult time asking for help even when they desperately need it" :
    report.core.lifePath === 11 ? "an extraordinarily intuitive person who may exhibit abilities that border on psychic — their purpose is to use these gifts for humanity, but confidence and chronic worry often get in the way; they struggle to trust their own unique skills, but when they overcome this and lean into their life purpose they achieve a spiritual enlightenment most people never approach; they are beautiful souls who attract others easily and are uncannily attuned to what their partner needs before the partner knows it" :
    report.core.lifePath === 22 ? "a master builder whose vision operates at a scale most people cannot hold in mind — they combine the practical genius of the 4 with spiritual reach of the 11, and the projects they are capable of completing could genuinely change things; but the weight of knowing exactly what they could build if they committed fully becomes its own obstacle, and the gap between their potential and their output is the central tension of their life" :
    "a master teacher whose compassion is almost impossible to sustain — their highest expression is not what they do but what others become near them; they carry a level of emotional wisdom that reshapes people without those people realizing it has happened, and their greatest challenge is directing even a fraction of that compassion back toward themselves"
  }.
3. Cross-referencing — actively connect numbers. E.g. "your LP${report.core.lifePath} combined with Expression ${report.core.expression} means..."
4. Specificity anchors — reference the actual numbers (${report.core.lifePath}, ${report.core.expression}, ${report.core.soulUrge}) in the text so it feels calculated, not generic.
5. Forward hooks — end each chapter with a tension or question that pulls the reader to the next.

CHAPTER LENGTH: 180-220 words each. Flowing prose paragraphs, no bullet points inside the narrative.

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
      max_tokens: 4500,
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
