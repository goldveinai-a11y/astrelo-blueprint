import { useEffect, useState } from "react";

export type TeaserPayload = {
  name: string;
  dobDay: number;
  dobMonth: number;
  dobYear: number;
  zodiac: string;
  lifePathNum: number;
  focus: string;
  relationship: string;
  karma: string;
  financialStress: number;
};

export function AILoader({
  name,
  onDone,
  teaserPayload,
  onTeaserReady,
}: {
  name: string;
  onDone: () => void;
  teaserPayload?: TeaserPayload;
  onTeaserReady?: (paragraph: string) => void;
}) {
  const stages = [
    { p: 12, t: `Isolating your Life Path Number for ${name}…` },
    { p: 38, t: "Building the Pythagorean Square Matrix…" },
    { p: 67, t: "Cross-referencing financial stress with Karmic Debt cycles…" },
    { p: 100, t: `Success! Your Numerology Blueprint for ${name} is ready.` },
  ];
  const [step, setStep] = useState(0);

  // Fire teaser generation immediately on mount — runs in background during animation
  useEffect(() => {
    if (!teaserPayload || !onTeaserReady) return;
    fetch("/api/public/generate-teaser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teaserPayload),
    })
      .then((r) => r.json())
      .then((data: { paragraph?: string }) => {
        if (data.paragraph) onTeaserReady(data.paragraph);
      })
      .catch(() => {
        // Fallback: empty string — BarnumReveal handles gracefully
        onTeaserReady("");
      });
  }, []);

  useEffect(() => {
    if (step >= stages.length) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep(step + 1), 1700);
    return () => clearTimeout(t);
  }, [step]);

  const cur = stages[Math.min(step, stages.length - 1)];

  return (
    <div className="flex flex-col items-center gap-8 py-8 text-center">
      <div className="relative h-44 w-44">
        <div
          className="matrix-spin absolute inset-0 rounded-full"
          style={{ background: "conic-gradient(from 0deg, transparent, var(--violet), var(--magenta), var(--gold), transparent)", filter: "blur(2px)" }}
        />
        <div className="absolute inset-3 flex items-center justify-center rounded-full bg-card">
          <svg viewBox="0 0 100 100" className="h-32 w-32" style={{ color: "var(--violet)" }}>
            <polygon points="50,5 95,28 95,72 50,95 5,72 5,28" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            <polygon points="50,18 82,34 82,66 50,82 18,66 18,34" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <circle cx="50" cy="50" r="14" fill="var(--gold)" opacity="0.85" />
            <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--navy)">{cur.p}%</text>
          </svg>
        </div>
      </div>
      <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cur.p}%`, background: "var(--gradient-cosmic)" }} />
      </div>
      <p key={cur.t} className="quiz-fade-in min-h-[3rem] max-w-sm text-sm font-medium text-muted-foreground">
        {cur.t}
      </p>
    </div>
  );
}
