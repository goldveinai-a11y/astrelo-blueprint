import { ArrowRight } from "lucide-react";

export function MilestoneScreen({
  image,
  eyebrow,
  title,
  body,
  cta,
  onNext,
}: {
  image: string;
  eyebrow?: string;
  title: string;
  body: string;
  cta: string;
  onNext: () => void;
}) {
  return (
    <div className="quiz-fade-in flex flex-col items-center text-center">
      <div className="relative mb-6 h-48 w-48 overflow-hidden rounded-3xl shadow-card">
        <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>
      {eyebrow && (
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-violet">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-bold text-navy">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <button
        onClick={onNext}
        className="pulse-soft mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-8 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
