import { Heart, Lock, Zap } from "lucide-react";
import { addDays, formatLongDate } from "@/lib/quiz/numerology";

export function DynamicTimeline({ name }: { name: string }) {
  const now = new Date();
  const d1 = formatLongDate(addDays(now, 45));
  const d2 = formatLongDate(addDays(now, 90));

  const items = [
    {
      date: d1,
      icon: Zap,
      title: "Critical financial shift window",
      body: `A path to clear your karmic debt cycle opens for ${name}.`,
      tone: "gold" as const,
    },
    {
      date: d2,
      icon: Heart,
      title: "Karmic relationship warning",
      body: "Protect your energy field from a severe drain.",
      tone: "violet" as const,
    },
  ];

  return (
    <div className="relative space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="text-xs font-bold uppercase tracking-widest text-violet">Your Dynamic Timeline</p>
      <div className="relative space-y-5 pl-8">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-gold via-violet to-magenta" />
        {items.map((it, i) => (
          <div key={i} className="relative">
            <div
              className="absolute -left-[25px] top-1 flex h-7 w-7 items-center justify-center rounded-full text-white"
              style={{ background: it.tone === "gold" ? "var(--gradient-gold)" : "var(--gradient-cosmic)" }}
            >
              <it.icon className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-navy">📌 {it.date}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{it.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{it.body}</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Lock className="h-3 w-3" /> Locked — unlock report for exact hour & instructions
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
