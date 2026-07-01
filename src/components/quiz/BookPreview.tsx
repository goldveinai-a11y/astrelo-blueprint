import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, BookOpen, Camera, Check, Lock, Sparkles } from "lucide-react";
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
  ["Soul Urge Number", "What your heart actually wants"],
  ["Personality Number", "The first impression you give"],
  ["Expression Number", "How your name changes the way life reads you"],
  ["Birth Day Gift", "The talent you did not have to earn"],
  ["Karmic Debt & Lessons", "The inherited loop your life is trying to close"],
  ["2026 Forecast", "Month-by-month timing for decisions"],
  ["Pinnacle Cycles", "Your four life seasons, dated by year"],
  ["Love Compatibility Map", "The numbers that pull you closer — or drain you"],
  ["Palm Reading", "Heart, head, life line interpretation"],
  ["90-Day Windows", "When love, money, and clarity open faster"],
] as const;

function useBookPager(total: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(390);
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
    const node = viewportRef.current;
    if (!node) return;
    const update = () => setWidth(Math.max(1, node.getBoundingClientRect().width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const goTo = useCallback((page: number) => {
    const next = Math.max(0, Math.min(total - 1, page));
    indexRef.current = next;
    dragRef.current = 0;
    active.current = false;
    locked.current = null;
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

    if (!locked.current && Math.max(Math.abs(dx), Math.abs(dy)) > 10) {
      locked.current = Math.abs(dx) > Math.abs(dy) * 1.18 ? "x" : "y";
      if (locked.current === "y") {
        setIsDragging(false);
        return "y" as const;
      }
    }

    if (locked.current !== "x") return locked.current ?? "idle";

    const atStart = indexRef.current === 0 && dx > 0;
    const atEnd = indexRef.current === total - 1 && dx < 0;
    const resistance = atStart || atEnd ? 0.22 : 1;
    const limited = Math.max(-width * 0.42, Math.min(width * 0.42, dx * resistance));
    dragRef.current = limited;
    setDragX(limited);
    return "x" as const;
  };

  const end = () => {
    if (!active.current) return;
    active.current = false;
    const delta = dragRef.current;
    const shouldTurn = locked.current === "x" && Math.abs(delta) >= Math.min(92, Math.max(58, width * 0.18));
    const next = shouldTurn ? indexRef.current + (delta < 0 ? 1 : -1) : indexRef.current;
    locked.current = null;
    goTo(next);
  };

  return { index, dragX, width, isDragging, viewportRef, goTo, begin, move, end };
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
    ? "bg-[#fbf7ee] text-[#211b29]"
    : tone === "cover"
      ? "bg-[linear-gradient(150deg,#2b1748_0%,#7b35b6_44%,#e65392_100%)] text-white"
      : "bg-[linear-gradient(160deg,#3a1b64_0%,#8e3ec6_52%,#ed6b9a_100%)] text-white";

  return (
    <section className={`relative h-full min-w-full overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

function BookHeader({ left, right }: { left: string; right?: string }) {
  return (
    <div className="flex h-[54px] shrink-0 items-center justify-between px-6 pt-4 font-[family-name:var(--font-sans)] text-[9.5px] font-black uppercase tracking-[0.16em] text-[#756878]">
      <span className="min-w-0 truncate">{left}</span>
      {right && <span className="rounded-full bg-[#8f3fc7]/[0.1] px-2.5 py-1 text-[8px] text-[#8f3fc7]">{right}</span>}
    </div>
  );
}

function Cover({ name, dob, lp }: { name: string; dob: DOB; lp: number }) {
  return (
    <Page tone="cover">
      <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_18%_10%,rgba(255,222,157,.34),transparent_27%),radial-gradient(circle_at_78%_84%,rgba(255,255,255,.22),transparent_30%)]" />
      <div className="absolute left-1/2 top-[12%] h-[310px] w-[310px] -translate-x-1/2 rounded-full border border-[#f7d682]/[0.2]" />
      <div className="absolute left-1/2 top-[16%] h-[238px] w-[238px] -translate-x-1/2 rounded-full border border-[#f7d682]/[0.16]" />
      <div className="relative flex h-full flex-col items-center px-8 pb-8 pt-9 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.46em] text-[#f7d682]">Astrelo</p>
        <div className="mt-[9vh] grid h-[132px] w-[132px] place-items-center rounded-full border border-[#f7d682]/[0.62] bg-white/[0.05] shadow-[0_0_64px_rgba(247,214,130,.28)]">
          <div className="grid h-[106px] w-[106px] place-items-center rounded-full border border-[#f7d682]/[0.28] bg-[#2b1748]/[0.12]">
            <span className="-translate-y-1 font-[family-name:var(--font-display)] text-[74px] font-black leading-none text-[#f7d682] drop-shadow-[0_0_22px_rgba(247,214,130,.42)]">{lp}</span>
          </div>
        </div>
        <p className="mt-4 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.24em] text-white/[0.68]">Life Path</p>
        <h2 className="mt-6 max-w-[15ch] font-[family-name:var(--font-display)] text-[24px] font-black uppercase leading-[1.05] text-white">{(name || "Your Name").toUpperCase()}</h2>
        <p className="mt-2 font-[family-name:var(--font-sans)] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/[0.66]">{birthDate(dob)}</p>
        <div className="mt-7 h-px w-24 bg-white/[0.18]" />
        <p className="mt-5 max-w-[28ch] font-[family-name:var(--font-serif-body)] text-[13px] leading-[1.45] text-white/[0.7]">Your Numerology Blueprint · Free ebook sample</p>
        <p className="mt-auto font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.18em] text-white/[0.58]">← swipe to read →</p>
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
          <h1 className="font-[family-name:var(--font-display)] text-[29px] font-black leading-[1.05] text-[#2b1748]">{LP_TITLE[lp] ?? "Your Blueprint"}</h1>
          <p className="mt-2 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.18em] text-[#943fc7]">Written for {(name || "you").toString()}</p>
          <p className="mt-5 font-[family-name:var(--font-serif-body)] text-[15.6px] leading-[1.66] text-[#2d2534] [text-wrap:pretty] first-letter:float-left first-letter:mr-2 first-letter:font-[family-name:var(--font-display)] first-letter:text-[58px] first-letter:font-black first-letter:leading-[0.86] first-letter:text-[#ca8f2f]">
            {paragraph}
          </p>
          <div className="mt-6 rounded-r-[18px] border-l-[3px] border-[#d9a53d] bg-[#d9a53d]/[0.1] px-4 py-4">
            <p className="font-[family-name:var(--font-display)] text-[16.5px] font-black italic leading-[1.35] text-[#37245d]">
              Expression {ex} changes how this Life Path is seen — the same number can feel warm, magnetic, precise, or impossible to ignore.
            </p>
          </div>
          <footer className="mt-6 flex items-center justify-between border-t border-[#2b1748]/[0.1] pt-3 font-[family-name:var(--font-sans)] text-[8.5px] font-bold uppercase tracking-[0.16em] text-[#827687]">
            <span>{birthDate(dob)}</span>
            <span>Astrelo</span>
          </footer>
        </article>
      </div>
    </Page>
  );
}

function FullBleedIllustration({ lp }: { lp: number }) {
  return (
    <Page tone="image">
      <img src={chapterIllustration} alt="Golden numerology wheel" className="absolute inset-0 h-full w-full object-cover" draggable={false} loading="lazy" width={1080} height={1920} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(40,18,72,.03)_0%,rgba(40,18,72,.04)_45%,rgba(48,20,82,.84)_100%)]" />
      <div className="relative flex h-full flex-col justify-end px-8 pb-16 text-center">
        <p className="mx-auto max-w-[24ch] font-[family-name:var(--font-display)] text-[25px] font-black leading-[1.06] text-[#f7d682] drop-shadow-[0_2px_16px_rgba(0,0,0,.38)]">
          “Numbers are the oldest language pattern ever spoke into being.”
        </p>
        <p className="mx-auto mt-4 max-w-[31ch] font-[family-name:var(--font-serif-body)] text-[14px] leading-[1.55] text-white/[0.82]">
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
          <p className="font-[family-name:var(--font-display)] text-[21px] font-black italic leading-[1.36] text-[#39245d] before:text-[#d9a53d] before:content-['“'] after:text-[#d9a53d] after:content-['”']">
            {LP_OPENING[lp] ?? LP_OPENING[1]}
          </p>

          <p className="mt-7 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.16em] text-[#943fc7]">Your strengths</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {strengths.map((item) => (
              <span key={item} className="rounded-full border border-[#943fc7]/[0.3] bg-[#943fc7]/[0.07] px-3.5 py-2 font-[family-name:var(--font-sans)] text-[12px] font-bold text-[#2b1748]">{item}</span>
            ))}
          </div>

          <p className="mt-7 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.16em] text-[#943fc7]">Where it gets in your way</p>
          <ul className="mt-2 space-y-2.5">
            {shadows.map((item) => (
              <li key={item} className="relative pl-5 font-[family-name:var(--font-serif-body)] text-[14.7px] leading-[1.46] text-[#403746] before:absolute before:left-0 before:top-0 before:text-[#b8872d] before:content-['–']">{item}</li>
            ))}
          </ul>

          <p className="mt-7 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.16em] text-[#943fc7]">Your move</p>
          <div className="mt-3 rounded-r-[16px] border-l-[3px] border-[#d9a53d] bg-[#d9a53d]/[0.1] px-4 py-4">
            <p className="font-[family-name:var(--font-serif-body)] text-[15px] italic leading-[1.55] text-[#30204d]">{LP_MOVE[lp] ?? LP_MOVE[1]}</p>
          </div>
          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#943fc7]/[0.22]" />
            <span className="font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.16em] text-[#2b1748]">End of free sample</span>
            <span className="h-px w-12 bg-[#943fc7]/[0.22]" />
          </div>
        </article>
      </div>
    </Page>
  );
}

function ChapterArtwork({ lp }: { lp: number }) {
  return (
    <Page tone="image">
      <img src={chapterIllustration} alt="Numerology chapter artwork" className="absolute inset-0 h-full w-full scale-[1.08] object-cover blur-[1px]" draggable={false} loading="lazy" width={1080} height={1920} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(255,255,255,.2),transparent_24%),linear-gradient(to_bottom,rgba(138,54,191,.22),rgba(234,88,145,.28),rgba(47,20,82,.94))]" />
      <div className="relative flex h-full flex-col px-8 pb-14 pt-12 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.26em] text-[#f7d682]">What the full book adds</p>
        <div className="my-auto grid place-items-center">
          <div className="grid h-36 w-36 place-items-center rounded-full border border-[#f7d682]/[0.42] bg-white/[0.07] shadow-[0_0_44px_rgba(247,214,130,.24)]">
            <BookOpen className="h-14 w-14 text-[#f7d682]" strokeWidth={1.35} />
          </div>
          <h2 className="mt-7 max-w-[13ch] font-[family-name:var(--font-display)] text-[29px] font-black leading-[1.02] text-white">The pattern behind the pattern</h2>
          <p className="mt-4 max-w-[29ch] font-[family-name:var(--font-serif-body)] text-[14px] leading-[1.55] text-white/[0.76]">
            Your free page shows Life Path {lp}. The locked chapters connect love, money, timing, and the choices that keep repeating.
          </p>
        </div>
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
      <img src={palmIllustration} alt="Palm reading guide" className="absolute inset-0 h-full w-full object-cover" draggable={false} loading="lazy" width={1080} height={1920} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(44,21,75,.02)_0%,rgba(44,21,75,.02)_44%,rgba(44,21,75,.72)_74%,rgba(37,17,65,.97)_100%)]" />
      <div className="relative flex h-full flex-col items-center px-7 pb-8 pt-9 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.24em] text-[#f7d682]">Chapter 11 · Palm Layer</p>
        <div className="mt-auto w-full">
          <h2 className="mx-auto max-w-[16ch] font-[family-name:var(--font-display)] text-[26px] font-black leading-[1.06] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,.3)]">Center your palm in the frame</h2>
          <p className="mx-auto mt-3 max-w-[30ch] font-[family-name:var(--font-serif-body)] text-[13.5px] leading-[1.55] text-white/[0.76]">
            Takes about 10 seconds. Your palm layer is added to the full Blueprint.
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
              className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#f7d682] px-6 py-4 font-[family-name:var(--font-sans)] text-[12.5px] font-black uppercase tracking-[0.15em] text-[#2b1748] shadow-[0_14px_34px_rgba(247,214,130,.32)] disabled:opacity-70"
            >
              <Camera className="h-4 w-4" /> {capturing ? "Reading palm…" : "Capture palm"}
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}

function ScanResult({ name }: { name: string }) {
  return (
    <Page tone="cover">
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_23%_15%,rgba(247,214,130,.28),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,.2),transparent_30%)]" />
      <div className="relative flex h-full flex-col items-center justify-center px-7 py-10 text-center">
        <div className="grid h-28 w-28 place-items-center rounded-full border border-[#f7d682]/[0.55] shadow-[0_0_54px_rgba(247,214,130,.22)]">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#f7d682] text-[#2b1748] shadow-[0_0_34px_rgba(247,214,130,.38)]"><Check className="h-7 w-7" strokeWidth={3} /></div>
        </div>
        <p className="mt-7 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.24em] text-[#f7d682]">Palm layer ready</p>
        <h2 className="mt-3 max-w-[14ch] font-[family-name:var(--font-display)] text-[28px] font-black leading-[1.04] text-white">{name || "Your"} scan is ready to decode</h2>
        <p className="mt-5 max-w-[31ch] font-[family-name:var(--font-serif-body)] text-[14px] leading-[1.6] text-white/[0.76]">
          Heart, life, and head lines were identified. The complete interpretation is placed inside Chapter 11.
        </p>
        <div className="mt-8 grid w-full grid-cols-3 gap-2">
          {[["Heart", "Deep"], ["Life", "Long"], ["Head", "Split"]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/[0.14] bg-white/[0.08] px-2 py-4">
              <p className="font-[family-name:var(--font-display)] text-[17px] font-black text-[#f7d682]">{value}</p>
              <p className="mt-1 font-[family-name:var(--font-sans)] text-[8px] font-bold uppercase tracking-[0.14em] text-white/[0.56]">{label}</p>
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
        <BookHeader left="Your Numerology Blueprint" right="Locked" />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-1 [-webkit-overflow-scrolling:touch]">
          <h2 className="font-[family-name:var(--font-display)] text-[26px] font-black leading-[1.05] text-[#2b1748]">What waits inside{name ? `, ${name}` : ""}</h2>
          <p className="mt-2 font-[family-name:var(--font-serif-body)] text-[13px] italic leading-snug text-[#6b6170]">A complete ebook built from your birth date, name, palm layer, and current timing cycle.</p>
          <div className="mt-5 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.17em] text-[#8b7f8e]">Numerology · ready now</div>
          <ol className="mt-2 space-y-0">
            {CHAPTERS.map(([title, sub], i) => (
              <li key={title} className="flex items-start gap-3 border-b border-[#2b1748]/[0.08] py-2.5 last:border-b-0">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#39245d]/[0.45]" />
                <div className="min-w-0 flex-1">
                  <p className="font-[family-name:var(--font-display)] text-[13px] font-black leading-tight text-[#39245d]">
                    {i === 2 && name ? `${title} — how ${name} arrives` : title}
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
      <div className="absolute inset-0 opacity-65 [background-image:radial-gradient(circle_at_50%_18%,rgba(247,214,130,.3),transparent_32%),radial-gradient(circle_at_28%_82%,rgba(255,255,255,.16),transparent_28%)]" />
      <div className="relative flex h-full flex-col items-center justify-center px-8 py-10 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.28em] text-[#f7d682]">Ready</p>
        <Sparkles className="mt-8 h-10 w-10 text-[#f7d682]" strokeWidth={1.4} />
        <h2 className="mt-5 max-w-[13ch] font-[family-name:var(--font-display)] text-[32px] font-black leading-[1.02] text-white">Unlock {name ? `${name}'s` : "your"} full Blueprint</h2>
        <p className="mt-5 max-w-[29ch] font-[family-name:var(--font-serif-body)] text-[14.5px] leading-[1.58] text-white/[0.76]">15 chapters, palm reading result, dated windows, compatibility map, and one closing letter written only for you.</p>
        <div className="mt-8 rounded-full border border-[#f7d682]/[0.38] px-5 py-2 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.16em] text-[#f7d682]">One-time access · $19</div>
        <button type="button" onClick={onContinue} className="mt-7 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#f7d682] px-6 py-4 font-[family-name:var(--font-sans)] text-[12.5px] font-black uppercase tracking-[0.16em] text-[#2b1748] shadow-[0_14px_34px_rgba(247,214,130,.34)]">
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
    <FullBleedIllustration key="illustration" lp={lp} />,
    <EssencePage key="essence" lp={lp} />,
    <ChapterArtwork key="chapter-art" lp={lp} />,
    <PalmScan key="palm" onCaptured={() => pager.goTo(6)} />,
    <ScanResult key="scan-result" name={name} />,
    <ChapterList key="chapters" name={name} />,
    <FinalPage key="final" name={name} onContinue={onContinue} />,
  ];

  return (
    <div className="quiz-fade-in -mx-5 -mb-8 -mt-6 h-[100dvh] min-h-[640px] overflow-hidden bg-[#fbf7ee] select-none">
      <div
        ref={pager.viewportRef}
        className="relative h-full overflow-hidden overscroll-contain touch-pan-y"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("[data-no-drag],button,input,select,textarea,a")) return;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          pager.begin(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          const lock = pager.move(event.clientX, event.clientY);
          if (lock === "x") event.preventDefault();
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture?.(event.pointerId);
          pager.end();
        }}
        onPointerCancel={pager.end}
      >
        <div
          className={`flex h-full will-change-transform ${pager.isDragging ? "" : "transition-transform duration-300 ease-out"}`}
          style={{ transform: `translate3d(${(-pager.index * pager.width) + pager.dragX}px,0,0)` }}
        >
          {pages}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
          {pages.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === pager.index ? "w-6 bg-[#943fc7]" : "w-1.5 bg-[#2b1748]/[0.2]"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
