import { formatLongDate, formatShortDate } from "@/lib/quiz/numerology";
import type { Report } from "@/lib/report/buildReport";
import { EXPRESSION_COPY, SOUL_URGE_COPY, PERSONALITY_COPY } from "@/lib/report/copy";

export type Tier = "core" | "popular" | "ultimate";

export type GeneratedNarrative = {
  "life-path": string;
  "expression": string;
  "soul-urge": string;
  "personality": string;
  "karmic": string;
  "windows": string;
  "forecast": string;
  "pinnacles": string;
  "love": string;
  "closing": string;
};

const NarrativeBlock = ({ text }: { text: string }) => (
  <p className="text-white/90 leading-relaxed">{text}</p>
);

const CHAPTERS = [
  { n: "01", id: "life-path", title: "Life Path" },
  { n: "02", id: "expression", title: "Expression" },
  { n: "03", id: "soul-urge", title: "Soul Urge" },
  { n: "04", id: "personality", title: "Personality" },
  { n: "05", id: "karmic", title: "Karmic Architecture" },
  { n: "06", id: "windows", title: "Energetic Windows" },
  { n: "07", id: "forecast", title: "2026 Forecast", lockedFor: ["core", "popular"] },
  { n: "08", id: "pinnacles", title: "Pinnacles & Challenges" },
  { n: "09", id: "love", title: "Love Compatibility", lockedFor: ["core"] },
  { n: "10", id: "closing", title: "Your Affirmation" },
];

const Chapter = ({
  n,
  id,
  title,
  children,
}: {
  n: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="mx-auto w-full max-w-3xl rounded-3xl border border-gold/20 bg-navy/40 p-8 backdrop-blur-sm scroll-mt-6">
    <div className="mb-6 flex items-baseline justify-between border-b border-gold/20 pb-3">
      <span className="text-xs uppercase tracking-[0.3em] text-gold/70">Chapter {n}</span>
      <h2 className="font-display text-2xl text-white sm:text-3xl">{title}</h2>
    </div>
    <div className="space-y-4 text-white/90 leading-relaxed">{children}</div>
  </section>
);

const LockedChapter = ({ n, title, reason }: { n: string; title: string; reason: string }) => (
  <section className="mx-auto w-full max-w-3xl rounded-3xl border border-gold/10 bg-navy/20 p-8 opacity-60">
    <div className="flex items-center gap-3">
      <span className="text-2xl">🔒</span>
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-gold/50">Chapter {n}</span>
        <h2 className="font-display text-xl text-white/60">{title}</h2>
        <p className="text-xs text-white/40 mt-1">{reason}</p>
      </div>
    </div>
  </section>
);

const NumberRing = ({
  label,
  number,
  caption,
  size = "md",
}: {
  label: string;
  number: number;
  caption?: string;
  size?: "md" | "lg";
}) => (
  <div className="flex flex-col items-center">
    <div
      className={`relative flex items-center justify-center rounded-full border-2 border-gold/50 bg-gradient-to-br from-violet/30 to-navy/80 ${
        size === "lg" ? "h-28 w-28" : "h-20 w-20"
      }`}
      style={{ boxShadow: "0 0 24px rgba(255,215,0,0.25), inset 0 0 20px rgba(155,109,255,0.15)" }}
    >
      <span className={`font-display text-gold ${size === "lg" ? "text-5xl" : "text-3xl"}`}>{number}</span>
    </div>
    <span className="mt-2 text-xs uppercase tracking-widest text-gold/80">{label}</span>
    {caption && <span className="text-[10px] text-white/50 text-center max-w-[7rem]">{caption}</span>}
  </div>
);

const CORE_COLORS: Record<string, string> = {
  lifePath: "#FFD700",
  expression: "#9B6DFF",
  soulUrge: "#EC4899",
  personality: "#5EEAD4",
};

const RadialNumberWheel = ({
  lifePath,
  expression,
  soulUrge,
  personality,
}: {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
}) => {
  const items = [
    { key: "lifePath", label: "Life Path", value: lifePath, color: CORE_COLORS.lifePath },
    { key: "expression", label: "Expression", value: expression, color: CORE_COLORS.expression },
    { key: "soulUrge", label: "Soul Urge", value: soulUrge, color: CORE_COLORS.soulUrge },
    { key: "personality", label: "Personality", value: personality, color: CORE_COLORS.personality },
  ];
  const cx = 130;
  const cy = 130;
  const rOuter = 118;
  const rInner = 72;
  const gapDeg = 3;

  const polarToXY = (r: number, angleDeg: number) => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const arcPath = (r0: number, r1: number, startDeg: number, endDeg: number) => {
    const [x0s, y0s] = polarToXY(r0, startDeg);
    const [x0e, y0e] = polarToXY(r0, endDeg);
    const [x1e, y1e] = polarToXY(r1, endDeg);
    const [x1s, y1s] = polarToXY(r1, startDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x0s} ${y0s} A ${r0} ${r0} 0 ${large} 1 ${x0e} ${y0e} L ${x1e} ${y1e} A ${r1} ${r1} 0 ${large} 0 ${x1s} ${y1s} Z`;
  };

  return (
    <div className="relative mx-auto" style={{ width: 260, height: 260 }}>
      <svg width={260} height={260} viewBox="0 0 260 260">
        <defs>
          <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {items.map((it, i) => {
          const seg = 360 / items.length;
          const start = i * seg + gapDeg / 2;
          const end = (i + 1) * seg - gapDeg / 2;
          const [lx, ly] = polarToXY((rOuter + rInner) / 2, (start + end) / 2);
          return (
            <g key={it.key}>
              <path d={arcPath(rInner, rOuter, start, end)} fill={it.color} fillOpacity={0.22} stroke={it.color} strokeOpacity={0.6} strokeWidth={1} filter="url(#ringGlow)" />
              <text x={lx} y={ly - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill={it.color} fontFamily="serif">
                {it.value}
              </text>
              <text x={lx} y={ly + 11} textAnchor="middle" fontSize="6.5" letterSpacing="0.5" fill="rgba(255,255,255,0.6)" style={{ textTransform: "uppercase" }}>
                {it.label}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={rInner - 4} fill="rgba(10,26,56,0.6)" stroke="rgba(255,215,0,0.25)" strokeWidth={1} />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[9px] uppercase tracking-[0.25em] text-gold/60">Core</span>
        <span className="text-[9px] uppercase tracking-[0.25em] text-gold/60">Blueprint</span>
      </div>
    </div>
  );
};

const CoverConstellation = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
    viewBox="0 0 400 220"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
      </radialGradient>
    </defs>
    <g stroke="rgba(255,215,0,0.25)" strokeWidth="0.6" fill="none">
      <ellipse cx="200" cy="110" rx="170" ry="70" />
      <ellipse cx="200" cy="110" rx="120" ry="48" />
      <ellipse cx="200" cy="110" rx="70" ry="26" />
    </g>
    {[
      [30, 60], [80, 30], [140, 150], [200, 20], [260, 140],
      [320, 50], [370, 100], [60, 170], [350, 180], [200, 110],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.4 : 1.3} fill="url(#starGlow)" />
    ))}
  </svg>
);

const PersonalYearScale = ({ year }: { year: number }) => {
  const labels: Record<number, string> = {
    1: "Begin", 2: "Pair", 3: "Express", 4: "Build", 5: "Shift",
    6: "Care", 7: "Reflect", 8: "Harvest", 9: "Release",
  };
  const pct = ((year - 1) / 8) * 100;
  return (
    <div className="mt-2">
      <div className="relative h-2 w-full rounded-full bg-navy/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet to-gold"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute -top-1.5 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-gold bg-navy font-display text-[10px] text-gold shadow-[0_0_10px_rgba(255,215,0,0.6)]"
          style={{ left: `${pct}%` }}
        >
          {year}
        </div>
      </div>
      <div className="mt-3 flex justify-between text-[9px] uppercase tracking-wide text-white/40">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className={n === year ? "text-gold font-semibold" : ""}>
            {labels[n]}
          </span>
        ))}
      </div>
    </div>
  );
};

const CompatibilitySpectrum = ({
  harmony,
  growth,
  tension,
  partnerName,
}: {
  harmony: number[];
  growth: number[];
  tension: number[];
  partnerName?: string;
}) => {
  const rows: { label: string; nums: number[]; color: string; glow: string; pct: number; desc: string }[] = [
    { label: "Harmony", nums: harmony, color: "#34D399", glow: "rgba(52,211,153,0.5)", pct: 88, desc: "Natural ease — you don't have to translate yourself." },
    { label: "Growth", nums: growth, color: "#FFD700", glow: "rgba(255,215,0,0.5)", pct: 60, desc: "Mirror dynamic — friction points to the work, not the wrong person." },
    { label: "Tension", nums: tension, color: "#EC4899", glow: "rgba(236,72,153,0.5)", pct: 32, desc: "Different operating systems — possible with explicit communication." },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-magenta/30 bg-gradient-to-br from-magenta/10 via-navy/60 to-violet/10 p-6">
      <div className="mb-6 flex items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/60 bg-navy/80 font-display text-2xl text-gold shadow-[0_0_18px_rgba(255,215,0,0.35)]">
          ❤
        </div>
        {partnerName && (
          <>
            <div className="h-px w-10 bg-gradient-to-r from-gold/60 to-magenta/60" />
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-magenta/60 bg-navy/80 text-center font-display text-xs text-magenta shadow-[0_0_18px_rgba(236,72,153,0.35)]">
              {partnerName.split(" ")[0]}
            </div>
          </>
        )}
      </div>

      <div className="space-y-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.2em]" style={{ color: r.color }}>
                {r.label}
              </span>
              <span className="font-display text-lg text-white">{r.nums.join(" · ")}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-navy/70">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${r.pct}%`,
                  background: r.color,
                  boxShadow: `0 0 10px ${r.glow}`,
                }}
              />
            </div>
            <p className="mt-1.5 text-xs text-white/60">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const TableOfContents = ({ tier }: { tier: Tier }) => (
  <nav className="mx-auto w-full max-w-3xl rounded-3xl border border-gold/20 bg-navy/30 p-8">
    <p className="mb-5 text-xs uppercase tracking-[0.3em] text-gold/70">Table of Contents</p>
    <ol className="space-y-1">
      {CHAPTERS.map((c) => {
        const locked = c.lockedFor?.includes(tier);
        return (
          <li key={c.n}>
            {locked ? (
              <span className="flex items-center justify-between border-b border-white/5 py-2 text-white/40">
                <span>{c.n} · {c.title}</span>
                <span className="text-xs">🔒</span>
              </span>
            ) : (
              <a
                href={`#${c.id}`}
                className="flex items-center justify-between border-b border-white/10 py-2 text-white/85 hover:text-gold transition-colors"
              >
                <span>{c.n} · {c.title}</span>
                <span className="text-xs text-gold/50">→</span>
              </a>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export function ReportView({
  report,
  tier = "core",
  partnerName,
  narrative,
}: {
  report: Report;
  tier?: Tier;
  partnerName?: string;
  narrative?: GeneratedNarrative;
}) {
  const { meta, core, karmic, cycles, windows, compatibility, copy } = report;
  const dobDate = new Date(meta.dob.year, meta.dob.month - 1, meta.dob.day);

  const hasLove = tier === "popular" || tier === "ultimate";
  const hasForecast = tier === "ultimate";

  const allWindows = [
    ...windows.wealth.map((w) => ({ ...w, kind: "wealth" as const })),
    ...windows.love.map((w) => ({ ...w, kind: "love" as const })),
    ...windows.decision.map((w) => ({ ...w, kind: "decision" as const })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const kindMeta = {
    wealth: { icon: "💰", color: "border-gold/50 bg-gold/10 text-gold" },
    love: { icon: "❤️", color: "border-magenta/50 bg-magenta/10 text-magenta" },
    decision: { icon: "🧭", color: "border-violet/50 bg-violet/10 text-violet" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy via-[#0A1A38] to-black px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Cover */}
        <header className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-violet/30 via-navy/60 to-black p-10 text-center">
          <CoverConstellation />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.4em] text-gold/80">Astrelo</p>
            <p className="mt-1 font-display text-lg text-white/70">The Numerology Blueprint of</p>
            <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">{meta.fullName}</h1>
            <p className="mt-3 text-white/70">Born {formatLongDate(dobDate)}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-gold/60">
              {tier === "core" ? "Core Edition" : tier === "popular" ? "Core + Love Edition" : "Ultimate Edition"}
            </p>
            <div className="mt-6">
              <RadialNumberWheel
                lifePath={core.lifePath}
                expression={core.expression}
                soulUrge={core.soulUrge}
                personality={core.personality}
              />
            </div>
          </div>
        </header>

        <TableOfContents tier={tier} />

        {/* 01 — Life Path */}
        <Chapter n="01" id="life-path" title={`Life Path ${core.lifePath} — ${copy.lifePath.title}`}>
          {narrative?.["life-path"] ? (
            <NarrativeBlock text={narrative["life-path"]} />
          ) : (
            <>
              <p className="text-lg italic text-gold/90">"{copy.lifePath.essence}"</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm uppercase tracking-widest text-gold/80">Strengths</h3>
                  <ul className="space-y-1">
                    {copy.lifePath.strengths.map((s) => (<li key={s}>• {s}</li>))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-sm uppercase tracking-widest text-gold/80">Shadow patterns</h3>
                  <ul className="space-y-1">
                    {copy.lifePath.shadows.map((s) => (<li key={s}>• {s}</li>))}
                  </ul>
                </div>
              </div>
              <p className="border-l-2 border-gold/60 pl-4">{copy.lifePath.guidance}</p>
            </>
          )}
        </Chapter>

        {/* 02 — Expression */}
        <Chapter n="02" id="expression" title={`Expression ${core.expression} — What You're Built to Do`}>
          {narrative?.expression ? (
            <NarrativeBlock text={narrative.expression} />
          ) : (
            (() => {
              const ec = EXPRESSION_COPY[core.expression] ?? EXPRESSION_COPY[1];
              return (
                <>
                  <p className="text-lg italic text-gold/90">"{ec.essence}"</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gold/20 bg-navy/40 p-4">
                      <h3 className="mb-2 text-sm uppercase tracking-widest text-gold/80">Shadow pattern</h3>
                      <p className="text-sm text-white/80">{ec.shadow}</p>
                    </div>
                    <div className="rounded-2xl border border-gold/20 bg-navy/40 p-4">
                      <h3 className="mb-2 text-sm uppercase tracking-widest text-gold/80">Guidance</h3>
                      <p className="text-sm text-white/80">{ec.guidance}</p>
                    </div>
                  </div>
                </>
              );
            })()
          )}
        </Chapter>

        {/* 03 — Soul Urge */}
        <Chapter n="03" id="soul-urge" title={`Soul Urge ${core.soulUrge} — What Your Heart Actually Wants`}>
          {narrative?.["soul-urge"] ? (
            <NarrativeBlock text={narrative["soul-urge"]} />
          ) : (
            (() => {
              const sc = SOUL_URGE_COPY[core.soulUrge] ?? SOUL_URGE_COPY[1];
              return (
                <>
                  <p className="text-lg italic text-gold/90">"{sc.essence}"</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-magenta/20 bg-magenta/5 p-4">
                      <h3 className="mb-2 text-sm uppercase tracking-widest text-magenta/80">Hidden shadow</h3>
                      <p className="text-sm text-white/80">{sc.shadow}</p>
                    </div>
                    <div className="rounded-2xl border border-gold/20 bg-navy/40 p-4">
                      <h3 className="mb-2 text-sm uppercase tracking-widest text-gold/80">Guidance</h3>
                      <p className="text-sm text-white/80">{sc.guidance}</p>
                    </div>
                  </div>
                </>
              );
            })()
          )}
        </Chapter>

        {/* 04 — Personality */}
        <Chapter n="04" id="personality" title={`Personality ${core.personality} — How the World Meets You`}>
          {narrative?.personality ? (
            <NarrativeBlock text={narrative.personality} />
          ) : (
            (() => {
              const pc = PERSONALITY_COPY[core.personality] ?? PERSONALITY_COPY[1];
              return (
                <>
                  <p className="text-lg italic text-gold/90">"{pc.essence}"</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gold/20 bg-navy/40 p-4">
                      <h3 className="mb-2 text-sm uppercase tracking-widest text-gold/80">The blind spot</h3>
                      <p className="text-sm text-white/80">{pc.shadow}</p>
                    </div>
                    <div className="rounded-2xl border border-gold/20 bg-navy/40 p-4">
                      <h3 className="mb-2 text-sm uppercase tracking-widest text-gold/80">Guidance</h3>
                      <p className="text-sm text-white/80">{pc.guidance}</p>
                    </div>
                  </div>
                </>
              );
            })()
          )}
          <div className="mt-4 flex justify-center gap-8">
            <NumberRing label="Birth Day" number={core.birthDay} />
            <NumberRing label="Maturity" number={core.maturity} caption="active after age 35" />
          </div>
        </Chapter>

        {/* 05 — Karmic */}
        <Chapter n="05" id="karmic" title="Your Karmic Architecture">
          {narrative?.karmic && <NarrativeBlock text={narrative.karmic} />}
          {copy.karmicDebt ? (
            <div className="rounded-2xl border border-magenta/40 bg-magenta/10 p-5">
              <h3 className="font-display text-xl text-gold">{copy.karmicDebt.title}</h3>
              <p className="mt-2 text-sm text-white/80"><strong>Theme:</strong> {copy.karmicDebt.theme}</p>
              <p className="mt-2">{copy.karmicDebt.lesson}</p>
            </div>
          ) : (
            <p className="rounded-2xl border border-gold/20 bg-navy/60 p-5 text-white/80">
              No active karmic debt detected in your birth date. You're carrying a clean slate at the structural level.
            </p>
          )}
          <h3 className="mt-6 text-sm uppercase tracking-widest text-gold/80">
            Karmic Lessons {karmic.lessons.length === 0 ? "— none" : `(${karmic.lessons.length})`}
          </h3>
          {karmic.lessons.length === 0 ? (
            <p className="text-sm text-white/70">All nine numerical energies are present in your name. Rare and balanced.</p>
          ) : (
            <ul className="space-y-2">
              {copy.karmicLessons.map((l) => (
                <li key={l.number} className="flex gap-3 rounded-xl border border-gold/15 bg-navy/40 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 font-display text-gold">
                    {l.number}
                  </span>
                  <span className="text-sm pt-1">{l.text}</span>
                </li>
              ))}
            </ul>
          )}
        </Chapter>

        {/* 06 — Energetic Windows (timeline) */}
        <Chapter n="06" id="windows" title="Your 90-Day Energetic Windows">
          {narrative?.windows && <NarrativeBlock text={narrative.windows} />}
          <p className="text-sm text-white/80">
            Days where your Personal Day resonates with your Life Path. Use them — your effort moves twice as far on these dates.
          </p>
          <div className="relative mt-6 space-y-0">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gold/20" />
            {allWindows.map((w, i) => {
              const km = kindMeta[w.kind];
              return (
                <div key={i} className="relative flex items-center gap-4 py-2 pl-0">
                  <span className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${km.color}`}>
                    {km.icon}
                  </span>
                  <span className="text-sm text-white/85">{formatShortDate(w.date)}</span>
                  <span className="text-xs text-white/40">Personal Day {w.personalDay}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-white/50">
            <span>💰 Wealth & Negotiation</span>
            <span>❤️ Love & Connection</span>
            <span>🧭 Big Decisions</span>
          </div>
        </Chapter>

        {/* 07 — Personal Year / Forecast (Ultimate only) */}
        {hasForecast ? (
          <Chapter n="07" id="forecast" title={`Personal Year ${cycles.personalYear} — ${copy.personalYear.title}`}>
            {narrative?.forecast && <NarrativeBlock text={narrative.forecast} />}
            <p className="text-lg italic text-gold/90">{copy.personalYear.energy}</p>
            <p>{copy.personalYear.focus}</p>
            <PersonalYearScale year={cycles.personalYear} />
            <h3 className="mt-6 text-sm uppercase tracking-widest text-gold/80">Month-by-Month 2026 Forecast</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {cycles.months.map((m) => (
                <div key={m.label} className="flex items-center justify-between rounded-xl border border-gold/15 bg-navy/30 px-4 py-3">
                  <div>
                    <span className="text-sm font-medium">{m.label}</span>
                    <p className="text-xs text-white/50 mt-0.5">{m.theme}</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 font-display text-lg text-gold">
                    {m.number}
                  </span>
                </div>
              ))}
            </div>
          </Chapter>
        ) : (
          <LockedChapter n="07" title="2026 Forecast" reason="Available in the Ultimate Blueprint ($33)" />
        )}

        {/* 08 — Pinnacles (horizontal timeline) */}
        <Chapter n="08" id="pinnacles" title="Pinnacles & Challenges">
          {narrative?.pinnacles && <NarrativeBlock text={narrative.pinnacles} />}
          <p className="text-sm text-white/80">
            Life moves in four major chapters. Each Pinnacle is a guiding energy; each Challenge is the lesson it offers in exchange.
          </p>
          <div className="relative mt-8 pb-2">
            <div className="absolute left-0 right-0 top-7 h-px bg-gold/20" />
            <div className="grid grid-cols-4 gap-2">
              {cycles.pinnacles.map((p, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/50 bg-navy font-display text-2xl text-gold">
                    {p.number}
                  </span>
                  <span className="mt-2 text-[10px] uppercase tracking-widest text-gold/60">Pinnacle {i + 1}</span>
                  <span className="mt-1 text-xs text-white/60">
                    {p.startAge}–{p.endAge === 99 ? "∞" : p.endAge}
                  </span>
                  <span className="mt-1 rounded-full border border-magenta/30 bg-magenta/5 px-2 py-0.5 text-[10px] text-magenta/90">
                    Challenge {cycles.challenges[i].number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Chapter>

        {/* 09 — Love Compatibility */}
        {hasLove ? (
          <Chapter n="09" id="love" title="Your Love Compatibility Map">
            {narrative?.love && <NarrativeBlock text={narrative.love} />}
            <CompatibilitySpectrum
              harmony={compatibility.harmony}
              growth={compatibility.growth}
              tension={compatibility.tension}
              partnerName={partnerName}
            />
          </Chapter>
        ) : (
          <LockedChapter n="09" title="Love Compatibility Map" reason="Available in Core + Love ($27) and Ultimate Blueprint ($33)" />
        )}

        {/* 10 — Closing */}
        <Chapter n="10" id="closing" title="Your Affirmation for This Year">
          {narrative?.closing ? (
            <p className="text-center font-display text-2xl italic text-gold sm:text-3xl">{narrative.closing}</p>
          ) : (
            <p className="text-center font-display text-2xl italic text-gold sm:text-3xl">
              "I move with the rhythm I was born to. Every number in this blueprint is on my side."
            </p>
          )}
          <p className="mt-6 text-center text-xs text-white/60">
            Astrelo · numerology.astrelo.net · Generated {formatLongDate(meta.generatedAt)}
          </p>
        </Chapter>
      </div>
    </div>
  );
}
