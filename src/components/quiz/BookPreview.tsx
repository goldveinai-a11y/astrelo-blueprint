import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowRight, Camera, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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
  1: "The next right move is not waiting for permission; it is choosing a direction and letting clarity catch up.",
  2: "The next right move is naming what you need before you become useful to everyone except yourself.",
  3: "The next right move is saying the precise thing you keep softening for other people’s comfort.",
  4: "The next right move is loosening one rule that used to protect you but now only keeps you small.",
  5: "The next right move is committing to one door long enough for freedom to become real.",
  6: "The next right move is returning the responsibility that was never yours to carry.",
  7: "The next right move is bringing one private truth back into daylight.",
  8: "The next right move is using power without apologizing for having it.",
  9: "The next right move is putting down the ending you keep reliving.",
  11: "The next right move is trusting the first signal, not the fifth explanation.",
  22: "The next right move is treating your scale as evidence, not as a problem.",
  33: "The next right move is letting your presence teach without making your life a sacrifice.",
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
  ["10", "Challenges", "The friction that keeps repeating until it is understood"],
  ["11", "Palm Reading", "The layer your numbers cannot fully reach"],
  ["12", "Personal Year", "The exact theme governing this chapter of your life"],
  ["13", "90-Day Windows", "When love, money, and decisions open faster"],
  ["14", "Compatibility Map", "The numbers that pull you closer — or drain you"],
  ["15", "Closing Letter", "A final page written for the person you are becoming"],
] as const;

function useBookPager(total: number) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const active = useRef(false);
  const locked = useRef<"x" | "y" | null>(null);

  const goTo = useCallback((page: number) => {
    setIndex(Math.max(0, Math.min(total - 1, page)));
    setDragX(0);
  }, [total]);

  const begin = (x: number, y: number) => {
    active.current = true;
    locked.current = null;
    startX.current = x;
    startY.current = y;
    setDragX(0);
  };

  const move = (x: number, y: number) => {
    if (!active.current) return;
    const dx = x - startX.current;
    const dy = y - startY.current;
    if (!locked.current && Math.max(Math.abs(dx), Math.abs(dy)) > 10) {
      locked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (locked.current !== "x") return;
    const edgeResistance = (index === 0 && dx > 0) || (index === total - 1 && dx < 0) ? 0.28 : 1;
    setDragX(Math.max(-96, Math.min(96, dx * edgeResistance)));
  };

  const end = () => {
    if (!active.current) return;
    active.current = false;
    if (locked.current === "x" && Math.abs(dragX) > 46) goTo(index + (dragX < 0 ? 1 : -1));
    else setDragX(0);
    locked.current = null;
  };

  return { index, dragX, goTo, begin, move, end };
}

function birthDate(dob: DOB) {
  return new Date(dob.year, dob.month - 1, dob.day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Page({ children, tone = "paper" }: { children: React.ReactNode; tone?: "paper" | "cover" | "dark" }) {
  const className = tone === "paper"
    ? "bg-[color:var(--paper)] text-[color:var(--paper-ink)]"
    : tone === "cover"
      ? "bg-[radial-gradient(circle_at_50%_34%,oklch(0.48_0.23_306)_0%,oklch(0.34_0.19_304)_30%,oklch(0.19_0.08_267)_72%,oklch(0.14_0.06_265)_100%)] text-[color:var(--primary-foreground)]"
      : "bg-[radial-gradient(circle_at_50%_22%,oklch(0.28_0.12_285)_0%,oklch(0.14_0.06_265)_64%,oklch(0.1_0.04_260)_100%)] text-[color:var(--primary-foreground)]";

  return (
    <section className={`h-full w-full shrink-0 overflow-hidden ${className}`}>
      <div className="relative flex h-full min-h-0 flex-col">{children}</div>
    </section>
  );
}

function BookHeader({ left, right }: { left: string; right?: string }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-6 pt-3 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.18em] text-[color:var(--paper-muted)]">
      <span className="min-w-0 truncate">{left}</span>
      {right && <span className="rounded-full bg-[color:var(--violet)]/10 px-2.5 py-1 text-[8px] text-[color:var(--violet)]">{right}</span>}
    </div>
  );
}

function Cover({ name, dob, lp }: { name: string; dob: DOB; lp: number }) {
  return (
    <Page tone="cover">
      <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(115deg,transparent_0%,oklch(0.82_0.16_85/.14)_42%,transparent_72%)]" />
      <div className="flex h-full flex-col items-center px-8 py-10 text-center">
        <p className="mt-[10dvh] font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.42em] text-[color:var(--gold)]">Astrelo</p>
        <div className="mt-7 grid h-28 w-28 place-items-center rounded-full border border-[color:var(--gold)]/55 shadow-[0_0_58px_oklch(0.82_0.16_85/.18)]">
          <div className="grid h-22 w-22 place-items-center rounded-full border border-[color:var(--gold)]/20">
            <span className="translate-y-[-3px] font-[family-name:var(--font-serif-display)] text-[70px] font-black leading-none text-[color:var(--gold)]">{lp}</span>
          </div>
        </div>
        <p className="mt-5 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.26em] text-[color:var(--primary-foreground)]/58">Life Path</p>
        <h2 className="mt-3 max-w-[13ch] font-[family-name:var(--font-display)] text-[20px] font-black uppercase leading-[1.05] text-[color:var(--primary-foreground)]">{(name || "Your Name").toUpperCase()}</h2>
        <p className="mt-2 font-[family-name:var(--font-sans)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--primary-foreground)]/55">{birthDate(dob)}</p>
        <div className="mt-9 h-px w-16 bg-[color:var(--primary-foreground)]/18" />
        <p className="mt-5 font-[family-name:var(--font-serif-body)] text-[12px] text-[color:var(--primary-foreground)]/62">Your Numerology Blueprint · Free Sample</p>
        <p className="mt-auto mb-2 font-[family-name:var(--font-sans)] text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--primary-foreground)]/42">← swipe to read →</p>
      </div>
    </Page>
  );
}

function TextPage({ name, dob, lp, ex, paragraph, second = false }: { name: string; dob: DOB; lp: number; ex: number; paragraph: string; second?: boolean }) {
  const title = second ? "What your number keeps repeating" : (LP_TITLE[lp] ?? "Your Blueprint");
  const body = second
    ? `${LP_OPENING[lp] ?? LP_OPENING[1]} Your Expression number ${ex} changes the way this pattern is seen: it decides whether people experience your power as warmth, distance, precision, magnetism, or pressure. This is why two people can share the same Life Path and still move through the world completely differently. In your full book, ${name || "you"}, this chapter connects your birth date, name, timing windows, and relationship pattern into one map — not a generic reading, but a sequence that keeps showing up in your actual choices. ${LP_MOVE[lp] ?? LP_MOVE[1]}`
    : paragraph;

  return (
    <Page>
      <BookHeader left={`Chapter 1 · Life Path ${lp}`} right="Sample" />
      <article className="flex min-h-0 flex-1 flex-col px-6 pb-7 pt-2">
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-black leading-[1.05] text-[color:var(--navy)]">{title}</h1>
        <p className="mt-2 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.18em] text-[color:var(--violet)]">For {(name || "you").toString()}</p>
        <div className="mt-4 min-h-0 flex-1 overflow-hidden">
          <p className="font-[family-name:var(--font-serif-body)] text-[15px] leading-[1.54] text-[color:var(--paper-ink)] [text-wrap:pretty]">
            {body}
          </p>
        </div>
        <footer className="mt-4 flex shrink-0 items-center justify-between border-t border-[color:var(--paper-ink)]/10 pt-3 font-[family-name:var(--font-sans)] text-[8.5px] font-bold uppercase tracking-[0.16em] text-[color:var(--paper-muted)]">
          <span>{birthDate(dob)}</span>
          <span>Astrelo</span>
        </footer>
      </article>
    </Page>
  );
}

function IllustrationPage({ lp }: { lp: number }) {
  return (
    <Page tone="dark">
      <img src={chapterIllustration} alt="Golden numerology wheel" className="absolute inset-0 h-full w-full object-cover opacity-90" draggable={false} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.1_0.04_260/.25),oklch(0.1_0.04_260/.1)_38%,oklch(0.1_0.04_260/.88)_100%)]" />
      <div className="relative mt-auto px-8 pb-14 text-center">
        <p className="mx-auto max-w-[24ch] font-[family-name:var(--font-display)] text-[20px] font-black leading-[1.12] text-[color:var(--gold)]">
          Life Path {lp} is not a label. It is the route your choices keep finding.
        </p>
        <p className="mx-auto mt-4 max-w-[30ch] font-[family-name:var(--font-serif-body)] text-[13px] leading-[1.55] text-[color:var(--primary-foreground)]/72">
          Your free sample opens the first layer. The full book maps the years, names, compatibility patterns, and timing windows around it.
        </p>
      </div>
    </Page>
  );
}

function CoreFrame({ name, lp, ex }: { name: string; lp: number; ex: number }) {
  return (
    <Page>
      <BookHeader left="Chapter 1 · Core Frame" right="Personal" />
      <div className="flex h-full min-h-0 flex-col px-6 pb-7 pt-2">
        <div className="rounded-[28px] bg-[radial-gradient(circle_at_50%_0%,oklch(0.36_0.18_300)_0%,oklch(0.16_0.07_265)_72%)] px-5 py-6 text-center shadow-[0_18px_44px_oklch(0.16_0.07_265/.22)]">
          <p className="font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.24em] text-[color:var(--gold)]">{(name || "Your").toUpperCase()} · Blueprint</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[{ label: "Life Path", value: lp }, { label: "Expression", value: ex }].map((item) => (
              <div key={item.label} className="rounded-2xl bg-[color:var(--primary-foreground)]/[0.07] px-3 py-4">
                <p className="font-[family-name:var(--font-sans)] text-[8px] font-black uppercase tracking-[0.18em] text-[color:var(--primary-foreground)]/48">{item.label}</p>
                <p className="mt-2 font-[family-name:var(--font-serif-display)] text-[42px] font-black leading-none text-[color:var(--gold)]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[color:var(--primary-foreground)]/10 pt-4">
            {["15 chapters", "4 seasons", "90 days"].map((item) => (
              <p key={item} className="font-[family-name:var(--font-sans)] text-[8px] font-bold uppercase tracking-[0.12em] text-[color:var(--primary-foreground)]/54">{item}</p>
            ))}
          </div>
        </div>
        <div className="mt-5 flex-1 rounded-[24px] border border-[color:var(--gold)]/35 bg-[color:var(--paper-2)] px-5 py-5">
          <p className="flex items-center gap-2 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.18em] text-[color:var(--violet)]"><Sparkles className="h-3.5 w-3.5" /> Chapter 2 opens</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[20px] font-black italic leading-[1.18] text-[color:var(--navy)]">
            The next page names the pattern that keeps returning when you are almost ready to change.
          </p>
          <p className="mt-4 font-[family-name:var(--font-serif-body)] text-[13.5px] leading-[1.55] text-[color:var(--paper-muted)]">
            In the full book, that pattern is tied to your name, your current personal year, and the exact windows where decisions land with less resistance.
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
    <Page tone="dark">
      <img src={palmIllustration} alt="Palm reading guide" className="absolute inset-0 h-full w-full object-cover object-center opacity-55" draggable={false} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.1_0.04_260/.72),oklch(0.15_0.07_270/.52)_40%,oklch(0.1_0.04_260/.92)_100%)]" />
      <div className="relative flex h-full flex-col items-center px-7 py-9 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.24em] text-[color:var(--gold)]">Chapter 11 · Palm Layer</p>
        <h2 className="mt-3 max-w-[13ch] font-[family-name:var(--font-display)] text-[27px] font-black leading-[1.02] text-[color:var(--primary-foreground)]">One layer your numbers cannot reach</h2>
        <div className="relative mt-8 grid h-48 w-48 place-items-center rounded-full border border-[color:var(--gold)]/45 bg-[color:var(--primary-foreground)]/[0.03] shadow-[0_0_60px_oklch(0.82_0.16_85/.13)]">
          <div className="absolute inset-4 rounded-full border border-dashed border-[color:var(--gold)]/32" />
          <Camera className="h-14 w-14 text-[color:var(--gold)]" strokeWidth={1.4} />
        </div>
        <p className="mt-7 max-w-[31ch] font-[family-name:var(--font-serif-body)] text-[14px] leading-[1.55] text-[color:var(--primary-foreground)]/76">
          Your numbers show timing and sequence. Your palm adds resilience, love lines, and the way pressure has marked your path.
        </p>
        <p className="mt-4 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.18em] text-[color:var(--gold)]/82">Takes about 10 seconds</p>
        <div className="mt-auto w-full" data-no-drag>
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
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-4 font-[family-name:var(--font-sans)] text-[12px] font-black uppercase tracking-[0.16em] text-[color:var(--navy)] shadow-[0_14px_34px_oklch(0.82_0.16_85/.34)] disabled:opacity-70"
          >
            <Camera className="h-4 w-4" /> {capturing ? "Reading palm…" : "Scan my palm now"}
          </button>
        </div>
      </div>
    </Page>
  );
}

function ScanResult({ name }: { name: string }) {
  return (
    <Page tone="cover">
      <div className="flex h-full flex-col items-center px-7 py-10 text-center">
        <div className="mt-[4dvh] grid h-28 w-28 place-items-center rounded-full border border-[color:var(--gold)]/55 shadow-[0_0_54px_oklch(0.82_0.16_85/.18)]">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--gold)] text-[color:var(--navy)] shadow-[0_0_34px_oklch(0.82_0.16_85/.45)]"><Check className="h-7 w-7" strokeWidth={3} /></div>
        </div>
        <p className="mt-7 font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.24em] text-[color:var(--gold)]">Palm captured</p>
        <h2 className="mt-3 max-w-[14ch] font-[family-name:var(--font-display)] text-[26px] font-black leading-[1.04] text-[color:var(--primary-foreground)]">{name || "Your"} scan is ready to decode</h2>
        <p className="mt-5 max-w-[31ch] font-[family-name:var(--font-serif-body)] text-[14px] leading-[1.6] text-[color:var(--primary-foreground)]/72">
          Three dominant lines were identified: heart, life, and head. A secondary Jupiter marker suggests where your ambition meets hesitation.
        </p>
        <div className="mt-8 grid w-full grid-cols-3 gap-2">
          {[["Heart", "Deep"], ["Life", "Long"], ["Head", "Split"]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-[color:var(--primary-foreground)]/10 bg-[color:var(--primary-foreground)]/[0.055] px-2 py-4">
              <p className="font-[family-name:var(--font-display)] text-[17px] font-black text-[color:var(--gold)]">{value}</p>
              <p className="mt-1 font-[family-name:var(--font-sans)] text-[8px] font-bold uppercase tracking-[0.14em] text-[color:var(--primary-foreground)]/52">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-auto max-w-[28ch] font-[family-name:var(--font-sans)] text-[9px] font-bold uppercase tracking-[0.16em] text-[color:var(--primary-foreground)]/44">Full palm interpretation is added to Chapter 11</p>
      </div>
    </Page>
  );
}

function ChapterList({ name }: { name: string }) {
  return (
    <Page>
      <BookHeader left="Your personal book" right="15 chapters" />
      <div className="flex h-full min-h-0 flex-col px-6 pb-6 pt-1">
        <h2 className="font-[family-name:var(--font-display)] text-[24px] font-black leading-[1.05] text-[color:var(--navy)]">What waits inside{name ? `, ${name}` : ""}</h2>
        <p className="mt-2 font-[family-name:var(--font-serif-body)] text-[12.5px] italic leading-snug text-[color:var(--paper-muted)]">A complete book built from your birth date, name, palm layer, and current timing cycle.</p>
        <ol className="mt-4 min-h-0 flex-1 space-y-1.5 overflow-hidden">
          {CHAPTERS.map(([n, title, sub], i) => (
            <li key={n} className="grid grid-cols-[32px_minmax(0,1fr)] gap-2 border-b border-[color:var(--paper-ink)]/9 pb-1.5 last:border-b-0">
              <span className="font-[family-name:var(--font-display)] text-[12px] font-black text-[color:var(--gold)]">{n}</span>
              <div className="min-w-0">
                <p className="truncate font-[family-name:var(--font-display)] text-[13px] font-black leading-tight text-[color:var(--navy)]">
                  {i === 1 && name ? `${title} — how ${name} arrives` : i === 11 && name ? `${name}'s ${title}` : title}
                </p>
                <p className="truncate font-[family-name:var(--font-serif-body)] text-[10.8px] italic leading-tight text-[color:var(--paper-muted)]">{sub}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
}

function FinalPage({ name, onContinue }: { name: string; onContinue: () => void }) {
  return (
    <Page tone="cover">
      <div className="flex h-full flex-col items-center justify-center px-8 py-10 text-center">
        <p className="font-[family-name:var(--font-sans)] text-[9px] font-black uppercase tracking-[0.28em] text-[color:var(--gold)]">Ready</p>
        <h2 className="mt-4 max-w-[13ch] font-[family-name:var(--font-display)] text-[30px] font-black leading-[1.02] text-[color:var(--primary-foreground)]">Unlock {name ? `${name}'s` : "your"} full Blueprint</h2>
        <p className="mt-5 max-w-[29ch] font-[family-name:var(--font-serif-body)] text-[14px] leading-[1.58] text-[color:var(--primary-foreground)]/72">15 chapters, palm reading result, dated windows, compatibility map, and one closing letter written only for you.</p>
        <div className="mt-8 rounded-full border border-[color:var(--gold)]/28 px-5 py-2 font-[family-name:var(--font-sans)] text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--gold)]">One-time access · $19</div>
        <button type="button" onClick={onContinue} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-4 font-[family-name:var(--font-sans)] text-[12px] font-black uppercase tracking-[0.16em] text-[color:var(--navy)] shadow-[0_14px_34px_oklch(0.82_0.16_85/.34)]">
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
    <TextPage key="text-1" name={name} dob={dob} lp={lp} ex={ex} paragraph={narrative} />,
    <IllustrationPage key="illustration" lp={lp} />,
    <TextPage key="text-2" name={name} dob={dob} lp={lp} ex={ex} paragraph={narrative} second />,
    <CoreFrame key="core" name={name} lp={lp} ex={ex} />,
    <PalmScan key="palm" onCaptured={() => pager.goTo(6)} />,
    <ScanResult key="scan-result" name={name} />,
    <ChapterList key="chapters" name={name} />,
    <FinalPage key="final" name={name} onContinue={onContinue} />,
  ];

  return (
    <div className="quiz-fade-in -mx-5 -mb-8 -mt-6 h-[100dvh] min-h-[640px] overflow-hidden bg-[color:var(--paper)] select-none">
      <div
        className="relative h-full overflow-hidden touch-pan-y"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("[data-no-drag],button,input")) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          pager.begin(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => pager.move(event.clientX, event.clientY)}
        onPointerUp={pager.end}
        onPointerCancel={pager.end}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `translate3d(calc(${-pager.index * 100}% + ${pager.dragX}px),0,0)` }}
        >
          {pages}
        </div>

        <button
          type="button"
          aria-label="Previous page"
          onClick={() => pager.goTo(pager.index - 1)}
          disabled={pager.index === 0}
          className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[color:var(--background)]/65 text-[color:var(--navy)] shadow-card backdrop-blur disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next page"
          onClick={() => pager.goTo(pager.index + 1)}
          disabled={pager.index === pages.length - 1}
          className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[color:var(--background)]/65 text-[color:var(--navy)] shadow-card backdrop-blur disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
          {pages.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === pager.index ? "w-6 bg-[color:var(--gold)]" : "w-1.5 bg-[color:var(--paper-ink)]/22"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}