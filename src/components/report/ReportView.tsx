import { formatLongDate, formatShortDate } from "@/lib/quiz/numerology";
import type { Report } from "@/lib/report/buildReport";
import { EXPRESSION_COPY, SOUL_URGE_COPY, PERSONALITY_COPY } from "@/lib/report/copy";

const Section = ({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mx-auto w-full max-w-3xl rounded-3xl border border-gold/20 bg-navy/40 p-8 backdrop-blur-sm">
    <div className="mb-6 flex items-baseline justify-between border-b border-gold/20 pb-3">
      <span className="text-xs uppercase tracking-[0.3em] text-gold/70">{index}</span>
      <h2 className="font-display text-2xl text-white sm:text-3xl">{title}</h2>
    </div>
    <div className="space-y-4 text-white/90 leading-relaxed">{children}</div>
  </section>
);

const NumberCard = ({
  label,
  number,
  caption,
}: {
  label: string;
  number: number;
  caption?: string;
}) => (
  <div className="flex flex-col items-center rounded-2xl border border-gold/30 bg-gradient-to-br from-violet/30 to-navy/60 p-5 text-center">
    <span className="text-xs uppercase tracking-widest text-gold/80">{label}</span>
    <span className="my-2 font-display text-5xl text-gold drop-shadow-[0_0_18px_rgba(255,215,0,0.4)]">
      {number}
    </span>
    {caption && <span className="text-xs text-white/70">{caption}</span>}
  </div>
);

export function ReportView({ report }: { report: Report }) {
  const { meta, core, karmic, cycles, windows, compatibility, copy } = report;
  const dobDate = new Date(meta.dob.year, meta.dob.month - 1, meta.dob.day);

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy via-[#0A1A38] to-black px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Cover */}
        <header className="rounded-3xl border border-gold/30 bg-gradient-to-br from-violet/30 via-navy/60 to-black p-10 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-gold/80">Astrelo Numerology Blueprint</p>
          <h1 className="mt-4 font-display text-4xl text-white sm:text-5xl">{meta.fullName}</h1>
          <p className="mt-2 text-white/70">Born {formatLongDate(dobDate)}</p>
          <p className="mt-1 text-xs text-white/50">Generated {formatLongDate(meta.generatedAt)}</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumberCard label="Life Path" number={core.lifePath} caption={copy.lifePath.title} />
            <NumberCard label="Expression" number={core.expression} />
            <NumberCard label="Soul Urge" number={core.soulUrge} />
            <NumberCard label="Personality" number={core.personality} />
          </div>
        </header>

        {/* 01 — Life Path */}
        <Section index="01 / Core" title={`Life Path ${core.lifePath} — ${copy.lifePath.title}`}>
          <p className="text-lg italic text-gold/90">"{copy.lifePath.essence}"</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm uppercase tracking-widest text-gold/80">Strengths</h3>
              <ul className="space-y-1">
                {copy.lifePath.strengths.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm uppercase tracking-widest text-gold/80">Shadow patterns</h3>
              <ul className="space-y-1">
                {copy.lifePath.shadows.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="border-l-2 border-gold/60 pl-4">{copy.lifePath.guidance}</p>
        </Section>

        {/* 02 — Expression */}
        <Section index="02 / Core" title={`Expression ${core.expression} — What You're Built to Do`}>
          {(() => {
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
          })()}
        </Section>

        {/* 03 — Soul Urge */}
        <Section index="03 / Core" title={`Soul Urge ${core.soulUrge} — What Your Heart Actually Wants`}>
          {(() => {
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
          })()}
        </Section>

        {/* 04 — Personality */}
        <Section index="04 / Core" title={`Personality ${core.personality} — How the World Meets You`}>
          {(() => {
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
          })()}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <NumberCard label="Birth Day" number={core.birthDay} />
            <NumberCard label="Maturity" number={core.maturity} caption="active after age 35" />
          </div>
        </Section>

        {/* 05 — Karmic */}
        <Section index="05 / Karmic Layer" title="Your Karmic Architecture">
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
                <li key={l.number} className="rounded-xl border border-gold/15 bg-navy/40 p-3">
                  <strong className="text-gold">Lesson {l.number}.</strong>{" "}
                  <span className="text-sm">{l.text}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* 06 — Personal Year */}
        <Section index="06 / Cycles" title={`${cycles.personalYear} — ${copy.personalYear.title}`}>
          <p className="text-lg italic text-gold/90">{copy.personalYear.energy}</p>
          <p>{copy.personalYear.focus}</p>
          <h3 className="mt-6 text-sm uppercase tracking-widest text-gold/80">Next 12 months</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {cycles.months.map((m) => (
              <div key={m.label} className="flex items-center justify-between rounded-xl border border-gold/15 bg-navy/30 px-4 py-2">
                <span className="text-sm">{m.label}</span>
                <span className="flex items-center gap-3">
                  <span className="font-display text-lg text-gold">{m.number}</span>
                  <span className="text-xs text-white/60">{m.theme}</span>
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* 07 — Pinnacles */}
        <Section index="07 / Cycles" title="Pinnacles & Challenges">
          <p className="text-sm text-white/80">
            Life moves in four major chapters. Each Pinnacle is a guiding energy; each Challenge is the lesson it offers in exchange.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {cycles.pinnacles.map((p, i) => (
              <div key={i} className="rounded-2xl border border-gold/20 bg-navy/40 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-widest text-gold/70">Pinnacle {i + 1}</span>
                  <span className="font-display text-3xl text-gold">{p.number}</span>
                </div>
                <p className="mt-1 text-sm text-white/70">
                  Ages {p.startAge}–{p.endAge === 99 ? "end" : p.endAge}
                  <br />
                  <span className="text-xs">{p.startYear} → {p.endYear === meta.dob.year + 99 ? "present" : p.endYear}</span>
                </p>
                <p className="mt-2 text-xs text-magenta/90">Challenge {i + 1}: {cycles.challenges[i].number}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 08 — Energetic Windows */}
        <Section index="08 / Timing" title="Your 90-Day Energetic Windows">
          <p className="text-sm text-white/80">
            Days where your Personal Day resonates with your Life Path. Use them — your effort moves twice as far on these dates.
          </p>
          {(["wealth", "love", "decision"] as const).map((kind) => {
            const list = windows[kind];
            if (list.length === 0) return null;
            return (
              <div key={kind} className="rounded-2xl border border-gold/20 bg-navy/40 p-4">
                <h3 className="mb-3 text-sm uppercase tracking-widest text-gold/80">
                  {kind === "wealth" ? "💰 Wealth & Negotiation" : kind === "love" ? "❤️ Love & Connection" : "🧭 Big Decisions"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {list.map((w, i) => (
                    <span key={i} className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-white">
                      {formatShortDate(w.date)} · PD {w.personalDay}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </Section>

        {/* 09 — Compatibility */}
        <Section index="09 / Relationships" title="Your Compatibility Map">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4">
              <h3 className="text-sm uppercase tracking-widest text-emerald-300">Harmony</h3>
              <p className="mt-2 font-display text-2xl text-white">{compatibility.harmony.join(" · ")}</p>
              <p className="mt-2 text-xs text-white/70">Natural ease.</p>
            </div>
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4">
              <h3 className="text-sm uppercase tracking-widest text-gold">Growth</h3>
              <p className="mt-2 font-display text-2xl text-white">{compatibility.growth.join(" · ")}</p>
              <p className="mt-2 text-xs text-white/70">Mirror dynamics.</p>
            </div>
            <div className="rounded-2xl border border-magenta/30 bg-magenta/5 p-4">
              <h3 className="text-sm uppercase tracking-widest text-magenta">Tension</h3>
              <p className="mt-2 font-display text-2xl text-white">{compatibility.tension.join(" · ")}</p>
              <p className="mt-2 text-xs text-white/70">Possible with explicit comms.</p>
            </div>
          </div>
        </Section>

        {/* 10 — Closing */}
        <Section index="10 / Closing" title="Your Affirmation for This Year">
          <p className="text-center font-display text-2xl italic text-gold sm:text-3xl">
            "I move with the rhythm I was born to. Every number in this blueprint is on my side."
          </p>
          <p className="mt-6 text-center text-xs text-white/60">
            Astrelo · numerology.astrelo.net · Generated {formatLongDate(meta.generatedAt)}
          </p>
        </Section>
      </div>
    </div>
  );
}
