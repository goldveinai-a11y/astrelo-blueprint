import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Compass, Sparkles, Star } from "lucide-react";
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
import heroImg from "@/assets/quiz/hero-cosmic.jpg";
import ms1 from "@/assets/quiz/milestone-1.jpg";
import ms2 from "@/assets/quiz/milestone-2.jpg";
import ms3 from "@/assets/quiz/milestone-3.jpg";
import ms4 from "@/assets/quiz/milestone-4.jpg";

type ChoiceStep = {
  kind: "choice";
  key: keyof Answers;
  question: string;
  options: string[];
};
type SliderStep = {
  kind: "slider";
  key: keyof Answers;
  question: string;
  minLabel: string;
  maxLabel: string;
};
type Step =
  | { kind: "hero" }
  | ChoiceStep
  | SliderStep
  | { kind: "name" }
  | { kind: "email" }
  | { kind: "loader" }
  | { kind: "barnum_reveal" }
  | { kind: "milestone"; n: 1 | 2 | 3 | 4 }
  | { kind: "paywall" };

const STEPS: Step[] = [
  { kind: "hero" },
  { kind: "choice", key: "gender", question: "Select your biological or energetic alignment:", options: ["Female", "Male", "Non-binary"] },
  { kind: "choice", key: "relationship", question: "What is your current relationship status?", options: ["Single", "In a relationship", "Married", "It's complicated"] },
  { kind: "choice", key: "focus", question: "What is your primary focus for the next 6 months?", options: [
    "Breaking through financial stagnation & finding my wealthy niche",
    "Attracting a deeply aligned partner or healing current relationships",
    "Finding my true purpose and escaping burnout",
  ] },
  { kind: "choice", key: "anxiety", question: "Do you experience high anxiety when making major life choices?", options: ["Yes, frequently", "Sometimes", "Rarely, I trust my gut"] },
  { kind: "milestone", n: 1 },
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
  { kind: "milestone", n: 2 },
  { kind: "choice", key: "finHabit", question: "How do you usually handle unexpected financial challenges?", options: ["I panic and freeze", "I obsessively calculate every cent", "I ignore it and hope it resolves"] },
  { kind: "choice", key: "signs", question: "Do you often notice repeating numbers (like 11:11, 222, 777) on clocks, licenses, or receipts?", options: ["Yes, constantly", "Rarely", "Never noticed"] },
  { kind: "choice", key: "fear", question: "What keeps you awake at night when thinking about your future?", options: ["The fear of running out of money", "The fear of ending up lonely", "The fear of wasting my true potential"] },
  { kind: "choice", key: "focusEase", question: "How easily do you get distracted from your big, long-term goals?", options: ["Very easily, I lose motivation", "Only when under severe stress", "Never, I have laser-focus"] },
  { kind: "choice", key: "empathy", question: "Do you feel like you easily absorb other people's negative energy or moods?", options: ["Yes, I am a total emotional sponge", "Sometimes, depending on the person", "No, I am completely shielded"] },
  { kind: "choice", key: "intuition", question: "How often does your first gut feeling about a person or decision prove to be right?", options: ["Almost 100% of the time", "50/50", "I rarely listen to my gut"] },
  { kind: "milestone", n: 3 },
  { kind: "choice", key: "lastHappy", question: "When was the last time you felt truly happy, abundant, and in complete flow?", options: ["In the last 30 days", "More than a year ago", "Honestly, I can't even remember"] },
  { kind: "choice", key: "readiness", question: "If your report reveals an uncomfortable truth about your career or relationship, will you act on it?", options: ["Yes, I want the raw truth", "I will think about it", "I am just curious"] },
  { kind: "choice", key: "occupation", question: "What is your current occupational status?", options: ["9-to-5 Employee", "Freelancer / Creator", "Business Owner", "Unemployed / Transitioning"] },
  { kind: "choice", key: "precision", question: "Which section of your matrix should our AI compute with maximum precision?", options: [
    "Exact dates for my financial breakthrough",
    "Karmic compatibility with my specific partner",
    "Daily energy protection techniques",
  ] },
  { kind: "choice", key: "karma", question: "Do you believe that patterns from your past or family lineage are holding you back?", options: ["Yes, definitely", "No, I don't think so", "I want the matrix to prove it"] },
  { kind: "milestone", n: 4 },
  { kind: "name" },
  { kind: "email" },
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

export function Quiz() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [dob, setDob] = useState<DOB | undefined>();
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [teaserParagraph, setTeaserParagraph] = useState<string | null>(null);

  const step = STEPS[idx];
  const next = () => setIdx((i) => Math.min(STEPS.length - 1, i + 1));
  const back = () => setIdx((i) => Math.max(0, i - 1));

  useEffect(() => {
    const stepKey = "key" in step ? step.key : "n" in step ? `milestone_${step.n}` : step.kind;
    track("quiz_step_view", {
      step_index: idx,
      step_total: STEPS.length,
      step_kind: step.kind,
      step_key: stepKey,
    });
  }, [idx]);

  const progress = useMemo(() => (idx === 0 ? 0 : (idx / (STEPS.length - 1)) * 100), [idx]);
  const showHeader = step.kind !== "hero" && step.kind !== "loader" && step.kind !== "barnum_reveal" && step.kind !== "paywall";

  const select = (key: keyof Answers, value: string | number) => {
    setAnswers((a) => ({ ...a, [key]: value }));
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
            <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} />
        </header>
      )}

      <main className="flex-1 px-5 pb-10 pt-4">
        {step.kind === "hero" && <Hero
          dob={dob} setDob={setDob}
          onContinue={() => { if (dob) { setAnswers((a) => ({ ...a, dob })); next(); } }}
        />}

        {step.kind === "choice" && (
          <ChoiceView key={idx} step={step} value={answers[step.key] as string | undefined} onSelect={(v) => select(step.key, v)} />
        )}

        {step.kind === "slider" && (
          <SliderView key={idx} step={step} onConfirm={(v) => { setAnswers((a) => ({ ...a, [step.key]: v })); next(); }} />
        )}

        {step.kind === "milestone" && (
          <MilestoneScreen {...MILESTONES[step.n]} onNext={next} />
        )}

        {step.kind === "name" && (
          <SimpleInput
            key="name"
            title="What name do your friends and family call you?"
            sub="We'll use it to personalise every section of your blueprint."
            placeholder="First name"
            value={nameInput}
            onChange={setNameInput}
            cta="Continue"
            onSubmit={() => { if (nameInput.trim()) { setAnswers((a) => ({ ...a, name: nameInput.trim() })); next(); } }}
          />
        )}

        {step.kind === "email" && (
          <SimpleInput
            key="email"
            type="email"
            title={`${answers.name || "Friend"}, where should we send your validation code & summary?`}
            sub="No spam. Your data is encrypted and never shared."
            placeholder="you@email.com"
            value={emailInput}
            onChange={setEmailInput}
            cta="Send My Blueprint"
            onSubmit={() => {
              if (/.+@.+\..+/.test(emailInput)) {
                setAnswers((a) => ({ ...a, email: emailInput.trim() }));
                track("generate_lead", { method: "quiz_email_capture" });
                next();
              }
            }}
          />
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
          <Paywall name={answers.name || "you"} dob={answers.dob} email={answers.email || emailInput} />
        )}
      </main>
    </div>
  );
}

function Hero({ dob, setDob, onContinue }: { dob: DOB | undefined; setDob: (d: DOB | undefined) => void; onContinue: () => void }) {
  return (
    <div className="quiz-fade-in flex flex-col">
      <div className="mx-auto mt-2 mb-4 flex items-center gap-2 rounded-full bg-cosmic px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
        <Star className="h-3 w-3 fill-gold text-gold" /> Top numerology quiz · 4.8
      </div>
      <div className="relative mx-auto mb-6 aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl shadow-card">
        <img src={heroImg} alt="Cosmic numerology" className="h-full w-full object-cover" />
      </div>
      <h1 className="text-center text-[28px] font-bold leading-tight text-navy">
        Your Life is Not Random.<br />It's a Mathematical Sequence.
      </h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
        Decode the hidden blueprint of your birth date to unlock your financial potential and clear karmic blocks.
      </p>
      <div className="mt-6 space-y-3">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-violet">Enter your date of birth</p>
        <DateOfBirthPicker onChange={setDob} />
      </div>
      <button
        disabled={!dob}
        onClick={onContinue}
        className="pulse-soft mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:bg-muted-foreground disabled:opacity-60 disabled:pulse-none"
      >
        Decode My Birth Date <Compass className="h-4 w-4" />
      </button>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3 text-violet" /> 2-min quiz
        </div>
        <div className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 font-medium text-muted-foreground">
          🎯 94.3% accuracy rated
        </div>
      </div>
      <p className="mt-4 text-center text-[10px] text-muted-foreground">
        By continuing you agree with Terms of Use & Privacy Policy.
      </p>
    </div>
  );
}

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
