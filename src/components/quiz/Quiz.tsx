import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Star, Check, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateQuizToken } from "@/lib/checkout.functions";
import { ProgressBar } from "./widgets/ProgressBar";
import { OptionCard } from "./widgets/OptionCard";
import { StressSlider } from "./widgets/StressSlider";
import { DateOfBirthPicker } from "./widgets/DateOfBirthPicker";
import { AILoader, type TeaserPayload } from "./widgets/AILoader";
import { MilestoneScreen } from "./MilestoneScreen";
import { Paywall } from "./Paywall";
import { BarnumReveal } from "./BarnumReveal";
import { track } from "@/lib/analytics";
import { lifePath, zodiacSign } from "@/lib/quiz/numerology";
import type { Answers } from "@/lib/quiz/types";
import type { DOB } from "@/lib/quiz/numerology";
import heroAsset from "@/assets/quiz/hero-numerology.jpg.asset.json";
const heroImg = heroAsset.url;
import ms1 from "@/assets/quiz/milestone-1.jpg";
import ms2 from "@/assets/quiz/milestone-2.jpg";
import ms3 from "@/assets/quiz/milestone-3.jpg";
import ms4 from "@/assets/quiz/milestone-4.jpg";

type ChoiceStep = { kind: "choice"; key: keyof Answers; question: string; options: string[] };
type SliderStep = { kind: "slider"; key: keyof Answers; question: string; minLabel: string; maxLabel: string };
type Step =
  | { kind: "hero" }
  | { kind: "dob" }
  | { kind: "numerology_insight" }
  | { kind: "partnerName" }
  | ChoiceStep
  | SliderStep
  | { kind: "did_you_know"; variant: 1 | 2 }
  | { kind: "before_after" }
  | { kind: "testimonial" }
  | { kind: "name" }
  | { kind: "email" }
  | { kind: "loader" }
  | { kind: "barnum_reveal" }
  | { kind: "milestone"; n: 1 | 2 | 3 | 4 }
  | { kind: "paywall" };

const STEPS: Step[] = [
  { kind: "hero" },
  { kind: "choice", key: "gender", question: "Select your biological or energetic alignment:", options: ["Female", "Male", "Non-binary"] },
  { kind: "dob" },
  { kind: "numerology_insight" },
  { kind: "choice", key: "relationship", question: "What is your current relationship status?", options: ["Single", "In a relationship", "Married", "It's complicated"] },
  { kind: "partnerName" },
  { kind: "choice", key: "focus", question: "What is your primary focus for the next 6 months?", options: [
    "Breaking through financial stagnation & finding my wealthy niche",
    "Attracting a deeply aligned partner or healing current relationships",
    "Finding my true purpose and escaping burnout",
  ] },
  { kind: "choice", key: "anxiety", question: "Do you experience high anxiety when making major life choices?", options: ["Yes, frequently", "Sometimes", "Rarely, I trust my gut"] },
  { kind: "milestone", n: 1 },
  { kind: "did_you_know", variant: 1 },
  { kind: "slider", key: "financialStress", question: "Rate your current financial stress level", minLabel: "Peaceful", maxLabel: "Constant Anxiety" },
  { kind: "slider", key: "energy", question: "Rate your average daily energy levels", minLabel: "Completely Drained", maxLabel: "Fully Charged" },
  { kind: "slider", key: "purpose", question: "How close are you to living your ultimate life purpose?", minLabel: "Lost", maxLabel: "Fully Aligned" },
  { kind: "choice", key: "block", question: "What do you feel is holding you back the most right now?", options: [
    "Fear of failure & self-doubt", "Lack of physical energy", "Wrong environment / people", "Unexplainable bad luck",
  ] },
  { kind: "choice", key: "uphill", question: "Do you often feel like you work 10× harder than others, but hit an invisible glass ceiling?", options: [
    "Yes, constantly. It feels like an uphill battle.",
    "Sometimes, especially when it comes to money.",
    "No, things flow to me easily.",
  ] },
  { kind: "before_after" },
  { kind: "milestone", n: 2 },
  { kind: "choice", key: "finHabit", question: "How do you usually handle unexpected financial challenges?", options: ["I panic and freeze", "I obsessively calculate every cent", "I ignore it and hope it resolves"] },
  { kind: "choice", key: "signs", question: "Do you often notice repeating numbers (like 11:11, 222, 777) on clocks, licenses, or receipts?", options: ["Yes, constantly", "Rarely", "Never noticed"] },
  { kind: "choice", key: "fear", question: "What keeps you awake at night when thinking about your future?", options: ["The fear of running out of money", "The fear of ending up lonely", "The fear of wasting my true potential"] },
  { kind: "choice", key: "focusEase", question: "How easily do you get distracted from your big, long-term goals?", options: ["Very easily, I lose motivation", "Only when under severe stress", "Never, I have laser-focus"] },
  { kind: "choice", key: "empathy", question: "Do you feel like you easily absorb other people's negative energy or moods?", options: ["Yes, I am a total emotional sponge", "Sometimes, depending on the person", "No, I am completely shielded"] },
  { kind: "testimonial" },
  { kind: "choice", key: "intuition", question: "How often does your first gut feeling about a person or decision prove to be right?", options: ["Almost 100% of the time", "50/50", "I rarely listen to my gut"] },
  { kind: "choice", key: "lastHappy", question: "When was the last time you felt truly happy, abundant, and in complete flow?", options: ["In the last 30 days", "More than a year ago", "Honestly, I can't even remember"] },
  { kind: "choice", key: "readiness", question: "If your report reveals an uncomfortable truth about your career or relationship, will you act on it?", options: ["Yes, I want the raw truth", "I will think about it", "I am just curious"] },
  { kind: "choice", key: "occupation", question: "What is your current occupational status?", options: ["9-to-5 Employee", "Freelancer / Creator", "Business Owner", "Unemployed / Transitioning"] },
  { kind: "choice", key: "precision", question: "Which section of your matrix should our AI compute with maximum precision?", options: [
    "Exact dates for my financial breakthrough",
    "Karmic compatibility with my specific partner",
    "Daily energy protection techniques",
  ] },
  { kind: "choice", key: "karma", question: "Do you believe that patterns from your past or family lineage are holding you back?", options: ["Yes, definitely", "No, I don't think so", "I want the matrix to prove it"] },
  { kind: "milestone", n: 3 },
  { kind: "did_you_know", variant: 2 },
  { kind: "name" },
  { kind: "email" },
  { kind: "milestone", n: 4 },
  { kind: "loader" },
  { kind: "barnum_reveal" },
  { kind: "paywall" },
];

const MILESTONES = {
  1: { image: ms1, eyebrow: "Milestone 1 of 4", title: "Your Core Vibration is now locked.", body: "Based on your birth date, you possess a rare alignment of the Crown Number. Only 14% of people carry this exact cosmic blueprint. It means your analytical mind is incredibly sharp, but your current environment might be actively suffocating your inner drive. Let's measure your personal alignment to see exactly where the energy leak is.", cta: "Analyze My Alignment 📊" },
  2: { image: ms2, eyebrow: "Milestone 2 of 4", title: "We hear you. And it is NOT your fault.", body: "Looking at your alignment scores, this is a textbook symptom of a hidden Karmic Debt block. You aren't lazy. You are just driving through life with the handbrake pulled up. In the next section we'll analyze your psychological patterns to calculate the exact timeline when this block can be permanently cleared.", cta: "Identify My Patterns 🧠" },
  3: { image: ms3, eyebrow: "64% of your matrix compiled ⚡", title: "Amazing focus.", body: "Your answers regarding the fear of wasting potential confirm that you are currently approaching a major Turning Point Cycle. Missing this energetic window could lock you in your current stagnation loop for another 7 years. Are you ready to see the radical changes your numbers require?", cta: "Yes, I'm ready to act 🧭" },
  4: { image: ms4, eyebrow: "Calculation Phase 1: Complete 🎉", title: "You've done the hard work.", body: "Your dedication is incredible. We have successfully isolated the exact core blocks holding back your Money, Love, and Inner Peace. The mathematical algorithm is now ready to compile your personal Numerology Blueprint. Let's secure your profile.", cta: "Proceed to My Results ➡️" },
} as const;

const LP_LABEL: Record<number, { title: string; emoji: string; tagline: string }> = {
  1: { title: "The Pioneer", emoji: "🔥", tagline: "You move before others finish deciding. Natural authority — but isolation is the quiet price you pay." },
  2: { title: "The Peacemaker", emoji: "🕊️", tagline: "You read rooms others miss entirely. Your gift is harmony — your blind spot is forgetting your own needs." },
  3: { title: "The Communicator", emoji: "✨", tagline: "You see opportunity everywhere and draw people naturally. Depth is your unexplored frontier." },
  4: { title: "The Builder", emoji: "🏗️", tagline: "Patient, systematic, deeply reliable. Your work outlasts everyone else's — when you finish it." },
  5: { title: "The Freedom-Seeker", emoji: "🌊", tagline: "You learn by living. The moment anything loses its spark, you are already mentally somewhere else." },
  6: { title: "The Nurturer", emoji: "💛", tagline: "You carry others effortlessly. The work is learning to carry yourself just as well." },
  7: { title: "The Analyst", emoji: "🔭", tagline: "You think several layers deeper than the conversation. Solitude is research, not isolation." },
  8: { title: "The Strategist", emoji: "⚡", tagline: "Ambition is your operating system. Power and material mastery are your curriculum this lifetime." },
  9: { title: "The Humanitarian", emoji: "🌍", tagline: "You carry wisdom others haven't earned yet. Your purpose is genuinely larger than personal gain." },
  11: { title: "The Intuitive", emoji: "🌙", tagline: "You sense things before they can be proven. Your perception borders on the uncomfortable — and it is rarely wrong." },
  22: { title: "The Master Builder", emoji: "🏛️", tagline: "Your vision operates at a scale most cannot hold in mind. What you could build would genuinely change things." },
  33: { title: "The Master Teacher", emoji: "🎯", tagline: "Your influence reshapes people without them realizing it happened. That is your real power." },
};

export function Quiz() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [dob, setDob] = useState<DOB | undefined>();
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [partnerNameInput, setPartnerNameInput] = useState("");
  const [teaserParagraph, setTeaserParagraph] = useState<string | null>(null);
  const [quizToken, setQuizToken] = useState<string | null>(null);
  const tokenRequested = useRef(false);
  const genToken = useServerFn(generateQuizToken);


  const step = STEPS[idx];
  const next = () => setIdx((i) => {
    const nextIdx = Math.min(STEPS.length - 1, i + 1);
    const nextStep = STEPS[nextIdx];
    if (nextStep?.kind === "partnerName" && answers.relationship === "Single") {
      const skip = Math.min(STEPS.length - 1, nextIdx + 1);
      history.pushState({ quizStep: skip }, "");
      return skip;
    }
    history.pushState({ quizStep: nextIdx }, "");
    return nextIdx;
  });
  const back = () => setIdx((i) => Math.max(0, i - 1));

  useEffect(() => {
    history.replaceState({ quizStep: 0 }, "");
    const onPop = (e: PopStateEvent) => {
      const step = e.state?.quizStep;
      if (typeof step === "number") setIdx(step);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (step.kind === "hero") track("quiz_started", {});
    if (step.kind === "loader") {
      track("quiz_completed", {});
      if (!tokenRequested.current) {
        tokenRequested.current = true;
        genToken().then((r) => setQuizToken(r.quizToken)).catch((e) => {
          console.error("quiz token error", e);
          tokenRequested.current = false;
        });
      }
    }
  }, [idx]);


  const trackAnswer = (questionId: string, value: string | number) => {
    const pct = Math.round((idx / STEPS.length) * 100);
    track("quiz_question_answered", { question_id: questionId, value, step_index: idx });
    if (pct >= 25 && pct < 50) track("quiz_progress_milestone", { pct: 25 });
    else if (pct >= 50 && pct < 75) track("quiz_progress_milestone", { pct: 50 });
    else if (pct >= 75) track("quiz_progress_milestone", { pct: 75 });
  };

  const progress = useMemo(() => (idx === 0 ? 0 : (idx / (STEPS.length - 1)) * 100), [idx]);
  const showHeader =
    step.kind !== "hero" &&
    step.kind !== "loader" &&
    step.kind !== "barnum_reveal" &&
    step.kind !== "paywall" &&
    step.kind !== "numerology_insight";

  const select = (key: keyof Answers, value: string | number) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    trackAnswer(String(key), value);
    setTimeout(next, 220);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background">
      {showHeader && (
        <header className="sticky top-0 z-20 bg-background/90 px-5 pb-3 pt-4 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={back}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-navy">Astrelo</p>
            <div className="h-9 w-9" />
          </div>
          <ProgressBar value={progress} />
        </header>
      )}

      <main className="flex flex-1 flex-col px-5 pb-8 pt-6">

        {step.kind === "hero" && <Hero onContinue={next} />}

        {step.kind === "dob" && (
          <div className="quiz-fade-in space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet mb-2">Step 1 of 2</p>
              <h2 className="text-[22px] font-bold leading-tight text-navy">Enter your date of birth</h2>
              <p className="mt-2 text-sm text-muted-foreground">We use this to calculate your Life Path number, karmic cycles, and energetic windows.</p>
            </div>
            <DateOfBirthPicker onChange={setDob} />
            <button
              disabled={!dob}
              onClick={() => {
                if (dob) {
                  setAnswers((a) => ({ ...a, dob }));
                  trackAnswer("dob", `${dob.month}/${dob.day}/${dob.year}`);
                  next();
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              Calculate My Numbers <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step.kind === "numerology_insight" && answers.dob && (
          <NumerologyInsightView dob={answers.dob} onContinue={next} />
        )}

        {step.kind === "choice" && step.key === "gender" && (
          <GenderView value={answers.gender as string | undefined} onSelect={(v) => select("gender", v)} />
        )}

        {step.kind === "choice" && step.key !== "gender" && (
          <ChoiceView step={step} value={answers[step.key] as string | undefined} onSelect={(v) => select(step.key, v)} />
        )}

        {step.kind === "slider" && (
          <SliderView key={idx} step={step} onConfirm={(v) => { setAnswers((a) => ({ ...a, [step.key]: v })); trackAnswer(String(step.key), v); next(); }} />
        )}

        {step.kind === "milestone" && (
          <MilestoneScreen {...MILESTONES[step.n]} onNext={next} />
        )}

        {step.kind === "did_you_know" && (
          <DidYouKnowView variant={step.variant} focus={answers.focus || ""} onContinue={next} />
        )}

        {step.kind === "before_after" && (
          <BeforeAfterView focus={answers.focus || ""} onContinue={next} />
        )}

        {step.kind === "testimonial" && (
          <TestimonialView onContinue={next} />
        )}

        {step.kind === "name" && (
          <SimpleInput
            key="name"
            title="What name do your friends and family call you?"
            placeholder="Your first name"
            value={nameInput}
            onChange={setNameInput}
            onSubmit={() => { if (nameInput.trim()) { setAnswers((a) => ({ ...a, name: nameInput.trim() })); trackAnswer("name", nameInput.trim()); next(); } }}
            cta="Continue"
          />
        )}

        {step.kind === "email" && (
          <SimpleInput
            key="email"
            title="Where should we send your Blueprint?"
            sub="Your report will be emailed once generated."
            placeholder="your@email.com"
            type="email"
            value={emailInput}
            onChange={setEmailInput}
            onSubmit={() => {
              if (/.+@.+\..+/.test(emailInput)) {
                setAnswers((a) => ({ ...a, email: emailInput.trim() }));
                trackAnswer("email", "submitted");
                track("generate_lead", { method: "quiz_email_capture" });
                next();
              }
            }}
            cta="Send My Blueprint"
          />
        )}

        {step.kind === "partnerName" && (
          <div className="quiz-fade-in space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet mb-2">Optional</p>
              <h2 className="text-[22px] font-bold leading-tight text-navy">What is your partner's name?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Used to personalise your Love Compatibility chapter.</p>
            </div>
            <input
              type="text"
              value={partnerNameInput}
              onChange={(e) => setPartnerNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setAnswers((a) => ({ ...a, partnerName: partnerNameInput.trim() || undefined })); next(); } }}
              placeholder="e.g. Alex"
              className="h-14 w-full rounded-2xl border-2 border-border bg-card px-5 text-base font-medium outline-none transition-colors focus:border-violet"
            />
            <button
              onClick={() => { setAnswers((a) => ({ ...a, partnerName: partnerNameInput.trim() || undefined })); next(); }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-sm font-bold text-white"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={next} className="w-full text-center text-sm text-muted-foreground underline">
              Skip — generate without partner name
            </button>
          </div>
        )}

        {step.kind === "loader" && answers.dob && (
          <AILoader
            name={answers.name || "you"}
            onDone={next}
            teaserPayload={{
              name: answers.name || "you",
              dobDay: answers.dob.day,
              dobMonth: answers.dob.month,
              dobYear: answers.dob.year,
              zodiac: zodiacSign(answers.dob.month, answers.dob.day),
              lifePathNum: lifePath(answers.dob),
              focus: answers.focus || "",
              relationship: answers.relationship || "",
              karma: answers.karma || "",
              financialStress: answers.financialStress ?? 5,
            }}
            onTeaserReady={setTeaserParagraph}
          />
        )}

        {step.kind === "barnum_reveal" && (
          <BarnumReveal
            name={answers.name || "you"}
            paragraph={teaserParagraph}
            onContinue={next}
          />
        )}

        {step.kind === "paywall" && answers.dob && (
          <Paywall name={answers.name || "you"} dob={answers.dob} email={answers.email || emailInput} partnerName={answers.partnerName as string | undefined} />
        )}

      </main>
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="quiz-fade-in flex flex-col">
      <div className="mx-auto mt-2 mb-4 flex items-center gap-2 rounded-full bg-cosmic px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
        <Star className="h-3 w-3 fill-gold text-gold" /> 2,300+ people decoded their numbers
      </div>
      <div className="relative mx-auto mb-6 aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl shadow-card">
        <img src={heroImg} alt="Discover what your numbers mean" className="h-full w-full object-cover" />
      </div>
      <h1 className="text-center text-[26px] font-bold leading-tight text-navy">
        What Does Your Birth Date Actually Say About You?
      </h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
        A 2-minute quiz that reveals your Life Path, karmic blocks, and what 2026 holds for you.
      </p>
      <button
        onClick={onContinue}
        className="pulse-soft mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-sm font-bold text-white transition-all"
      >
        Reveal My Blueprint <ArrowRight className="h-4 w-4" />
      </button>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3 text-violet" /> 2-min quiz
        </div>
        <div className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 font-medium text-muted-foreground">
          <Star className="h-3 w-3 fill-gold text-gold" /> Rated 4.8 / 5
        </div>
      </div>
      <p className="mt-4 text-center text-[10px] text-muted-foreground">
        By continuing you agree with Terms of Use & Privacy Policy.
      </p>
    </div>
  );
}

// ─── Numerology Insight ───────────────────────────────────────────────────────
function NumerologyInsightView({ dob, onContinue }: { dob: DOB; onContinue: () => void }) {
  const lp = lifePath(dob);
  const zodiac = zodiacSign(dob.month, dob.day);
  const label = LP_LABEL[lp] ?? LP_LABEL[1];
  return (
    <div className="quiz-fade-in flex min-h-[80vh] flex-col items-center justify-center space-y-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet">Your Numbers Decoded</p>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center rounded-2xl border-2 border-violet/30 bg-card px-6 py-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Life Path</p>
          <p className="text-5xl font-bold text-navy">{lp}</p>
        </div>
        <div className="text-3xl">·</div>
        <div className="flex flex-col items-center rounded-2xl border-2 border-gold/40 bg-card px-6 py-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Zodiac</p>
          <p className="text-lg font-bold text-navy">{zodiac}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-3xl">{label.emoji}</p>
        <h2 className="text-2xl font-bold text-navy">{label.title}</h2>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">{label.tagline}</p>
      </div>
      <div className="w-full rounded-2xl bg-violet/10 px-5 py-3 text-[12px] font-medium text-violet">
        Only 1 in 12 people share this Life Path. Your blueprint goes deeper than your zodiac sign.
      </div>
      <button
        onClick={onContinue}
        className="w-full rounded-2xl bg-navy py-4 text-sm font-bold text-gold"
      >
        Continue Building My Blueprint →
      </button>
    </div>
  );
}

// ─── Gender View (visual cards) ───────────────────────────────────────────────
function GenderView({ value, onSelect }: { value: string | undefined; onSelect: (v: string) => void }) {
  return (
    <div className="quiz-fade-in space-y-5">
      <h2 className="text-[22px] font-bold leading-tight text-navy">Select your biological or energetic alignment:</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Female", gradient: "from-pink-400 via-purple-500 to-indigo-600", emoji: "🌸" },
          { label: "Male", gradient: "from-blue-400 via-indigo-500 to-violet-600", emoji: "⚡" },
        ].map(({ label, gradient, emoji }) => (
          <button
            key={label}
            onClick={() => onSelect(label)}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all ${value === label ? "border-violet ring-2 ring-violet/30" : "border-border"}`}
          >
            <div className={`bg-gradient-to-br ${gradient} flex h-36 items-center justify-center text-4xl`}>
              {emoji}
            </div>
            <div className="bg-card py-2.5 text-sm font-bold text-navy">{label}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => onSelect("Non-binary")}
        className={`w-full rounded-2xl border-2 py-3 text-sm font-medium transition-all ${value === "Non-binary" ? "border-violet bg-violet/10 text-violet" : "border-border text-muted-foreground"}`}
      >
        Non-binary / Prefer not to say
      </button>
    </div>
  );
}

// ─── Did You Know ─────────────────────────────────────────────────────────────
const DID_YOU_KNOW = {
  1: {
    stat: "76%",
    fact: "of financial blocks are tied to timing cycles — not effort or ability.",
    detail: "Our algorithm identifies your specific cycle and shows exactly when the pattern breaks.",
    emoji: "💰",
  },
  2: {
    stat: "2×",
    fact: "clearer decision-making reported by people who understand their core numbers.",
    detail: "Not because numerology tells you what to do — but because you finally understand why you keep choosing the same things.",
    emoji: "🧭",
  },
};

function DidYouKnowView({ variant, focus, onContinue }: { variant: 1 | 2; focus: string; onContinue: () => void }) {
  const data = DID_YOU_KNOW[variant];
  return (
    <div className="quiz-fade-in flex flex-col space-y-6">
      <p className="text-xs font-bold uppercase tracking-widest text-violet">Did you know?</p>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
        <div className="text-5xl font-black text-navy">{data.stat}</div>
        <p className="text-base font-semibold text-navy leading-snug">{data.fact}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{data.detail}</p>
      </div>
      <div className="text-4xl text-center">{data.emoji}</div>
      <button
        onClick={onContinue}
        className="w-full rounded-2xl bg-navy py-4 text-sm font-bold text-white flex items-center justify-center gap-2"
      >
        Continue <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Before / After ──────────────────────────────────────────────────────────
function BeforeAfterView({ focus, onContinue }: { focus: string; onContinue: () => void }) {
  const isLove = /partner|love|relation|heal/i.test(focus);
  const isFinance = /financ|wealth|money|stagnation/i.test(focus);

  const beforeItems = isLove
    ? ["Repeating relationship patterns", "Attracting the wrong people", "Fear of being alone", "Feeling emotionally drained"]
    : isFinance
    ? ["Invisible financial ceiling", "Working hard, earning little", "Money blocks you can't explain", "Repeating financial mistakes"]
    : ["Burnout despite real effort", "Feeling misaligned with work", "Wasting your true potential", "No clear direction forward"];

  const afterItems = isLove
    ? ["Karmic love patterns decoded", "Compatibility map revealed", "Right timing for relationships", "Genuine connection unlocked"]
    : isFinance
    ? ["Financial windows identified", "Wealth blocks decoded", "Exact timing for breakthrough", "Money patterns cleared"]
    : ["True purpose unlocked", "Energetic alignment restored", "Month-by-month direction", "Burnout cycle broken"];

  return (
    <div className="quiz-fade-in space-y-5">
      <h2 className="text-[22px] font-bold leading-tight text-navy">Transform Your Journey</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-destructive">Before</p>
          {beforeItems.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <p className="text-[11px] text-muted-foreground leading-snug">{item}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-green-600">After</p>
          {afterItems.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
              <p className="text-[11px] text-muted-foreground leading-snug">{item}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">Your Blueprint was built to move you from left to right — with specific dates, not vague advice.</p>
      <button
        onClick={onContinue}
        className="w-full rounded-2xl bg-navy py-4 text-sm font-bold text-white flex items-center justify-center gap-2"
      >
        I want this <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Testimonial ─────────────────────────────────────────────────────────────
function TestimonialView({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="quiz-fade-in space-y-6">
      <p className="text-xs font-bold uppercase tracking-widest text-violet">What others say</p>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          "I've tried astrology apps and zodiac readings for years. This was different — the Life Path analysis described patterns I never told anyone about. The financial timing windows were accurate within 2 weeks. It felt less like prediction and more like recognition."
        </p>
        <p className="text-xs font-bold text-muted-foreground">— Rachel M., 34 · Verified purchase</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          "The karmic debt section described my relationship pattern so precisely I had to re-read it three times. I've been on my own 'self-improvement journey' for 5 years — this cut through everything in 10 minutes."
        </p>
        <p className="text-xs font-bold text-muted-foreground">— James K., 41 · Verified purchase</p>
      </div>
      <button
        onClick={onContinue}
        className="w-full rounded-2xl bg-navy py-4 text-sm font-bold text-white flex items-center justify-center gap-2"
      >
        Continue <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Choice View ──────────────────────────────────────────────────────────────
function ChoiceView({ step, value, onSelect }: { step: ChoiceStep; value: string | undefined; onSelect: (v: string) => void }) {
  return (
    <div className="quiz-fade-in space-y-5">
      <h2 className="text-[22px] font-bold leading-tight text-navy">{step.question}</h2>
      <div className="space-y-2.5">
        {step.options.map((o) => (
          <OptionCard key={o} label={o} selected={value === o} onClick={() => onSelect(o)} />
        ))}
      </div>
    </div>
  );
}

// ─── Slider View ──────────────────────────────────────────────────────────────
function SliderView({ step, onConfirm }: { step: SliderStep; onConfirm: (v: number) => void }) {
  const [v, setV] = useState(5);
  return (
    <div className="quiz-fade-in space-y-8">
      <h2 className="text-[22px] font-bold leading-tight text-navy">{step.question}</h2>
      <StressSlider minLabel={step.minLabel} maxLabel={step.maxLabel} initial={5} onChange={setV} />
      <button
        onClick={() => onConfirm(v)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-sm font-bold text-white"
      >
        Continue <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Simple Input ─────────────────────────────────────────────────────────────
function SimpleInput({
  title, sub, placeholder, value, onChange, onSubmit, cta, type = "text",
}: {
  title: string; sub?: string; placeholder: string; value: string;
  onChange: (v: string) => void; onSubmit: () => void; cta: string; type?: string;
}) {
  return (
    <div className="quiz-fade-in space-y-5">
      <h2 className="text-[22px] font-bold leading-tight text-navy">{title}</h2>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      <input
        type={type}
        value={value}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        placeholder={placeholder}
        aria-label={title}
        className="h-14 w-full rounded-2xl border-2 border-border bg-card px-5 text-base font-medium outline-none transition-colors focus:border-violet"
      />
      <button
        onClick={onSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-sm font-bold text-white"
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
