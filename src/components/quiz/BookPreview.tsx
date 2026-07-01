import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Camera, Check } from "lucide-react";
import { lifePath, expressionNumber, zodiacSign, type DOB } from "@/lib/quiz/numerology";
import staircaseImg from "@/assets/quiz/book-staircase.jpg";

type Props = {
  name: string;
  dob: DOB;
  paragraph: string | null;
  onContinue: () => void;
};

// ─── Text pagination ─────────────────────────────────────────────────────
const CHARS_PER_PAGE = 520;

function paginate(text: string, perPage = CHARS_PER_PAGE): string[] {
  if (!text) return [""];
  if (text.length <= perPage) return [text.trim()];
  const sentences = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/);
  const pages: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > perPage && buf) {
      pages.push(buf.trim());
      buf = s;
    } else {
      buf = (buf ? buf + " " : "") + s;
    }
  }
  if (buf) pages.push(buf.trim());
  return pages;
}

// ─── Life Path pull quotes ───────────────────────────────────────────────
const LP_PULLQUOTE: Record<number, string> = {
  1: "The climb belongs to the ones who go first.",
  2: "You were built to hold others through the storm.",
  3: "Your voice is the doorway. Walk through it.",
  4: "Every stair set right becomes something that lasts.",
  5: "Freedom is not the escape — it is the direction.",
  6: "The ones you love are watching how you carry yourself.",
  7: "The quiet is where your real work begins.",
  8: "You were not given ambition by accident.",
  9: "Your life is not only about you — and it never was.",
  11: "You see what others still call coincidence.",
  22: "You are here to build something that outlives you.",
  33: "You teach without saying a word.",
};

const LP_CLIFFHANGER: Record<number, string> = {
  1: "But there is a specific reason you keep starting alone. Chapter 2 shows why.",
  2: "There is a pattern in how people take from you. It has a number. Chapter 2 names it.",
  3: "The one thing you keep avoiding — Chapter 2 says out loud what it is.",
  4: "You are building on top of something that was never resolved. Chapter 2 opens it.",
  5: "Your restlessness is not random. Chapter 2 shows the exact date it began.",
  6: "You keep saving someone who was never yours to save. Chapter 2 explains who.",
  7: "The question you refuse to ask yourself — Chapter 2 asks it for you.",
  8: "Your relationship with money is inherited. Chapter 2 traces where it came from.",
  9: "You are carrying something that does not belong to you. Chapter 2 names its owner.",
  11: "Your intuition has been pointing at one specific person. Chapter 2 says who.",
  22: "The scale you're built for scares you. Chapter 2 explains why — and when it lifts.",
  33: "Your influence is already reshaping someone. Chapter 2 shows who — and how.",
};

const CHAPTERS: Array<{ n: number; title: string; sub: string }> = [
  { n: 1, title: "Life Path", sub: "the pattern already running under everything you do" },
  { n: 2, title: "Expression", sub: "the version of you the world is meant to see" },
  { n: 3, title: "Soul Urge", sub: "what you keep choosing, and why" },
  { n: 4, title: "Personality", sub: "the mask that opens or closes rooms" },
  { n: 5, title: "Birth Day", sub: "the single gift you were born holding" },
  { n: 6, title: "Karmic Debt", sub: "the price your line kept postponing — until you" },
  { n: 7, title: "Karmic Lessons", sub: "the lessons your name keeps returning to" },
  { n: 8, title: "Maturity Number", sub: "who you become after 35, and why" },
  { n: 9, title: "Pinnacles", sub: "the four seasons of your life, dated" },
  { n: 10, title: "Challenges", sub: "the specific friction each season is built to teach" },
  { n: 11, title: "Palm Reading", sub: "the layer numbers cannot reach" },
  { n: 12, title: "Personal Year", sub: "what this year is actually about for you" },
  { n: 13, title: "90-Day Windows", sub: "the exact dates when action lands twice as hard" },
  { n: 14, title: "Compatibility Map", sub: "the numbers you clash with — and the one that fits" },
  { n: 15, title: "Closing Letter", sub: "the sentence written only for you" },
];

// ─── Swipe container hook ───────────────────────────────────────────────
function useSwipe(total: number) {
  const [idx, setIdx] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(false);

  const clamp = useCallback((n: number) => Math.max(0, Math.min(total - 1, n)), [total]);
  const goTo = useCallback((n: number) => setIdx(clamp(n)), [clamp]);
  const next = useCallback(() => setIdx((i) => clamp(i + 1)), [clamp]);
  const prev = useCallback(() => setIdx((i) => clamp(i - 1)), [clamp]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-swipe]")) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - (startY.current ?? 0);
    if (Math.abs(dy) > Math.abs(dx) + 8) return; // vertical scroll
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (startX.current == null) return;
    const width = containerRef.current?.offsetWidth ?? 300;
    const threshold = Math.min(80, width * 0.18);
    if (dragX < -threshold) next();
    else if (dragX > threshold) prev();
    setDragX(0);
    setIsDragging(false);
    startX.current = null;
    startY.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    const dx = e.deltaX;
    if (Math.abs(dx) < 12) return;
    if (Math.abs(dx) < Math.abs(e.deltaY)) return;
    if (wheelLock.current) return;
    wheelLock.current = true;
    if (dx > 0) next();
    else prev();
    setTimeout(() => (wheelLock.current = false), 380);
  };

  return {
    idx,
    setIdx: goTo,
    next,
    prev,
    dragX,
    isDragging,
    containerRef,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onWheel },
  };
}

// ─── Screens ─────────────────────────────────────────────────────────────
function Cover({ name, dob, lp }: { name: string; dob: DOB; lp: number }) {
  const dobStr = new Date(dob.year, dob.month - 1, dob.day).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  return (
    <div className="flex h-full flex-col items-center justify-between bg-[radial-gradient(ellipse_at_center,#2a1f5a_0%,#0f1730_75%)] px-8 py-14 text-center">
      <p className="font-[family-name:var(--font-sans)] text-[11px] font-bold uppercase tracking-[0.35em] text-[color:var(--gold)]/80">
        Astrelo
      </p>
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-[color:var(--gold)]/70">
          <div className="absolute inset-2 rounded-full border border-[color:var(--gold)]/25" />
          <span className="font-[family-name:var(--font-serif-display)] text-[92px] font-black leading-none text-[color:var(--gold)]">
            {lp}
          </span>
        </div>
        <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">
          Life Path Number
        </p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="font-[family-name:var(--font-serif-display)] text-[26px] font-extrabold text-white">
          {name}
        </p>
        <p className="font-[family-name:var(--font-serif-body)] text-[13px] italic text-white/60">
          {dobStr}
        </p>
      </div>
    </div>
  );
}

function TextPage({
  colontitle,
  body,
  pageNum,
  isFirst,
}: {
  colontitle: string;
  body: string;
  pageNum: number;
  isFirst?: boolean;
}) {
  const first = body?.[0] ?? "";
  const rest = body?.slice(1) ?? "";
  return (
    <div className="flex h-full flex-col bg-[color:var(--paper)] px-8 pb-8 pt-10">
      <p className="mb-8 text-center font-[family-name:var(--font-serif-body)] text-[11px] italic tracking-[0.15em] text-[color:var(--paper-muted)]">
        — {colontitle} —
      </p>
      <div className="font-[family-name:var(--font-serif-body)] text-[15px] leading-[1.75] text-[color:var(--paper-ink)]">
        {isFirst && first ? (
          <>
            <span className="float-left mr-2 mt-1 font-[family-name:var(--font-serif-display)] text-[54px] font-black leading-[0.85] text-[color:var(--navy)]">
              {first}
            </span>
            {rest}
          </>
        ) : (
          body
        )}
      </div>
      <p className="mt-6 text-center font-[family-name:var(--font-serif-body)] text-[11px] italic text-[color:var(--paper-muted)]">
        · {pageNum} ·
      </p>
    </div>
  );
}

function Illustration({ lp }: { lp: number }) {
  const quote = LP_PULLQUOTE[lp] ?? LP_PULLQUOTE[1];
  return (
    <div className="flex h-full flex-col bg-[#0f1730]">
      <div className="relative flex-1 overflow-hidden">
        <img
          src={staircaseImg}
          alt=""
          loading="lazy"
          width={1024}
          height={1280}
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#0f1730]" />
      </div>
      <div className="px-8 pb-10 pt-6 text-center">
        <p className="mx-auto max-w-[22ch] font-[family-name:var(--font-serif-display)] text-[19px] italic leading-snug text-[color:var(--gold)]">
          "{quote}"
        </p>
      </div>
    </div>
  );
}

function ChapterClose({ lp, ex }: { lp: number; ex: number }) {
  const cliff = LP_CLIFFHANGER[lp] ?? LP_CLIFFHANGER[1];
  return (
    <div className="flex h-full flex-col bg-[color:var(--paper)] px-8 pb-10 pt-10">
      <p className="mb-10 text-center font-[family-name:var(--font-serif-body)] text-[11px] italic tracking-[0.15em] text-[color:var(--paper-muted)]">
        — end of chapter one —
      </p>
      <div className="mb-8 grid grid-cols-2 gap-4">
        {[
          { label: "Life Path", value: lp },
          { label: "Expression", value: ex },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center border border-[color:var(--paper-ink)]/18 bg-[color:var(--paper-2)]/60 px-4 py-6"
          >
            <p className="font-[family-name:var(--font-sans)] text-[9.5px] font-bold uppercase tracking-[0.22em] text-[color:var(--paper-muted)]">
              {s.label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-serif-display)] text-[46px] font-black leading-none text-[color:var(--navy)]">
              {s.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mx-auto mb-6 h-px w-16 bg-[color:var(--gold)]/60" />
      <div className="bg-[color:var(--navy)] px-6 py-6 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]/80">
          Chapter 2 · Locked
        </p>
        <p className="mt-3 font-[family-name:var(--font-serif-display)] text-[17px] font-bold italic leading-snug text-white">
          {cliff}
        </p>
      </div>
    </div>
  );
}

function InstrumentMark({ captured = false }: { captured?: boolean }) {
  // Abstract signature: a thin gold circle, split by a horizontal line, with a
  // faint inner mark. Same shape for scan + result — result adds a filled dot.
  return (
    <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-[color:var(--gold)]/70" />
      <div className="absolute inset-4 rounded-full border border-[color:var(--gold)]/25" />
      <div className="absolute left-1/2 top-1/2 h-px w-20 -translate-x-1/2 -translate-y-1/2 bg-[color:var(--gold)]/40" />
      {captured ? (
        <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--gold)] text-[color:var(--navy)]">
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>
      ) : (
        <div className="relative z-10 h-2 w-2 rounded-full bg-[color:var(--gold)]" />
      )}
    </div>
  );
}

function PalmScan({ onCaptured }: { onCaptured: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex h-full flex-col justify-between bg-[#0f1730] px-8 py-12 text-center">
      <div>
        <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]/70">
          Chapter 11 · Preparation
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-serif-display)] text-[26px] font-extrabold leading-tight text-white">
          One layer numbers can't reach
        </h2>
      </div>
      <InstrumentMark />
      <ul className="mx-auto max-w-[26ch] space-y-3 text-left font-[family-name:var(--font-serif-body)] text-[13.5px] leading-snug text-white/75">
        <li>· Lines your birth date cannot show — timing, resilience, love.</li>
        <li>· Read together with your numbers, not instead of them.</li>
        <li>· Captured now, decoded once your book is unlocked.</li>
      </ul>
      <div data-no-swipe className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) onCaptured();
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 border border-[color:var(--gold)]/70 bg-transparent py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold)]"
        >
          <Camera className="h-4 w-4" /> Capture palm
        </button>
        <button
          type="button"
          onClick={onCaptured}
          className="w-full font-[family-name:var(--font-sans)] text-[11px] uppercase tracking-[0.22em] text-white/50 underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function ScanResult() {
  return (
    <div className="flex h-full flex-col justify-center gap-10 bg-[#0f1730] px-8 py-12 text-center">
      <InstrumentMark captured />
      <div>
        <p className="font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]/70">
          Chapter 11 · Queued
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-serif-display)] text-[28px] font-extrabold leading-tight text-white">
          Palm captured
        </h2>
        <p className="mx-auto mt-4 max-w-[28ch] font-[family-name:var(--font-serif-body)] text-[13.5px] leading-relaxed text-white/70">
          Your palm is safely queued for the Palm Reading chapter. The full analysis is written once your book unlocks.
        </p>
      </div>
    </div>
  );
}

function TableOfContents() {
  return (
    <div className="flex h-full flex-col bg-[color:var(--paper)] px-8 pb-10 pt-10">
      <p className="mb-6 text-center font-[family-name:var(--font-serif-body)] text-[11px] italic tracking-[0.15em] text-[color:var(--paper-muted)]">
        — table of contents —
      </p>
      <ol className="space-y-3">
        {CHAPTERS.map((c) => {
          const readable = c.n === 1;
          const captured = c.n === 11;
          return (
            <li key={c.n} className="flex items-start gap-3">
              <span className="mt-1 w-6 shrink-0 text-right font-[family-name:var(--font-serif-display)] text-[13px] font-bold text-[color:var(--paper-muted)]">
                {c.n}
              </span>
              <div className="flex-1 border-b border-dashed border-[color:var(--paper-ink)]/15 pb-2">
                <p className="font-[family-name:var(--font-serif-display)] text-[14.5px] font-bold text-[color:var(--navy)]">
                  {c.title}
                  {readable && (
                    <span className="ml-2 font-[family-name:var(--font-sans)] text-[9px] font-bold uppercase tracking-widest text-[color:var(--violet)]">
                      · read
                    </span>
                  )}
                  {captured && (
                    <span className="ml-2 font-[family-name:var(--font-sans)] text-[9px] font-bold uppercase tracking-widest text-[color:var(--gold)]">
                      · captured
                    </span>
                  )}
                </p>
                <p className="mt-0.5 font-[family-name:var(--font-serif-body)] text-[12px] italic leading-snug text-[color:var(--paper-muted)]">
                  {c.sub}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Root component ─────────────────────────────────────────────────────
export function BookPreview({ name, dob, paragraph, onContinue }: Props) {
  const lp = useMemo(() => lifePath(dob), [dob]);
  const ex = useMemo(() => expressionNumber(name || "Astrelo"), [name]);
  const zodiac = zodiacSign(dob.month, dob.day);
  const [palmCaptured, setPalmCaptured] = useState(false);

  const narrativePages = useMemo(() => {
    const raw = (paragraph ?? "").trim();
    if (!raw) {
      return [
        `${name}, your numbers tell a story most people never hear said out loud. Your Life Path ${lp} — under your ${zodiac} sun — is the frame everything else is written inside. It shapes what you notice, what you choose, and what you keep circling back to.`,
      ];
    }
    return paginate(raw);
  }, [paragraph, name, lp, zodiac]);

  const expressionInsight = useMemo(() => {
    return `Where your Life Path is the road, your Expression Number ${ex} is the voice you use on it. It is the shape of your natural talent — the way your gift wants to arrive in the world. When Expression ${ex} runs quietly against Life Path ${lp}, most of your friction is not weakness. It is unspent capacity, still waiting for the right instrument.`;
  }, [ex, lp]);

  // Build page list dynamically so narrative pagination fits
  const screens = useMemo(() => {
    const list: React.ReactNode[] = [];
    list.push(<Cover name={name} dob={dob} lp={lp} />);
    narrativePages.forEach((p, i) =>
      list.push(
        <TextPage
          key={`n${i}`}
          colontitle="chapter one · life path"
          body={p}
          pageNum={i + 1}
          isFirst={i === 0}
        />,
      ),
    );
    list.push(<Illustration lp={lp} />);
    list.push(
      <TextPage
        key="ex"
        colontitle="chapter one · expression"
        body={expressionInsight}
        pageNum={narrativePages.length + 1}
      />,
    );
    list.push(<ChapterClose lp={lp} ex={ex} />);
    list.push(<PalmScan onCaptured={() => { setPalmCaptured(true); swipe.next(); }} />);
    list.push(<ScanResult />);
    list.push(<TableOfContents />);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, dob, lp, ex, narrativePages, expressionInsight]);

  const swipe = useSwipe(screens.length);
  const isLast = swipe.idx === screens.length - 1;

  useEffect(() => {
    // no-op; palmCaptured tracked for future use
  }, [palmCaptured]);

  const translate = `translate3d(calc(${-swipe.idx * 100}% + ${swipe.dragX}px), 0, 0)`;

  return (
    <div className="quiz-fade-in -mx-5 -mt-6 flex min-h-[calc(100dvh-64px)] flex-col select-none">
      <div
        ref={swipe.containerRef}
        {...swipe.handlers}
        className="relative flex-1 overflow-hidden touch-pan-y"
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="flex h-full"
          style={{
            transform: translate,
            transition: swipe.isDragging ? "none" : "transform 340ms cubic-bezier(0.22, 1, 0.36, 1)",
            width: `${screens.length * 100}%`,
          }}
        >
          {screens.map((s, i) => (
            <div key={i} className="h-full shrink-0" style={{ width: `${100 / screens.length}%` }}>
              <div className="h-full min-h-[560px]">{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Page dots + CTA */}
      <div className="bg-[color:var(--paper)] px-5 pb-5 pt-4">
        <div className="mb-4 flex items-center justify-center gap-1.5">
          {screens.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to page ${i + 1}`}
              onClick={() => swipe.setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === swipe.idx ? "w-6 bg-[color:var(--navy)]" : "w-1.5 bg-[color:var(--paper-ink)]/25"
              }`}
            />
          ))}
        </div>
        {isLast ? (
          <button
            onClick={onContinue}
            className="flex w-full items-center justify-center gap-2 bg-[color:var(--navy)] py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold)]"
          >
            Unlock My Book <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={swipe.next}
            className="flex w-full items-center justify-center gap-2 border border-[color:var(--paper-ink)]/20 bg-transparent py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold uppercase tracking-[0.18em] text-[color:var(--navy)]"
          >
            Turn the page <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
