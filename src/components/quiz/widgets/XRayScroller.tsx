import reportCover from "@/assets/quiz/report-cover.jpg";

const fakeBlurredText = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore.";

function PieChart() {
  const r = 38;
  const c = 2 * Math.PI * r;
  const filled = c * 0.89;
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28">
      <circle cx="50" cy="50" r={r} fill="none" stroke="oklch(0.92 0.015 260)" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none" stroke="var(--gold)" strokeWidth="10"
        strokeDasharray={`${filled} ${c}`} strokeDashoffset={c / 4} transform="rotate(-90 50 50)" strokeLinecap="round"
      />
      <text x="50" y="48" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--navy)">89%</text>
      <text x="50" y="62" textAnchor="middle" fontSize="7" fill="var(--muted-foreground)">ALIGNMENT</text>
    </svg>
  );
}

export function XRayScroller({ name }: { name: string }) {
  const pages = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div className="-mx-5">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="snap-center shrink-0 w-56 overflow-hidden rounded-2xl border border-border bg-cosmic shadow-card">
          <img src={reportCover} alt="Report cover" loading="lazy" className="h-72 w-full object-cover" />
          <div className="px-3 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/70">Astrelo Numerology</p>
            <p className="mt-1 text-sm font-bold text-white">{name}'s 10-Chapter Blueprint</p>
          </div>
        </div>

        {pages.map((p) => {
          const isWealth = p === 4;
          const isLove = p === 12;
          return (
            <div key={p} className="relative snap-center shrink-0 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="h-full p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Page {p}</p>
                <p className="blur-page mt-2 text-sm font-semibold text-foreground">
                  {isWealth ? "Wealth Sector Analysis" : isLove ? "Karmic Compatibility" : "Personal Matrix Insight"}
                </p>
                <p className="blur-page mt-2 text-[11px] leading-snug text-muted-foreground">{fakeBlurredText}</p>
                <p className="blur-page mt-2 text-[11px] leading-snug text-muted-foreground">{fakeBlurredText}</p>
              </div>

              {isWealth && (
                <div className="absolute inset-x-3 top-20 flex flex-col items-center rounded-xl border-2 border-gold bg-card p-3 shadow-glow">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-navy">Top Wealth Sector</p>
                  <PieChart />
                  <p className="text-[10px] font-semibold text-foreground">████████ <span className="text-gold">(89%)</span></p>
                </div>
              )}
              {isLove && (
                <div className="absolute inset-x-3 top-24 rounded-xl border-2 border-violet bg-card p-3 shadow-glow">
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest text-navy">Karmic Match</p>
                  <p className="mt-2 text-center text-sm font-bold text-foreground">
                    {name} <span className="text-violet">+</span>{" "}
                    <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground blur-page">██████</span>
                  </p>
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">Compatibility decoded</p>
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
