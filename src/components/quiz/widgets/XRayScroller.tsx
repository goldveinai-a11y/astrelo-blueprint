import reportCover from "@/assets/quiz/report-cover.jpg";

const fakeBlurredText = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore.";

// Тизеры на конкретных страницах
const TEASERS: Record<number, { label: string; headline: string; sub: string; color: string }> = {
  1: {
    label: "Life Path",
    headline: "The number that governs every major decision you'll make this year",
    sub: "Including the one you've been putting off",
    color: "border-gold",
  },
  4: {
    label: "Wealth Pattern",
    headline: "Your financial ceiling — and the exact cycle it breaks",
    sub: "Most people miss this window by 3–4 months",
    color: "border-violet",
  },
  8: {
    label: "Karmic Block",
    headline: "The inherited pattern silently shaping your relationships & income",
    sub: "Active since before you were born",
    color: "border-gold",
  },
  12: {
    label: "90-Day Windows",
    headline: "Three dates in the next 90 days when your actions land 2× harder",
    sub: "One of them is less than 30 days away",
    color: "border-violet",
  },
  16: {
    label: "Love Codes",
    headline: "Your harmony numbers — and the one combination that never works for you",
    sub: "Decoded from your birth date alone",
    color: "border-gold",
  },
};

function PieChart() {
  const r = 38;
  const c = 2 * Math.PI * r;
  const filled = c * 0.89;
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24">
      <circle cx="50" cy="50" r={r} fill="none" stroke="oklch(0.92 0.015 260)" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none" stroke="var(--gold)" strokeWidth="10"
        strokeDasharray={`${filled} ${c}`} strokeDashoffset={c / 4}
        transform="rotate(-90 50 50)" strokeLinecap="round"
      />
      <text x="50" y="48" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--navy)">89%</text>
      <text x="50" y="62" textAnchor="middle" fontSize="7" fill="var(--muted-foreground)">ALIGNMENT</text>
    </svg>
  );
}

export function XRayScroller({ name }: { name: string }) {
  const pages = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <div className="-mx-5">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Cover card */}
        <div className="snap-center shrink-0 w-56 overflow-hidden rounded-2xl border border-border bg-cosmic shadow-card">
          <div className="relative">
            <img src={reportCover} alt="Report cover" loading="lazy" className="h-72 w-full object-cover" />
            <div
              className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-4 pt-8"
              style={{ background: "linear-gradient(to top, rgba(10,24,59,0.85) 60%, transparent)" }}
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Personal Blueprint</p>
              <p
                className="mt-0.5 text-center text-sm font-bold leading-tight"
                style={{ color: "var(--gold)", textShadow: "0 0 12px rgba(243,186,37,0.6)" }}
              >
                {name}
              </p>
            </div>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/70">Astrelo Numerology</p>
            <p className="mt-1 text-sm font-bold text-white">{name}'s 10-Chapter Blueprint</p>
          </div>
        </div>

        {/* Inner pages */}
        {pages.map((p) => {
          const teaser = TEASERS[p];
          return (
            <div
              key={p}
              className="relative snap-center shrink-0 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-card"
            >
              <div className="h-full p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Page {p}</p>
                <p className="blur-page mt-2 text-sm font-semibold text-foreground">
                  {teaser ? teaser.label : "Personal Matrix Insight"}
                </p>
                <p className="blur-page mt-2 text-[11px] leading-snug text-muted-foreground">{fakeBlurredText}</p>
                <p className="blur-page mt-2 text-[11px] leading-snug text-muted-foreground">{fakeBlurredText}</p>
              </div>

              {/* Teaser overlay */}
              {teaser && (
                <div
                  className={`absolute inset-x-3 top-16 rounded-xl border-2 ${teaser.color} bg-card p-3 shadow-glow`}
                >
                  <p className="text-[9px] font-bold uppercase tracking-widest text-navy">{teaser.label}</p>
                  <p className="mt-1.5 text-[12px] font-bold leading-snug text-navy">{teaser.headline}</p>
                  <p className="mt-1 text-[10px] leading-snug text-muted-foreground italic">{teaser.sub}</p>
                </div>
              )}

              {/* Extra: page 4 chart */}
              {p === 4 && (
                <div className="absolute inset-x-3 bottom-4 flex justify-center">
                  <PieChart />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="px-5 text-center text-xs text-muted-foreground">← Swipe to preview your blueprint →</p>
    </div>
  );
}
