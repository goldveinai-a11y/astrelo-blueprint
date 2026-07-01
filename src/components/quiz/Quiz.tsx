import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Star, Check, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateQuizToken } from "@/lib/checkout.functions";
import { ProgressBar } from "./widgets/ProgressBar";
import { OptionCard } from "./widgets/OptionCard";
import { StressSlider } from "./widgets/StressSlider";
import { DateOfBirthPicker } from "./widgets/DateOfBirthPicker";
import { TimeOfBirthPicker } from "./widgets/TimeOfBirthPicker";
import { PlaceSearch } from "./widgets/PlaceSearch";
import { AILoader, type TeaserPayload } from "./widgets/AILoader";
import { MilestoneScreen } from "./MilestoneScreen";
import { Paywall } from "./Paywall";
import { BookPreview } from "./BookPreview";
import { track } from "@/lib/analytics";
import { lifePath, zodiacSign } from "@/lib/quiz/numerology";
import type { Answers, GeoPoint } from "@/lib/quiz/types";
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
  | { kind: "birthTime" }
  | { kind: "birthPlace" }
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
  { kind: "choice", key: "gender", question: "Let's start simply.", options: ["Female", "Male", "Non-binary"] },
  { kind: "dob" },
  { kind: "birthTime" },
  { kind: "birthPlace" },
  { kind: "numerology_insight" },
  { kind: "choice", key: "relationship", question: "Where are you in your story right now?", options: ["Single", "In a relationship", "Married", "It's complicated"] },
  { kind: "partnerName" },
  { kind: "choice", key: "focus", question: "What chapter of your life are you in right now?", options: [
    "Finding clarity around money and direction",
    "Healing or deepening a relationship",
    "Understanding who I actually am, underneath it all",
  ] },
  { kind: "choice", key: "anxiety", question: "When a big decision is in front of you, what's your honest pattern?", options: ["I second-guess myself for weeks", "I weigh it carefully, then move", "I trust my gut almost immediately"] },
  { kind: "milestone", n: 1 },
  { kind: "did_you_know", variant: 1 },
  { kind: "slider", key: "financialStress", question: "How does money sit with you these days?", minLabel: "At ease", maxLabel: "Heavy on my mind" },
  { kind: "slider", key: "energy", question: "How full is your tank, most days?", minLabel: "Running on empty", maxLabel: "Genuinely energized" },
  { kind: "slider", key: "purpose", question: "How close do you feel to the life that actually fits you?", minLabel: "Still searching", maxLabel: "Right where I should be" },
  { kind: "choice", key: "block", question: "If something is in your way right now, what is it really?", options: [
    "Doubting myself before I start", "Low energy, even when I want to act", "Being surrounded by the wrong people or place", "Something I can't quite name",
  ] },
  { kind: "choice", key: "uphill", question: "Have you ever felt like you're capable of more than the life you're currently living?", options: [
    "Often — it's a quiet, constant feeling.",
    "Sometimes, mostly around money.",
    "Not really — things tend to flow.",
  ] },
  { kind: "before_after" },
  { kind: "milestone", n: 2 },
  { kind: "choice", key: "finHabit", question: "When money surprises you — good or bad — what's your first reaction?", options: ["I freeze for a moment", "I go straight to the numbers", "I let it sit before I deal with it"] },
  { kind: "choice", key: "signs", question: "Do you often notice repeating numbers (like 11:11, 222, 777) on clocks, licenses, or receipts?", options: ["Yes, constantly", "Rarely", "Never noticed"] },
  { kind: "choice", key: "fear", question: "When you imagine your next chapter, what feeling shows up first?", options: ["A quiet worry about money", "A fear of ending up alone", "A feeling that I'm wasting something in me"] },
  { kind: "choice", key: "focusEase", question: "When you set your sights on something big, how often does life pull you off course?", options: ["Very easily, I lose momentum", "Only when things get really hard", "Rarely — I tend to stay the course"] },
  { kind: "choice", key: "empathy", question: "Do other people's moods tend to become your moods?", options: ["Yes, almost always", "Sometimes, depending who", "Not really — I stay separate"] },
  { kind: "testimonial" },
  { kind: "choice", key: "intuition", question: "How often does your first gut feeling about a person or decision prove to be right?", options: ["Almost 100% of the time", "50/50", "I rarely listen to my gut"] },
  { kind: "choice", key: "lastHappy", question: "When did you last feel completely, unmistakably yourself?", options: ["Recently", "It's been a while", "Honestly, I'm not sure"] },
  { kind: "choice", key: "readiness", question: "If your book tells you something you didn't expect, what would you do with it?", options: ["Sit with it, then act", "Think it over first", "I'm just here out of curiosity"] },
  { kind: "choice", key: "occupation", question: "What is your current occupational status?", options: ["9-to-5 Employee", "Freelancer / Creator", "Business Owner", "Unemployed / Transitioning"] },
  { kind: "choice", key: "precision", question: "Which part of your book matters most to you right now?", options: [
    "The exact timing of what's coming next",
    "How compatible I really am with someone specific",
    "What's been quietly blocking me, and why",
  ] },
  { kind: "choice", key: "karma", question: "Do you believe that patterns from your past or family lineage are holding you back?", options: ["Yes, definitely", "No, I don't think so", "I want my book to show me"] },
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
  1: { image: ms1, eyebrow: "Milestone", title: "Your Life Path is taking shape.", body: "Based on your birth date, a clear pattern is already emerging — the kind most people never get named for them. Let's see what's shaping it.", cta: "Continue →" },
  2: { image: ms2, eyebrow: "Milestone", title: "That's not a flaw — it's a pattern.", body: "What you just described has a name in your chart. A few more questions, and we'll know exactly which one.", cta: "Continue →" },
  3: { image: ms3, eyebrow: "Milestone", title: "Your book is two-thirds written.", body: "What you've shared so far points to a real turning point in your numbers — not vague, a specific one. Worth seeing clearly.", cta: "Continue →" },
  4: { image: ms4, eyebrow: "Milestone", title: "The hard part's done.", body: "Everything we need is here. Let's put your name on the cover.", cta: "See my book →" },
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
  const [birthTime, setBirthTime] = useState<string | undefined>();
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);
  const [birthPlace, setBirthPlace] = useState<GeoPoint | undefined>();
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
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col quiz-paper">
      {showHeader && (
        <header className="sticky top-0 z-20 bg-[color:var(--paper)]/95 px-5 pb-3 pt-4 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={back}
              className="flex h-9 w-9 items-center justify-center text-[color:var(--paper-muted)] hover:text-[color:var(--navy)]"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="font-[family-name:var(--font-serif-display)] text-[13px] font-bold tracking-wide text-[color:var(--navy)]">Astrelo</p>
            <div className="h-9 w-9" />
          </div>
          <ProgressBar value={progress} />
        </header>
      )}

      <main className="flex flex-1 flex-col px-5 pb-8 pt-6">

        {step.kind === "hero" && <Hero onContinue={next} />}

        {step.kind === "dob" && (
          <div className="quiz-fade-in space-y-7">
            <div>
              <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--violet)] mb-2">A few specifics</p>
              <h2 className="font-[family-name:var(--font-serif-display)] text-[24px] font-extrabold leading-tight text-[color:var(--navy)]">When were you born?</h2>
              <p className="mt-2 font-[family-name:var(--font-serif-body)] text-[14px] text-[color:var(--paper-muted)]">This is the seed your whole chart grows from.</p>
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
              className="flex w-full items-center justify-center gap-2 bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)] transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step.kind === "birthTime" && (
          <div className="quiz-fade-in space-y-7">
            <div>
              <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--violet)] mb-2">A few specifics</p>
              <h2 className="font-[family-name:var(--font-serif-display)] text-[24px] font-extrabold leading-tight text-[color:var(--navy)]">What time were you born?</h2>
              <p className="mt-2 font-[family-name:var(--font-serif-body)] text-[14px] text-[color:var(--paper-muted)]">This pins the exact sky over you the moment you arrived.</p>
            </div>
            <TimeOfBirthPicker
              value={birthTime}
              unknown={birthTimeUnknown}
              onChange={setBirthTime}
              onToggleUnknown={() => setBirthTimeUnknown((u) => !u)}
            />
            <button
              onClick={() => {
                const time = birthTimeUnknown ? "12:00" : (birthTime ?? "12:00");
                setAnswers((a) => ({ ...a, birthTime: time, birthTimeUnknown }));
                trackAnswer("birth_time", birthTimeUnknown ? "unknown" : time);
                next();
              }}
              className="flex w-full items-center justify-center gap-2 bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)] transition-all"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step.kind === "birthPlace" && (
          <div className="quiz-fade-in space-y-7">
            <div>
              <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--violet)] mb-2">Almost there</p>
              <h2 className="font-[family-name:var(--font-serif-display)] text-[24px] font-extrabold leading-tight text-[color:var(--navy)]">Where were you born?</h2>
              <p className="mt-2 font-[family-name:var(--font-serif-body)] text-[14px] text-[color:var(--paper-muted)]">City is enough — we'll find the rest.</p>
            </div>
            <PlaceSearch value={birthPlace} onChange={setBirthPlace} />
            <button
              disabled={!birthPlace}
              onClick={() => {
                if (birthPlace) {
                  setAnswers((a) => ({ ...a, birthPlace }));
                  trackAnswer("birth_place", birthPlace.name);
                  next();
                }
              }}
              className="flex w-full items-center justify-center gap-2 bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)] transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
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
            title="Where should we send your book?"
            sub="Your book will be emailed once it's ready."
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
          <div className="quiz-fade-in space-y-6">
            <div>
              <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--violet)] mb-2">Optional</p>
              <h2 className="font-[family-name:var(--font-serif-display)] text-[24px] font-extrabold leading-tight text-[color:var(--navy)]">What is your partner's name?</h2>
              <p className="mt-2 font-[family-name:var(--font-serif-body)] text-[14px] text-[color:var(--paper-muted)]">Used to write your Love Compatibility chapter.</p>
            </div>
            <input
              type="text"
              value={partnerNameInput}
              onChange={(e) => setPartnerNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setAnswers((a) => ({ ...a, partnerName: partnerNameInput.trim() || undefined })); next(); } }}
              placeholder="e.g. Alex"
              className="h-12 w-full border-b border-[color:var(--paper-ink)]/20 bg-transparent px-1 text-[15px] font-[family-name:var(--font-serif-body)] italic outline-none transition-colors focus:border-[color:var(--violet)]"
            />
            <button
              onClick={() => { setAnswers((a) => ({ ...a, partnerName: partnerNameInput.trim() || undefined })); next(); }}
              className="flex w-full items-center justify-center gap-2 bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)]"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={next} className="w-full text-center font-[family-name:var(--font-sans)] text-[12.5px] text-[color:var(--paper-muted)] underline">
              Skip — write it without a partner name
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

        {step.kind === "barnum_reveal" && answers.dob && (
          <BookPreview
            name={answers.name || "you"}
            dob={answers.dob}
            paragraph={teaserParagraph}
            onContinue={next}
          />
        )}

        {step.kind === "paywall" && answers.dob && (
          <Paywall
            name={answers.name || "you"}
            dob={answers.dob}
            email={answers.email || emailInput}
            partnerName={answers.partnerName as string | undefined}
            birthTime={answers.birthTime as string | undefined}
            birthTimeUnknown={answers.birthTimeUnknown as boolean | undefined}
            birthPlace={answers.birthPlace as GeoPoint | undefined}
            quizToken={quizToken}
          />
        )}


      </main>
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="quiz-fade-in flex flex-col">
      <div className="mx-auto mt-2 mb-5 flex items-center gap-2 border border-[color:var(--gold)]/40 px-4 py-1.5 font-[family-name:var(--font-sans)] text-[10.5px] font-bold uppercase tracking-widest text-[color:var(--navy)]">
        <Star className="h-3 w-3 fill-[color:var(--gold)] text-[color:var(--gold)]" /> 2,300+ people have read theirs
      </div>
      <div className="relative mx-auto mb-7 aspect-square w-full max-w-[320px] overflow-hidden border border-[color:var(--paper-ink)]/15">
        <img src={heroImg} alt="Discover what your numbers mean" className="h-full w-full object-cover grayscale-[10%]" />
      </div>
      <h1 className="text-center font-[family-name:var(--font-serif-display)] text-[26px] font-extrabold leading-tight text-[color:var(--navy)]">
        Your Personal Astrology Book — Written From Your Birth Date
      </h1>
      <p className="mt-3 text-center font-[family-name:var(--font-serif-body)] text-[14px] leading-relaxed text-[color:var(--paper-muted)]">
        A short quiz, then a real chapter written for you — free to read before you decide.
      </p>
      <button
        onClick={onContinue}
        className="mt-7 flex w-full items-center justify-center gap-2 bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)] transition-all"
      >
        Begin My Book <ArrowRight className="h-4 w-4" />
      </button>
      <div className="mt-4 grid grid-cols-2 gap-2 font-[family-name:var(--font-sans)] text-[11px]">
        <div className="flex items-center justify-center gap-1.5 border border-[color:var(--paper-ink)]/15 px-3 py-2 font-medium text-[color:var(--paper-muted)]">
          <Sparkles className="h-3 w-3 text-[color:var(--violet)]" /> 2-min quiz
        </div>
        <div className="flex items-center justify-center gap-1.5 border border-[color:var(--paper-ink)]/15 px-3 py-2 font-medium text-[color:var(--paper-muted)]">
          <Star className="h-3 w-3 fill-[color:var(--gold)] text-[color:var(--gold)]" /> Rated 4.8 / 5
        </div>
      </div>
      <p className="mt-4 text-center font-[family-name:var(--font-sans)] text-[10px] text-[color:var(--paper-muted)]">
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
    <div className="quiz-fade-in flex min-h-[80vh] flex-col items-center justify-center space-y-7 text-center">
      <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--violet)]">Your First Number</p>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center border border-[color:var(--violet)]/30 px-6 py-4">
          <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-wider text-[color:var(--paper-muted)]">Life Path</p>
          <p className="font-[family-name:var(--font-serif-display)] text-5xl font-extrabold text-[color:var(--navy)]">{lp}</p>
        </div>
        <div className="font-[family-name:var(--font-serif-display)] text-3xl text-[color:var(--paper-muted)]">·</div>
        <div className="flex flex-col items-center border border-[color:var(--gold)]/50 px-6 py-4">
          <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-wider text-[color:var(--paper-muted)]">Zodiac</p>
          <p className="font-[family-name:var(--font-serif-display)] text-lg font-bold text-[color:var(--navy)]">{zodiac}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-3xl">{label.emoji}</p>
        <h2 className="font-[family-name:var(--font-serif-display)] text-2xl font-extrabold text-[color:var(--navy)]">{label.title}</h2>
        <p className="mx-auto max-w-xs font-[family-name:var(--font-serif-body)] text-[14px] leading-relaxed text-[color:var(--paper-muted)]">{label.tagline}</p>
      </div>
      <div className="w-full bg-[color:var(--violet)]/8 px-5 py-3 font-[family-name:var(--font-serif-body)] italic text-[12.5px] text-[color:var(--violet)]">
        Only 1 in 12 people share this Life Path. There's a lot more your numbers haven't told you yet.
      </div>
      <button
        onClick={onContinue}
        className="w-full bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)]"
      >
        Keep Going →
      </button>
    </div>
  );
}

// ─── Gender View (visual cards) ───────────────────────────────────────────────
function GenderView({ value, onSelect }: { value: string | undefined; onSelect: (v: string) => void }) {
  return (
    <div className="quiz-fade-in space-y-6">
      <h2 className="font-[family-name:var(--font-serif-display)] text-[24px] font-extrabold leading-tight text-[color:var(--navy)]">Let's start with the basics.</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Female", tint: "oklch(0.62 0.25 340 / .12)" },
          { label: "Male", tint: "oklch(0.55 0.22 295 / .12)" },
        ].map(({ label, tint }) => (
          <button
            key={label}
            onClick={() => onSelect(label)}
            className={`overflow-hidden border transition-all ${value === label ? "border-[color:var(--violet)]" : "border-[color:var(--paper-ink)]/15"}`}
          >
            <div className="flex h-32 items-center justify-center font-[family-name:var(--font-serif-display)] text-3xl text-[color:var(--navy)]" style={{ background: tint }}>
              {label[0]}
            </div>
            <div className="py-2.5 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--navy)]">{label}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => onSelect("Non-binary")}
        className={`w-full border py-3 font-[family-name:var(--font-sans)] text-[13px] font-medium transition-all ${value === "Non-binary" ? "border-[color:var(--violet)] bg-[color:var(--violet)]/8 text-[color:var(--violet)]" : "border-[color:var(--paper-ink)]/15 text-[color:var(--paper-muted)]"}`}
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
    fact: "of people say their hardest financial seasons lined up with a specific cycle in hindsight.",
    detail: "Your book names your cycle — and roughly when the pattern breaks.",
    emoji: "💰",
  },
  2: {
    stat: "2×",
    fact: "Easier decisions, by their own account, once people understood their core numbers.",
    detail: "Not because numerology tells you what to do — because you finally see why you keep choosing the same thing.",
    emoji: "🧭",
  },
};

function DidYouKnowView({ variant, focus, onContinue }: { variant: 1 | 2; focus: string; onContinue: () => void }) {
  const data = DID_YOU_KNOW[variant];
  return (
    <div className="quiz-fade-in flex flex-col space-y-7">
      <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-widest text-[color:var(--violet)]">Did you know?</p>
      <div className="border border-[color:var(--paper-ink)]/15 p-6 space-y-3">
        <div className="font-[family-name:var(--font-serif-display)] text-5xl font-black text-[color:var(--navy)]">{data.stat}</div>
        <p className="font-[family-name:var(--font-serif-body)] text-[15px] font-semibold text-[color:var(--navy)] leading-snug">{data.fact}</p>
        <p className="font-[family-name:var(--font-serif-body)] text-[13.5px] text-[color:var(--paper-muted)] leading-relaxed">{data.detail}</p>
      </div>
      <button
        onClick={onContinue}
        className="w-full bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)] flex items-center justify-center gap-2"
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
    <div className="quiz-fade-in space-y-6">
      <h2 className="font-[family-name:var(--font-serif-display)] text-[24px] font-extrabold leading-tight text-[color:var(--navy)]">What Changes, Once You Know</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-[color:var(--paper-ink)]/15 p-4 space-y-2">
          <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-wider text-[color:var(--paper-muted)]">Before</p>
          {beforeItems.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--paper-muted)]" />
              <p className="font-[family-name:var(--font-serif-body)] text-[11.5px] text-[color:var(--paper-muted)] leading-snug">{item}</p>
            </div>
          ))}
        </div>
        <div className="border border-[color:var(--gold)]/40 p-4 space-y-2">
          <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-wider text-[color:var(--violet)]">After</p>
          {afterItems.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--violet)]" />
              <p className="font-[family-name:var(--font-serif-body)] text-[11.5px] text-[color:var(--navy)] leading-snug">{item}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center font-[family-name:var(--font-serif-body)] italic text-[12.5px] text-[color:var(--paper-muted)]">Your book was written to show you the way from left to right — with specific patterns, not vague advice.</p>
      <button
        onClick={onContinue}
        className="w-full bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)] flex items-center justify-center gap-2"
      >
        I want this <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Testimonial ─────────────────────────────────────────────────────────────
function TestimonialView({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="quiz-fade-in space-y-7">
      <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-widest text-[color:var(--violet)]">What others say</p>
      <div className="border border-[color:var(--paper-ink)]/15 p-6 space-y-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[color:var(--gold)] text-[color:var(--gold)]" />)}
        </div>
        <p className="font-[family-name:var(--font-serif-body)] text-[14px] leading-relaxed text-[color:var(--ink)]">
          "I've tried astrology apps and zodiac readings for years. This was different — the Life Path chapter described patterns I never told anyone about. The timing chapter was accurate within 2 weeks. It felt less like prediction and more like recognition."
        </p>
        <p className="font-[family-name:var(--font-sans)] text-[11px] font-bold text-[color:var(--paper-muted)]">— Rachel M., 34 · Verified purchase</p>
      </div>
      <div className="border border-[color:var(--paper-ink)]/15 p-6 space-y-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[color:var(--gold)] text-[color:var(--gold)]" />)}
        </div>
        <p className="font-[family-name:var(--font-serif-body)] text-[14px] leading-relaxed text-[color:var(--ink)]">
          "The Karmic Architecture chapter described my relationship pattern so precisely I had to re-read it three times. I've been on my own 'self-improvement journey' for 5 years — this cut through everything in 10 minutes."
        </p>
        <p className="font-[family-name:var(--font-sans)] text-[11px] font-bold text-[color:var(--paper-muted)]">— James K., 41 · Verified purchase</p>
      </div>
      <button
        onClick={onContinue}
        className="w-full bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)] flex items-center justify-center gap-2"
      >
        Continue <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Choice View ──────────────────────────────────────────────────────────────
function ChoiceView({ step, value, onSelect }: { step: ChoiceStep; value: string | undefined; onSelect: (v: string) => void }) {
  return (
    <div className="quiz-fade-in space-y-2">
      <h2 className="font-[family-name:var(--font-serif-display)] text-[24px] font-extrabold leading-tight text-[color:var(--navy)] mb-6">{step.question}</h2>
      <div>
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
    <div className="quiz-fade-in space-y-9">
      <h2 className="font-[family-name:var(--font-serif-display)] text-[24px] font-extrabold leading-tight text-[color:var(--navy)]">{step.question}</h2>
      <StressSlider minLabel={step.minLabel} maxLabel={step.maxLabel} initial={5} onChange={setV} />
      <button
        onClick={() => onConfirm(v)}
        className="flex w-full items-center justify-center gap-2 bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)]"
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
    <div className="quiz-fade-in space-y-6">
      <h2 className="font-[family-name:var(--font-serif-display)] text-[24px] font-extrabold leading-tight text-[color:var(--navy)]">{title}</h2>
      {sub && <p className="font-[family-name:var(--font-serif-body)] text-[14px] text-[color:var(--paper-muted)]">{sub}</p>}
      <input
        type={type}
        value={value}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        placeholder={placeholder}
        aria-label={title}
        className="h-12 w-full border-b border-[color:var(--paper-ink)]/20 bg-transparent px-1 text-[15px] font-[family-name:var(--font-serif-body)] italic outline-none transition-colors focus:border-[color:var(--violet)]"
      />
      <button
        onClick={onSubmit}
        className="flex w-full items-center justify-center gap-2 bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)]"
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
