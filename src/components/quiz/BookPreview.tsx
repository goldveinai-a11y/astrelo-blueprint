import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Camera, Check, Sparkles } from "lucide-react";
import { lifePath, expressionNumber, zodiacSign, type DOB } from "@/lib/quiz/numerology";
import chapterIllustration from "@/assets/quiz/chapter-illustration-1.jpg";
import palmIllustration from "@/assets/quiz/palm-illustration.jpg";

type Props = {
  name: string;
  dob: DOB;
  paragraph: string | null;
  onContinue: () => void;
};

// ─── Copy ────────────────────────────────────────────────────────────────
const LP_TITLE: Record<number, string> = {
  1: "The Pioneer", 2: "The Diplomat", 3: "The Voice", 4: "The Builder",
  5: "The Free Spirit", 6: "The Nurturer", 7: "The Seeker", 8: "The Architect",
  9: "The Humanitarian", 11: "The Illuminator", 22: "The Master Builder", 33: "The Teacher",
};

const LP_ESSENCE: Record<number, string> = {
  1: "You came in to lead, not to follow. Your blueprint is wired for original thought, independent action, and breaking ground where others still hesitate.",
  2: "You came in to hold what others cannot. Your gift is the quiet architecture of trust — you make it safe for people to become themselves.",
  3: "You came in with a voice. Not to fill silence, but to name what everyone else feels and cannot say out loud.",
  4: "You came in to build what lasts. Every foundation you set right becomes something a whole line of people will stand on.",
  5: "You came in to move. Freedom is not your escape — it is the direction your soul was pointed in before you were born.",
  6: "You came in to care — but on your terms. The ones you love are watching how you carry yourself, more than what you say.",
  7: "You came in to know. The quiet is not where your life pauses. It is where your real work actually begins.",
  8: "You came in with weight to move. Ambition is not a flaw in your design — it is the instrument you were handed.",
  9: "You came in for the whole room, not just yourself. Your life was never only about you — and part of you has always known.",
  11: "You came in to see. You catch the pattern before others admit it exists — and that early sight is both your gift and your burden.",
  22: "You came in to build something that outlives you. The scale of your calling is not accidental — and neither is the fear that comes with it.",
  33: "You came in to teach without speaking. Your presence recalibrates rooms; your example moves people your words never could.",
};

const LP_STRENGTHS: Record<number, string[]> = {
  1: ["Initiative", "Self-reliance", "Decisiveness", "Innovation"],
  2: ["Diplomacy", "Empathy", "Patience", "Partnership"],
  3: ["Expression", "Charisma", "Creativity", "Optimism"],
  4: ["Discipline", "Loyalty", "Precision", "Endurance"],
  5: ["Adaptability", "Curiosity", "Magnetism", "Courage"],
  6: ["Devotion", "Responsibility", "Warmth", "Craft"],
  7: ["Insight", "Depth", "Analysis", "Discernment"],
  8: ["Authority", "Vision", "Ambition", "Resilience"],
  9: ["Compassion", "Wisdom", "Idealism", "Generosity"],
  11: ["Intuition", "Vision", "Inspiration", "Sensitivity"],
  22: ["Mastery", "Scale", "Discipline", "Legacy"],
  33: ["Presence", "Teaching", "Compassion", "Influence"],
};

const LP_SHADOWS: Record<number, string[]> = {
  1: ["Stubbornness", "Isolation", "Impatience with weakness"],
  2: ["Over-giving", "Avoiding conflict", "Losing yourself in others"],
  3: ["Scattered focus", "Performing instead of feeling", "Fear of being unseen"],
  4: ["Rigidity", "Overwork", "Postponing joy"],
  5: ["Restlessness", "Escapism", "Fear of commitment"],
  6: ["Martyrdom", "Control disguised as care", "Resentment"],
  7: ["Withdrawal", "Cynicism", "Emotional distance"],
  8: ["Workaholism", "Control", "Confusing worth with output"],
  9: ["Old grief", "Saving people who didn't ask", "Emotional exhaustion"],
  11: ["Anxiety", "Self-doubt", "Sensory overwhelm"],
  22: ["Fear of your own scale", "Perfectionism", "Isolation at the top"],
  33: ["Over-responsibility", "Losing yourself in service", "Ignoring your own needs"],
};

const LP_MOVE: Record<number, string> = {
  1: "When you doubt yourself you stall — and stalling is the one thing your number cannot tolerate. Move first, refine later.",
  2: "Stop apologizing for the space you take up. Your presence is not the problem — your absence is what breaks the room.",
  3: "Say the thing. Not eventually. Now. Your voice loses power every day you keep it small.",
  4: "You do not need permission to rest. The structure you built will hold without you standing on it.",
  5: "Choose one door. Freedom you never walk through is just a photograph of freedom.",
  6: "The person you keep saving didn't ask. Save the version of you they've been watching disappear.",
  7: "Come out of the tower. What you've learned is only real once someone else can use it.",
  8: "Loosen the grip. The money follows you — it doesn't need to be chased into submission.",
  9: "Put down what wasn't yours. Some of the grief you carry belongs to someone who is already gone.",
  11: "Trust the first signal, not the fifth. Your intuition is not asking you to be certain — only to move.",
  22: "You are not too much. The scale of what you're building is exactly the scale you were built for.",
  33: "You do not have to earn your worth by serving. Your presence alone is already the lesson.",
};

const LP_CLIFF: Record<number, string> = {
  1: "But there is a specific reason you keep starting alone. Chapter 2 names it.",
  2: "There is a pattern in how people take from you — and it has a number. Chapter 2 names it.",
  3: "The one thing you keep avoiding saying — Chapter 2 says it for you.",
  4: "You are building on top of something that was never resolved. Chapter 2 opens it.",
  5: "Your restlessness is not random. Chapter 2 shows the exact year it started.",
  6: "You keep saving someone who was never yours to save. Chapter 2 explains who — and why.",
  7: "The question you refuse to ask yourself — Chapter 2 asks it out loud.",
  8: "Your relationship with money is inherited. Chapter 2 traces where it came from.",
  9: "You are carrying something that does not belong to you. Chapter 2 names its owner.",
  11: "Your intuition has been pointing at one person for months. Chapter 2 names them.",
  22: "The scale you're built for scares you. Chapter 2 shows why — and when it lifts.",
  33: "Your influence is already reshaping someone. Chapter 2 shows who — and how.",
};

// TOC — personalized, no locks, no "coming soon" clutter
type TOCItem = { n: string; title: (name: string) => string; sub: string };
const TOC: TOCItem[] = [
  { n: "01", title: () => "Life Path", sub: "The pattern already running under everything you do" },
  { n: "02", title: (n) => `Expression — how ${n || "you"} arrive`, sub: "The version of you the world is built to see" },
  { n: "03", title: () => "Soul Urge", sub: "What you keep choosing — and why" },
  { n: "04", title: () => "Personality", sub: "The first read people take on you" },
  { n: "05", title: (n) => `Birth Day gift for ${n || "you"}`, sub: "The single talent you were born already holding" },
  { n: "06", title: () => "Karmic Debt", sub: "The bill your line kept postponing — until you" },
  { n: "07", title: () => "Karmic Lessons", sub: "The lessons your name keeps returning to" },
  { n: "08", title: (n) => `Maturity — who ${n || "you"} become after 35`, sub: "The second version of your life, dated" },
  { n: "09", title: () => "Pinnacles", sub: "The four seasons of your life — with exact years" },
  { n: "10", title: () => "Challenges", sub: "The specific friction each season is built to teach" },
  { n: "11", title: () => "Palm Reading", sub: "The layer your numbers cannot reach" },
  { n: "12", title: (n) => `${n || "Your"} Personal Year`, sub: "What this exact year is really about for you" },
  { n: "13", title: () => "90-Day Windows", sub: "The dates when action lands twice as hard" },
  { n: "14", title: () => "Compatibility Map", sub: "The numbers that clash with you — and the one that fits" },
  { n: "15", title: (n) => `A letter — to ${n || "you"}`, sub: "One page, written only for the person you are becoming" },
];

// ─── Scroll-snap hook ────────────────────────────────────────────────────
function useScrollSnap(total: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const goTo = useCallback((n: number) => {
    const el = ref.current;
    if (!el) return;
    const target = Math.max(0, Math.min(total - 1, n));
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  }, [total]);

  const next = useCallback(() => goTo(idx + 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / el.clientWidth);
        setIdx(i);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return { ref, idx, goTo, next, prev };
}

// ─── Page shell ──────────────────────────────────────────────────────────
function Page({ children, bg = "paper" }: { children: React.ReactNode; bg?: "paper" | "navy" | "cosmic" }) {
  const bgClass =
    bg === "navy" ? "bg-[#0f1730] text-white"
    : bg === "cosmic" ? "bg-[radial-gradient(ellipse_at_center,#2a1f5a_0%,#0f1730_75%)] text-white"
    : "bg-[color:var(--paper)] text-[color:var(--paper-ink)]";
  return (
    <div className={`h-full w-full shrink-0 snap-start snap-always overflow-y-auto ${bgClass}`} style={{ scrollSnapAlign: "start" }}>
      <div className="flex min-h-full flex-col">{children}</div>
    </div>
  );
}

function Chrome({ label, pill }: { label: string; pill?: string }) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-2 font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--paper-muted)]">
      <span>{label}</span>
      {pill && <span className="rounded-full bg-[color:var(--violet)]/10 px-2.5 py-1 text-[9px] text-[color:var(--violet)]">{pill}</span>}
    </div>
  );
}

// ─── Screens ─────────────────────────────────────────────────────────────
function Cover({ name, dob, lp }: { name: string; dob: DOB; lp: number }) {
  const dobStr = new Date(dob.year, dob.month - 1, dob.day)
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const displayName = (name || "you").toUpperCase();
  return (
    <Page bg="cosmic">
      <div className="flex flex-1 flex-col items-center justify-between px-8 py-12 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[11px] font-bold uppercase tracking-[0.35em] text-[color:var(--gold)]/85">
          Astrelo
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-44 w-44 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[color:var(--gold)]/60" />
            <div className="absolute inset-3 rounded-full border border-[color:var(--gold)]/20" />
            <span
              className="font-[family-name:var(--font-serif-display)] font-black leading-none text-[color:var(--gold)]"
              style={{
                fontSize: 96,
                textShadow: "0 0 32px oklch(0.82 0.16 85 / 0.55)",
                // Optical centering — serif numerals sit low on the baseline
                transform: "translateY(-4px)",
              }}
            >
              {lp}
            </span>
          </div>
          <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">
            Life Path Number
          </p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="font-[family-name:var(--font-serif-display)] text-[22px] font-extrabold tracking-wide text-white">
            {displayName}
          </p>
          <p className="font-[family-name:var(--font-sans)] text-[10.5px] uppercase tracking-[0.18em] text-white/55">
            {dobStr}
          </p>
          <div className="mt-6 h-px w-16 bg-white/15" />
          <p className="mt-3 font-[family-name:var(--font-serif-body)] text-[11.5px] italic text-white/55">
            Your Numerology Blueprint · Free Sample
          </p>
        </div>

        <p className="font-[family-name:var(--font-sans)] text-[10.5px] uppercase tracking-[0.22em] text-white/40">
          swipe to read →
        </p>
      </div>
    </Page>
  );
}

function NarrativePage({ name, lp, paragraph }: { name: string; lp: number; paragraph: string }) {
  const title = LP_TITLE[lp] ?? "Your Blueprint";
  return (
    <Page>
      <Chrome label={`Chapter 1 · Life Path ${lp}`} pill="Sample" />
      <div className="flex-1 px-7 pb-8 pt-2">
        <h1 className="mb-4 font-[family-name:var(--font-serif-display)] text-[30px] font-black leading-[1.05] text-[color:var(--navy)]">
          {title}
        </h1>
        <p className="mb-5 font-[family-name:var(--font-sans)] text-[11px] font-semibold uppercase tracking-[0.15em] text-[color:var(--violet)]">
          For {name || "you"}
        </p>
        <p className="font-[family-name:var(--font-serif-body)] text-[15.5px] leading-[1.72] text-[color:var(--paper-ink)]">
          {paragraph}
        </p>
      </div>
    </Page>
  );
}

function IllustrationPage({ lp }: { lp: number }) {
  return (
    <Page bg="navy">
      <div className="relative flex-1 overflow-hidden">
        <img
          src={chapterIllustration}
          alt=""
          loading="lazy"
          width={960}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-[#0f1730]/60 to-[#0f1730]" />
        <div className="absolute inset-x-0 bottom-0 px-8 pb-10">
          <p className="mx-auto max-w-[26ch] text-center font-[family-name:var(--font-serif-display)] text-[18px] italic leading-[1.35] text-[color:var(--gold)]">
            "Numbers are the oldest language pattern ever spoke into being — and yours is Life Path {lp}."
          </p>
        </div>
      </div>
    </Page>
  );
}

function EssencePage({ lp }: { lp: number }) {
  const essence = LP_ESSENCE[lp] ?? LP_ESSENCE[1];
  const strengths = LP_STRENGTHS[lp] ?? LP_STRENGTHS[1];
  const shadows = LP_SHADOWS[lp] ?? LP_SHADOWS[1];
  const move = LP_MOVE[lp] ?? LP_MOVE[1];
  return (
    <Page>
      <Chrome label={`Chapter 1 · Life Path ${lp}`} pill="Sample" />
      <div className="flex-1 px-7 pb-8 pt-2">
        <p className="mb-6 font-[family-name:var(--font-serif-display)] text-[19px] italic leading-[1.4] text-[color:var(--navy-soft)]">
          <span className="text-[color:var(--gold)]">“</span>{essence}<span className="text-[color:var(--gold)]">”</span>
        </p>

        <p className="mb-2 font-[family-name:var(--font-sans)] text-[10.5px] font-bold uppercase tracking-[0.16em] text-[color:var(--violet)]">
          Your strengths
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          {strengths.map((s) => (
            <span key={s} className="rounded-full border border-[color:var(--violet)]/35 bg-[color:var(--violet)]/6 px-3 py-1.5 text-[12px] font-semibold text-[color:var(--navy)]">
              {s}
            </span>
          ))}
        </div>

        <p className="mb-2 font-[family-name:var(--font-sans)] text-[10.5px] font-bold uppercase tracking-[0.16em] text-[color:var(--violet)]">
          Where it gets in your way
        </p>
        <ul className="mb-6 space-y-1.5">
          {shadows.map((s) => (
            <li key={s} className="relative pl-4 font-[family-name:var(--font-serif-body)] text-[15px] leading-relaxed text-[color:var(--paper-ink)]">
              <span className="absolute left-0 top-0 text-[color:var(--paper-muted)]">–</span>{s}
            </li>
          ))}
        </ul>

        <p className="mb-2 font-[family-name:var(--font-sans)] text-[10.5px] font-bold uppercase tracking-[0.16em] text-[color:var(--violet)]">
          Your move
        </p>
        <div className="rounded-r-lg border-l-[3px] border-[color:var(--gold)] bg-[color:var(--gold)]/8 p-4">
          <p className="font-[family-name:var(--font-serif-body)] text-[14.5px] italic leading-relaxed text-[color:var(--navy)]">
            “{move}”
          </p>
        </div>
      </div>
    </Page>
  );
}

function ChapterCloseHook({ name, lp, ex }: { name: string; lp: number; ex: number }) {
  const cliff = LP_CLIFF[lp] ?? LP_CLIFF[1];
  return (
    <Page>
      <Chrome label={`Chapter 1 · Life Path ${lp}`} pill="End of sample" />
      <div className="flex-1 px-7 pb-8 pt-4">
        {/* Infographic — personal stat card */}
        <div className="mb-6 rounded-2xl bg-[color:var(--navy)] p-5 text-white">
          <p className="mb-4 text-center font-[family-name:var(--font-sans)] text-[9.5px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold)]/80">
            {(name || "You").toString().toUpperCase()} · CORE FRAME
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Life Path", value: lp },
              { label: "Expression", value: ex },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/[0.06] px-3 py-4 text-center">
                <p className="font-[family-name:var(--font-sans)] text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">
                  {s.label}
                </p>
                <p className="mt-1 font-[family-name:var(--font-serif-display)] text-[38px] font-black leading-none text-[color:var(--gold)]">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Chapters ready", v: "15" },
              { l: "Personal Year", v: (new Date().getFullYear() + lp) % 9 + 1 },
              { l: "Windows dated", v: "4" },
            ].map((s) => (
              <div key={s.l} className="border-t border-white/10 pt-3">
                <p className="font-[family-name:var(--font-serif-display)] text-[18px] font-black text-[color:var(--gold)]">{s.v}</p>
                <p className="mt-0.5 font-[family-name:var(--font-sans)] text-[8.5px] uppercase tracking-widest text-white/45">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cliffhanger */}
        <div className="rounded-2xl border border-[color:var(--gold)]/40 bg-[color:var(--paper-2)]/70 p-5">
          <p className="mb-2 flex items-center gap-2 font-[family-name:var(--font-sans)] text-[9.5px] font-bold uppercase tracking-[0.22em] text-[color:var(--violet)]">
            <Sparkles className="h-3.5 w-3.5" /> What Chapter 2 opens
          </p>
          <p className="font-[family-name:var(--font-serif-display)] text-[19px] font-bold italic leading-[1.3] text-[color:var(--navy)]">
            {cliff}
          </p>
          <p className="mt-3 font-[family-name:var(--font-serif-body)] text-[13px] italic leading-relaxed text-[color:var(--paper-muted)]">
            The next 14 chapters are already written for {name || "you"} — waiting behind one page.
          </p>
        </div>
      </div>
    </Page>
  );
}

function PalmScanPage({ onCaptured }: { onCaptured: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [capturing, setCapturing] = useState(false);
  return (
    <Page bg="navy">
      <div className="relative flex-1">
        <img
          src={palmIllustration}
          alt=""
          loading="lazy"
          width={960}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1730]/40 via-[#0f1730]/70 to-[#0f1730]" />

        <div className="relative flex min-h-full flex-col items-center justify-between px-7 pb-10 pt-10 text-center">
          <div>
            <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]/80">
              Chapter 11 · Preparation
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-serif-display)] text-[26px] font-extrabold leading-[1.1] text-white">
              One layer your numbers<br />can't reach
            </h2>
          </div>

          <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full border-2 border-dashed border-[color:var(--gold)]/60">
            <Camera className="h-14 w-14 text-[color:var(--gold)]/80" strokeWidth={1.4} />
          </div>

          <div className="space-y-4">
            <p className="mx-auto max-w-[30ch] font-[family-name:var(--font-serif-body)] text-[14px] leading-[1.55] text-white/80">
              Your numbers show <em>when</em> and <em>how</em> you move. Your palm shows what numbers cannot see — <em>resilience, timing, love lines</em> already written in.
            </p>
            <p className="mx-auto max-w-[28ch] font-[family-name:var(--font-sans)] text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold)]/80">
              Takes 10 seconds · decoded once your book unlocks
            </p>
            <div data-no-swipe>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setCapturing(true);
                    setTimeout(onCaptured, 700);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={capturing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--gold)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-black uppercase tracking-[0.16em] text-[color:var(--navy)] shadow-[0_10px_28px_oklch(0.82_0.16_85/.35)]"
              >
                <Camera className="h-4 w-4" /> {capturing ? "Capturing…" : "Scan my palm now"}
              </button>
              <button
                type="button"
                onClick={onCaptured}
                className="mt-3 w-full font-[family-name:var(--font-sans)] text-[11px] uppercase tracking-[0.22em] text-white/45 underline underline-offset-4"
              >
                Skip — I'll add it later
              </button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function ScanResultPage({ name }: { name: string }) {
  return (
    <Page bg="cosmic">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 py-14 text-center">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-[color:var(--gold)]/70">
          <div className="absolute inset-3 rounded-full border border-[color:var(--gold)]/25" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--gold)] text-[color:var(--navy)] shadow-[0_0_30px_oklch(0.82_0.16_85/.55)]">
            <Check className="h-7 w-7" strokeWidth={3} />
          </div>
        </div>

        <div>
          <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]/80">
            Palm captured
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-serif-display)] text-[28px] font-extrabold leading-tight text-white">
            {name || "Your"} scan is queued
          </h2>
          <p className="mx-auto mt-4 max-w-[30ch] font-[family-name:var(--font-serif-body)] text-[14px] leading-[1.6] text-white/70">
            Three dominant lines identified — heart, life, and head — plus a rare secondary marker on your Mount of Jupiter. Full decoding is written when your book unlocks.
          </p>
        </div>

        <div className="grid w-full max-w-[280px] grid-cols-3 gap-2 text-center">
          {[{l:"Heart",v:"Deep"},{l:"Life",v:"Long"},{l:"Head",v:"Split"}].map((s)=>(
            <div key={s.l} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="font-[family-name:var(--font-serif-display)] text-[15px] font-bold text-[color:var(--gold)]">{s.v}</p>
              <p className="mt-0.5 font-[family-name:var(--font-sans)] text-[9px] uppercase tracking-widest text-white/55">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

function TOCPage({ name }: { name: string }) {
  return (
    <Page>
      <Chrome label={`${name || "Your"} Numerology Blueprint`} pill="15 chapters" />
      <div className="flex-1 px-6 pb-8 pt-2">
        <h2 className="mb-1 font-[family-name:var(--font-serif-display)] text-[26px] font-black leading-tight text-[color:var(--navy)]">
          What's inside {name ? `${name}'s` : "your"} book
        </h2>
        <p className="mb-5 font-[family-name:var(--font-serif-body)] text-[13px] italic text-[color:var(--paper-muted)]">
          Written from your exact birth data · each chapter names you by name
        </p>
        <ol className="space-y-2.5">
          {TOC.map((c) => (
            <li key={c.n} className="flex items-start gap-3 border-b border-[color:var(--paper-ink)]/10 pb-2.5 last:border-b-0">
              <span className="mt-0.5 w-7 shrink-0 font-[family-name:var(--font-serif-display)] text-[13px] font-bold text-[color:var(--gold)]">
                {c.n}
              </span>
              <div className="flex-1">
                <p className="font-[family-name:var(--font-serif-display)] text-[14.5px] font-bold leading-tight text-[color:var(--navy)]">
                  {c.title(name)}
                </p>
                <p className="mt-0.5 font-[family-name:var(--font-serif-body)] text-[12.5px] italic leading-snug text-[color:var(--paper-muted)]">
                  {c.sub}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
}

// ─── Root component ─────────────────────────────────────────────────────
export function BookPreview({ name, dob, paragraph, onContinue }: Props) {
  const lp = useMemo(() => lifePath(dob), [dob]);
  const ex = useMemo(() => expressionNumber(name || "Astrelo"), [name]);
  const zodiac = zodiacSign(dob.month, dob.day);

  const narrativeText = useMemo(() => {
    const raw = (paragraph ?? "").trim();
    if (raw) return raw;
    return `${name || "You"}, born under your ${zodiac} sun with Life Path ${lp} — you carry yourself with the calm certainty of someone who already knows where the room is headed before anyone else speaks. People read that as confidence, sometimes as arrogance, but what's actually happening is faster: you've run the scenario three moves ahead and you're already standing where the conversation will end up. Underneath it sits a fear you'd never admit out loud — that stopping, even briefly, means falling behind. Your Expression number ${ex} complicates this in an interesting way: it gives your motion an intuitive, almost prophetic edge — you sense outcomes before the data confirms them, but the isolation that follows from leading alone runs deeper than you let on.`;
  }, [paragraph, name, lp, ex, zodiac]);

  const total = 9;
  const snap = useScrollSnap(total);

  return (
    <div className="quiz-fade-in -mx-5 -mt-6 flex min-h-[calc(100dvh-64px)] flex-col select-none">
      <div
        ref={snap.ref}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        <style>{`.book-scroller::-webkit-scrollbar{display:none}`}</style>
        <Cover name={name} dob={dob} lp={lp} />
        <NarrativePage name={name} lp={lp} paragraph={narrativeText} />
        <IllustrationPage lp={lp} />
        <EssencePage lp={lp} />
        <ChapterCloseHook name={name} lp={lp} ex={ex} />
        <PalmScanPage onCaptured={() => snap.goTo(6)} />
        <ScanResultPage name={name} />
        <TOCPage name={name} />
        {/* Screen 9 — hand-off to real Paywall via onContinue */}
        <Page bg="cosmic">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-14 text-center">
            <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]/80">
              Ready
            </p>
            <h2 className="font-[family-name:var(--font-serif-display)] text-[30px] font-extrabold leading-[1.1] text-white">
              Unlock {name ? `${name}'s` : "your"}<br />full Blueprint
            </h2>
            <p className="mx-auto max-w-[30ch] font-[family-name:var(--font-serif-body)] text-[14px] leading-[1.6] text-white/70">
              14 chapters · palm captured · dated windows · a closing letter written only for you.
            </p>
            <button
              onClick={onContinue}
              className="mt-2 flex w-full max-w-[300px] items-center justify-center gap-2 rounded-2xl bg-[color:var(--gold)] px-6 py-4 font-[family-name:var(--font-sans)] text-[13px] font-black uppercase tracking-[0.16em] text-[color:var(--navy)] shadow-[0_10px_28px_oklch(0.82_0.16_85/.35)]"
            >
              See my price <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Page>
      </div>

      {/* Page dots */}
      <div className="bg-[color:var(--paper)] px-5 py-4">
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to page ${i + 1}`}
              onClick={() => snap.goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === snap.idx ? "w-6 bg-[color:var(--navy)]" : "w-1.5 bg-[color:var(--paper-ink)]/25"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
