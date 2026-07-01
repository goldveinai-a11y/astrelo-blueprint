import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Camera, Check, Sparkles } from "lucide-react";
import { expressionNumber, lifePath, zodiacSign, type DOB } from "@/lib/quiz/numerology";
import chapterIllustration from "@/assets/quiz/chapter-illustration-1.jpg";
import palmIllustration from "@/assets/quiz/palm-illustration.jpg";

type Props = {
  name: string;
  dob: DOB;
  paragraph: string | null;
  onContinue: () => void;
};

const LP_TITLE: Record<number, string> = {
  1: "The Pioneer",
  2: "The Diplomat",
  3: "The Voice",
  4: "The Builder",
  5: "The Free Spirit",
  6: "The Nurturer",
  7: "The Seeker",
  8: "The Architect",
  9: "The Humanitarian",
  11: "The Illuminator",
  22: "The Master Builder",
  33: "The Teacher",
};

const LP_OPENING: Record<number, string> = {
  1: "You were not built to wait for a room to agree with you. Your number moves first, then proves itself through momentum.",
  2: "You notice the emotional weather before anyone admits the room has changed. That sensitivity is not weakness — it is your instrument.",
  3: "Your life becomes blocked when your voice gets edited down to what feels acceptable. The number 3 needs expression to stay alive.",
  4: "You carry the rare ability to make chaos usable. But when structure becomes armor, the same gift starts closing around you.",
  5: "Your soul studies life through motion. Repetition drains you only when it belongs to a life that was never shaped for you.",
  6: "People lean toward you because something in your field feels safe. The lesson is learning where devotion ends and self-erasure begins.",
  7: "You have always needed more depth than the surface could offer. Your solitude is not distance — it is where your knowing sharpens.",
  8: "Power, money, and impact are not side themes in your life. They are the curriculum your number keeps placing in front of you.",
  9: "You carry rooms inside you. The challenge is knowing which grief belongs to your heart — and which grief you inherited by standing too close.",
  11: "You sense the signal before the proof arrives. The hard part is trusting the first flash instead of negotiating it away.",
  22: "Your life keeps asking you to build at a scale that can scare even you. The pressure is not random; it is proportionate to the design.",
  33: "Your influence often works before your words do. People change around you, then call it timing. Your chart calls it presence.",
};

const LP_MOVE: Record<number, string> = {
  1: "Move first, refine later — but choose the move that belongs to you, not the one that simply proves you are strong.",
  2: "Name what you need before you become useful to everyone except yourself.",
  3: "Say the precise thing you keep softening for other people’s comfort.",
  4: "Loosen one rule that used to protect you but now only keeps you small.",
  5: "Commit to one door long enough for freedom to become real.",
  6: "Return the responsibility that was never yours to carry.",
  7: "Bring one private truth back into daylight.",
  8: "Use power without apologizing for having it.",
  9: "Put down the ending you keep reliving.",
  11: "Trust the first signal, not the fifth explanation.",
  22: "Treat your scale as evidence, not as a problem.",
  33: "Let your presence teach without making your life a sacrifice.",
};

const STRENGTHS: Record<number, string[]> = {
  1: ["Initiative", "Self-trust", "Original action", "Leadership"],
  2: ["Emotional reading", "Patience", "Diplomacy", "Devotion"],
  3: ["Expression", "Charm", "Creativity", "Momentum"],
  4: ["Discipline", "Loyalty", "Structure", "Endurance"],
  5: ["Adaptability", "Magnetism", "Freedom", "Range"],
  6: ["Care", "Beauty", "Responsibility", "Warmth"],
  7: ["Depth", "Analysis", "Intuition", "Solitude"],
  8: ["Power", "Strategy", "Money sense", "Impact"],
  9: ["Wisdom", "Compassion", "Closure", "Vision"],
  11: ["Intuition", "Signal", "Presence", "Inspiration"],
  22: ["Scale", "Building", "Systems", "Legacy"],
  33: ["Teaching", "Healing", "Influence", "Devotion"],
};

const SHADOWS: Record<number, string[]> = {
  1: ["Feeling alone even when people admire you", "Mistaking urgency for certainty", "Pushing away help before it can reach you"],
  2: ["Absorbing everyone else’s mood", "Waiting for permission to want more", "Calling silence peace when it is actually fear"],
  3: ["Performing lightness when you need honesty", "Starting often, finishing rarely", "Hiding pain behind charm"],
  4: ["Turning structure into a cage", "Carrying more than your share", "Confusing control with safety"],
  5: ["Leaving before the breakthrough", "Avoiding the one commitment that would free you", "Mistaking stimulation for direction"],
  6: ["Over-giving", "Rescuing people from their own lessons", "Making love conditional on usefulness"],
  7: ["Withdrawing when you need to be seen", "Overthinking what your body already knows", "Testing people instead of trusting them"],
  8: ["Softening your ambition to stay liked", "Over-identifying with results", "Treating vulnerability like a liability"],
  9: ["Carrying endings too long", "Saving people who did not ask", "Confusing compassion with self-abandonment"],
  11: ["Doubting the signal after it arrives", "Taking on nervous energy that is not yours", "Waiting for proof until the moment passes"],
  22: ["Shrinking the vision so it feels safer", "Pressure that turns into delay", "Building for everyone except yourself"],
  33: ["Healing others while postponing your own life", "Mistaking sacrifice for purpose", "Letting guilt choose the next step"],
};

const CHAPTERS = [
  ["01", "Life Path", "The pattern underneath the choices you keep repeating"],
  ["02", "Expression", "How the world reads you before you explain yourself"],
  ["03", "Soul Urge", "The private hunger behind your public decisions"],
  ["04", "Personality", "The mask that protects you — and where it costs you"],
  ["05", "Birth Day Gift", "The talent you did not have to earn"],
  ["06", "Karmic Debt", "The inherited loop your life is trying to close"],
  ["07", "Karmic Lessons", "The missing numbers your name keeps teaching you"],
  ["08", "Maturity", "Who you become when the second life begins"],
  ["09", "Pinnacles", "Your four life seasons, dated by year"],
  ["10", "Challenges", "The friction that repeats until it is understood"],
  ["11", "Palm Reading", "The layer your numbers cannot fully reach"],
  ["12", "Personal Year", "The exact theme governing this chapter"],
  ["13", "90-Day Windows", "When love, money, and decisions open faster"],
  ["14", "Compatibility Map", "The numbers that pull you closer — or drain you"],
  ["15", "Closing Letter", "A final page written for the person you are becoming"],
] as const;

function useBookPager(total: number) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const indexRef = useRef(0);
  const dragRef = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const active = useRef(false);
  const locked = useRef<"x" | "y" | null>(null);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const goTo = useCallback((page: number) => {
    const next = Math.max(0, Math.min(total - 1, page));
    indexRef.current = next;
    dragRef.current = 0;
    setIndex(next);
    setDragX(0);
    setIsDragging(false);
  }, [total]);

  const begin = (x: number, y: number) => {
    active.current = true;
    locked.current = null;
    startX.current = x;
    startY.current = y;
    dragRef.current = 0;
    setDragX(0);
    setIsDragging(true);
  };

  const move = (x: number, y: number) => {
    if (!active.current) return "idle" as const;
    const dx = x - startX.current;
    const dy = y - startY.current;

    if (!locked.current && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      locked.current = Math.abs(dx) > Math.abs(dy) * 1.08 ? "x" : "y";
    }

    if (locked.current !== "x") return locked.current ?? "idle";

    const atStart = indexRef.current === 0 && dx > 0;
    const atEnd = indexRef.current === total - 1 && dx < 0;
    const resistance = atStart || atEnd ? 0.25 : 1;
    const limited = Math.max(-132, Math.min(132, dx * resistance));
    dragRef.current = limited;
    setDragX(limited);
    return "x" as const;
  };

  const end = () => {
    if (!active.current) return;
    active.current = false;
    setIsDragging(false);

    const threshold = Math.min(82, Math.max(54, window.innerWidth * 0.16));
    const delta = dragRef.current;
    const shouldTurn = locked.current === "x" && Math.abs(delta) >= threshold;
    const next = shouldTurn ? indexRef.current + (delta < 0 ? 1 : -1) : indexRef.current;

    locked.current = null;
    goTo(next);
  };

  return { index, dragX, isDragging, goTo, begin, move, end };
}

function birthDate(dob: DOB) {
  return new Date(dob.year, dob.month - 1, dob.day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Page({ children, tone = "paper" }: { children: ReactNode; tone?: "paper" | "cover" | "image" }) {
  const className = tone === "paper"
    ? "bg-[#fbf6ee] text-[#241e2d]"
    : tone === "cover"
      ? "bg-[radial-gradient(circle_at_48%_30%,#9b55d6_0%,#6f2aa0_33%,#cf4f7d_70%,#2e174d_100%)] text-white"
      : "bg-[radial-gradient(circle_at_50%_25%,#6d38af_0%,#382064_48%,#130d25_100%)] text-white";

  return (
    <section className={`relative h-full w-full shrink-0 overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

function BookHeader({ left, right }: { left: string; right?: string }) {
  return (
    <div className="flex h-[52px] shrink-0 items-center justify-between px-6 pt-4 font-[family-name:var(--font-sans)] text-[9.5px] font-black uppercase tracking-[0.16em] text-[#786f7d]">
      <span className="min-w-0 truncate">{left}</span>
      {right && <span className="rounded-full bg-[#8c43c7]/10 px-2.5 py-1 text-[8px] text-[#8c43c7]">{right}</span>}
    </div>
  );
}

function Cover({ name, dob, lp }: { name: string; dob: DOB; lp: number }) {
  return (
    <Page tone="cover">
      <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(circle_at_22%_18%,rgba(255,232,170,.26),transparent_30%),radial-gradient(circle_at_78%_76%,rgba(255,255,255,.16),transparent_28%)]" />
      <div className="relative flex h-full flex-col items-center justify-center px-8 pb-12 pt-10 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.44em] text-[#f5d58a]">Astrelo</p>
        <div className="mt-7 grid h-[118px] w-[118px] place-items-center rounded-full border border-[#f5d58a]/60 shadow-[0_0_58px_rgba(245,213,138,.22)]">
          <div className="grid h-[94px] w-[94px] place-items-center rounded-full border border-[#f5d58a]/30">
            <span className="-translate-y-1 font-[family-name:var(--font-serif-display)] text-[72px] font-black leading-none text-[#f5d58a] drop-shadow-[0_0_18px_rgba(245,213,138,.35)]">{lp}</span>
          </div>
        </div>
        <p className="mt-4 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.24em] text-white/[0.68]">Life Path</p>
        <h2 className="mt-4 max-w-[15ch] font-[family-name:var(--font-display)] text-[22px] font-black uppercase leading-[1.05] text-white">{(name || "Your Name").toUpperCase()}</h2>
        <p className="mt-2 font-[family-name:var(--font-sans)] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/[0.62]">{birthDate(dob)}</p>
        <div className="mt-7 h-px w-20 bg-white/18" />
        <p className="mt-5 font-[family-name:var(--font-serif-body)] text-[12.5px] text-white/[0.66]">Your Numerology Blueprint · Free Sample</p>
        <p className="absolute inset-x-0 bottom-7 font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.18em] text-white/[0.54]">← swipe to read →</p>
      </div>
    </Page>
  );
}

function NarrativePage({ name, dob, lp, ex, paragraph }: { name: string; dob: DOB; lp: number; ex: number; paragraph: string }) {
  return (
    <Page>
      <div className="flex h-full flex-col">
        <BookHeader left={`Chapter 1 · Life Path ${lp}`} right="Sample" />
        <article className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-1 [-webkit-overflow-scrolling:touch]">
          <h1 className="font-[family-name:var(--font-display)] text-[27px] font-black leading-[1.08] text-[#2b2246]">{LP_TITLE[lp] ?? "Your Blueprint"}</h1>
          <p className="mt-2 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.18em] text-[#8c43c7]">Written for {(name || "you").toString()}</p>
          <p className="mt-5 font-[family-name:var(--font-serif-body)] text-[15.2px] leading-[1.68] text-[#2c2633] [text-wrap:pretty] first-letter:float-left first-letter:mr-2 first-letter:font-[family-name:var(--font-serif-display)] first-letter:text-[54px] first-letter:font-black first-letter:leading-[0.9] first-letter:text-[#c79138]">
            {paragraph}
          </p>
          <div className="mt-6 rounded-[18px] border-l-[3px] border-[#e0b453] bg-[#e0b453]/10 px-4 py-4">
            <p className="font-[family-name:var(--font-display)] text-[17px] font-black italic leading-[1.35] text-[#34275a]">
              Expression {ex} changes how this Life Path is seen — the same number can feel warm, distant, magnetic, precise, or impossible to ignore.
            </p>
          </div>
          <footer className="mt-6 flex items-center justify-between border-t border-[#2b2246]/10 pt-3 font-[family-name:var(--font-sans)] text-[8.5px] font-bold uppercase tracking-[0.16em] text-[#867c8c]">
            <span>{birthDate(dob)}</span>
            <span>Astrelo</span>
          </footer>
        </article>
      </div>
    </Page>
  );
}

function IllustrationPage({ lp }: { lp: number }) {
  return (
    <Page tone="image">
      <img src={chapterIllustration} alt="Golden numerology wheel" className="absolute inset-0 h-full w-full object-cover opacity-95" draggable={false} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(32,16,58,.16),rgba(32,16,58,.02)_42%,rgba(32,16,58,.86)_100%)]" />
      <div className="relative flex h-full flex-col justify-end px-8 pb-16 text-center">
        <p className="mx-auto max-w-[24ch] font-[family-name:var(--font-display)] text-[22px] font-black leading-[1.1] text-[#f5d58a] drop-shadow-[0_2px_16px_rgba(0,0,0,.35)]">
          “Numbers are the oldest language pattern ever spoke into being.”
        </p>
        <p className="mx-auto mt-4 max-w-[31ch] font-[family-name:var(--font-serif-body)] text-[13.5px] leading-[1.55] text-white/[0.78]">
          Life Path {lp} is not a label. It is the route your choices keep finding.
        </p>
      </div>
    </Page>
  );
}

function EssencePage({ lp }: { lp: number }) {
  const strengths = STRENGTHS[lp] ?? STRENGTHS[1];
  const shadows = SHADOWS[lp] ?? SHADOWS[1];

  return (
    <Page>
      <div className="flex h-full flex-col">
        <BookHeader left="Chapter 1 · Essence" right="Sample" />
        <article className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-2 [-webkit-overflow-scrolling:touch]">
          <p className="font-[family-name:var(--font-display)] text-[21px] font-black italic leading-[1.38] text-[#34275a] before:text-[#d8a842] before:content-['“'] after:text-[#d8a842] after:content-['”']">
            {LP_OPENING[lp] ?? LP_OPENING[1]}
          </p>

          <p className="mt-7 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.16em] text-[#8c43c7]">Your strengths</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {strengths.map((item) => (
              <span key={item} className="rounded-full border border-[#8c43c7]/30 bg-[#8c43c7]/[0.07] px-3.5 py-2 font-[family-name:var(--font-sans)] text-[12px] font-bold text-[#2b2246]">{item}</span>
            ))}
          </div>

          <p className="mt-7 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.16em] text-[#8c43c7]">Where it gets in your way</p>
          <ul className="mt-2 space-y-2.5">
            {shadows.map((item) => (
              <li key={item} className="relative pl-5 font-[family-name:var(--font-serif-body)] text-[14.5px] leading-[1.45] text-[#403846] before:absolute before:left-0 before:top-0 before:text-[#b8872d] before:content-['–']">{item}</li>
            ))}
          </ul>

          <p className="mt-7 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.16em] text-[#8c43c7]">Your move</p>
          <div className="mt-3 rounded-r-[16px] border-l-[3px] border-[#d8a842] bg-[#d8a842]/10 px-4 py-4">
            <p className="font-[family-name:var(--font-serif-body)] text-[15px] italic leading-[1.55] text-[#30264f]">{LP_MOVE[lp] ?? LP_MOVE[1]}</p>
          </div>
          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#8c43c7]/[0.22]" />
            <span className="font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.16em] text-[#2b2246]">End of free sample</span>
            <span className="h-px w-12 bg-[#8c43c7]/[0.22]" />
          </div>
        </article>
      </div>
    </Page>
  );
}

function PalmIntro({ onNext }: { onNext: () => void }) {
  return (
    <Page>
      <div className="flex h-full flex-col items-center justify-center px-8 py-10 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-[#8c43c7]/10 text-[#8c43c7]">
          <Sparkles className="h-9 w-9" strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 max-w-[12ch] font-[family-name:var(--font-display)] text-[28px] font-black leading-[1.04] text-[#2b2246]">One last layer</h2>
        <p className="mt-4 max-w-[31ch] font-[family-name:var(--font-serif-body)] text-[15px] leading-[1.62] text-[#5f5664]">
          Your numbers show <i>when</i> and <i>how</i> you move. Your palm adds something numbers cannot reach: the way pressure, love, and resilience have already marked your path.
        </p>
        <button type="button" onClick={onNext} className="mt-8 rounded-[16px] bg-[#2b2246] px-8 py-4 font-[family-name:var(--font-sans)] text-[13px] font-black uppercase tracking-[0.13em] text-[#f5d58a] shadow-[0_14px_30px_rgba(43,34,70,.22)]">
          Continue <ArrowRight className="ml-1 inline h-4 w-4" />
        </button>
      </div>
    </Page>
  );
}

function PalmScan({ onCaptured }: { onCaptured: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [capturing, setCapturing] = useState(false);

  const capture = () => {
    setCapturing(true);
    window.setTimeout(onCaptured, 850);
  };

  return (
    <Page tone="image">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(154,83,214,.36),transparent_34%),linear-gradient(180deg,#22133d_0%,#120d24_100%)]" />
      <img src={palmIllustration} alt="Palm reading guide" className="absolute inset-x-0 top-[12dvh] mx-auto h-[43dvh] w-full object-contain px-7 opacity-90" draggable={false} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,13,36,.04)_0%,rgba(18,13,36,.12)_48%,rgba(18,13,36,.92)_78%,rgba(18,13,36,.98)_100%)]" />
      <div className="relative flex h-full flex-col items-center px-7 pb-8 pt-9 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.24em] text-[#f5d58a]">Chapter 11 · Palm Layer</p>
        <h2 className="mt-auto max-w-[15ch] font-[family-name:var(--font-display)] text-[25px] font-black leading-[1.06] text-white">Center your palm in the frame</h2>
        <p className="mt-3 max-w-[30ch] font-[family-name:var(--font-serif-body)] text-[13.5px] leading-[1.55] text-white/72">
          Takes about 10 seconds. Your scan is added to the full Blueprint — no skip screen, no extra step.
        </p>
        <div className="mt-6 w-full" data-no-drag>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.[0]) capture();
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={capturing}
            className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#f5d58a] px-6 py-4 font-[family-name:var(--font-sans)] text-[12.5px] font-black uppercase tracking-[0.15em] text-[#2b2246] shadow-[0_14px_34px_rgba(245,213,138,.32)] disabled:opacity-70"
          >
            <Camera className="h-4 w-4" /> {capturing ? "Reading palm…" : "Capture palm"}
          </button>
        </div>
      </div>
    </Page>
  );
}

function ScanResult({ name }: { name: string }) {
  return (
    <Page tone="cover">
      <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_25%_18%,rgba(245,213,138,.24),transparent_28%),radial-gradient(circle_at_75%_78%,rgba(255,255,255,.14),transparent_30%)]" />
      <div className="relative flex h-full flex-col items-center justify-center px-7 py-10 text-center">
        <div className="grid h-28 w-28 place-items-center rounded-full border border-[#f5d58a]/55 shadow-[0_0_54px_rgba(245,213,138,.2)]">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#f5d58a] text-[#2b2246] shadow-[0_0_34px_rgba(245,213,138,.38)]"><Check className="h-7 w-7" strokeWidth={3} /></div>
        </div>
        <p className="mt-7 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.24em] text-[#f5d58a]">Palm captured</p>
        <h2 className="mt-3 max-w-[14ch] font-[family-name:var(--font-display)] text-[27px] font-black leading-[1.04] text-white">{name || "Your"} scan is ready to decode</h2>
        <p className="mt-5 max-w-[31ch] font-[family-name:var(--font-serif-body)] text-[14px] leading-[1.6] text-white/[0.73]">
          Three dominant lines were identified: heart, life, and head. The complete interpretation is added inside Chapter 11.
        </p>
        <div className="mt-8 grid w-full grid-cols-3 gap-2">
          {[["Heart", "Deep"], ["Life", "Long"], ["Head", "Split"]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/[0.12] bg-white/[0.07] px-2 py-4">
              <p className="font-[family-name:var(--font-display)] text-[17px] font-black text-[#f5d58a]">{value}</p>
              <p className="mt-1 font-[family-name:var(--font-sans)] text-[8px] font-bold uppercase tracking-[0.14em] text-white/[0.52]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

function ChapterList({ name }: { name: string }) {
  return (
    <Page>
      <div className="flex h-full flex-col">
        <BookHeader left="Your personal book" right="15 chapters" />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-1 [-webkit-overflow-scrolling:touch]">
          <h2 className="font-[family-name:var(--font-display)] text-[25px] font-black leading-[1.05] text-[#2b2246]">What waits inside{name ? `, ${name}` : ""}</h2>
          <p className="mt-2 font-[family-name:var(--font-serif-body)] text-[13px] italic leading-snug text-[#6b6170]">A complete book built from your birth date, name, palm layer, and current timing cycle.</p>
          <ol className="mt-5 space-y-2.5">
            {CHAPTERS.map(([n, title, sub], i) => (
              <li key={n} className="grid grid-cols-[34px_minmax(0,1fr)] gap-2 border-b border-[#2b2246]/[0.08] pb-2.5 last:border-b-0">
                <span className="font-[family-name:var(--font-display)] text-[12px] font-black text-[#c79138]">{n}</span>
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-display)] text-[13.5px] font-black leading-tight text-[#2b2246]">
                    {i === 1 && name ? `${title} — how ${name} arrives` : i === 11 && name ? `${name}'s ${title}` : title}
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--font-serif-body)] text-[11px] italic leading-tight text-[#766d7b]">{sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Page>
  );
}

function FinalPage({ name, onContinue }: { name: string; onContinue: () => void }) {
  return (
    <Page tone="cover">
      <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(circle_at_50%_18%,rgba(245,213,138,.25),transparent_32%),radial-gradient(circle_at_28%_82%,rgba(255,255,255,.12),transparent_28%)]" />
      <div className="relative flex h-full flex-col items-center justify-center px-8 py-10 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.28em] text-[#f5d58a]">Ready</p>
        <h2 className="mt-4 max-w-[13ch] font-[family-name:var(--font-display)] text-[31px] font-black leading-[1.02] text-white">Unlock {name ? `${name}'s` : "your"} full Blueprint</h2>
        <p className="mt-5 max-w-[29ch] font-[family-name:var(--font-serif-body)] text-[14.5px] leading-[1.58] text-white/74">15 chapters, palm reading result, dated windows, compatibility map, and one closing letter written only for you.</p>
        <div className="mt-8 rounded-full border border-[#f5d58a]/[0.36] px-5 py-2 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.16em] text-[#f5d58a]">One-time access · $19</div>
        <button type="button" onClick={onContinue} className="mt-7 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#f5d58a] px-6 py-4 font-[family-name:var(--font-sans)] text-[12.5px] font-black uppercase tracking-[0.16em] text-[#2b2246] shadow-[0_14px_34px_rgba(245,213,138,.34)]">
          Unlock my book <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Page>
  );
}

export function BookPreview({ name, dob, paragraph, onContinue }: Props) {
  const lp = useMemo(() => lifePath(dob), [dob]);
  const ex = useMemo(() => expressionNumber(name || "Astrelo"), [name]);
  const zodiac = useMemo(() => zodiacSign(dob.month, dob.day), [dob]);
  const pager = useBookPager(9);

  const narrative = useMemo(() => {
    const clean = paragraph?.trim();
    if (clean) return clean;
    return `${name || "You"}, born ${birthDate(dob)}, under a ${zodiac} sun with Life Path ${lp}, move through the world as someone who is rarely only responding to the moment. Your system is always reading the next step, the hidden motive, the unfinished sentence. People close to you may think you are complicated, but the truth is more precise: your blueprint carries a pattern that has been asking to be named. ${LP_OPENING[lp] ?? LP_OPENING[1]} This free chapter opens the first door. The full book shows where the pattern came from, how it affects love and money, and which dates help you move without forcing the outcome.`;
  }, [dob, lp, name, paragraph, zodiac]);

  const pages = [
    <Cover key="cover" name={name} dob={dob} lp={lp} />,
    <NarrativePage key="narrative" name={name} dob={dob} lp={lp} ex={ex} paragraph={narrative} />,
    <IllustrationPage key="illustration" lp={lp} />,
    <EssencePage key="essence" lp={lp} />,
    <PalmIntro key="palm-intro" onNext={() => pager.goTo(5)} />,
    <PalmScan key="palm" onCaptured={() => pager.goTo(6)} />,
    <ScanResult key="scan-result" name={name} />,
    <ChapterList key="chapters" name={name} />,
    <FinalPage key="final" name={name} onContinue={onContinue} />,
  ];

  return (
    <div className="quiz-fade-in -mx-5 -mb-8 -mt-6 h-[100dvh] min-h-[640px] overflow-hidden bg-[#fbf6ee] select-none">
      <div
        className="relative h-full overflow-hidden touch-pan-y"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("[data-no-drag],button,input,select,textarea,a")) return;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          pager.begin(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          const lock = pager.move(event.clientX, event.clientY);
          if (lock === "x") event.preventDefault();
        }}
        onPointerUp={pager.end}
        onPointerCancel={pager.end}
      >
        <div
          className={`grid h-full grid-flow-col auto-cols-[100%] will-change-transform ${pager.isDragging ? "" : "transition-transform duration-300 ease-out"}`}
          style={{ transform: `translate3d(calc(-${pager.index * 100}% + ${pager.dragX}px),0,0)` }}
        >
          {pages}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
          {pages.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === pager.index ? "w-6 bg-[#8c43c7]" : "w-1.5 bg-[#2b2246]/20"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
