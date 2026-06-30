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
      <div className="relative mb-6 h-44 w-44 overflow-hidden border border-[color:var(--paper-ink)]/15">
        <img src={image} alt="" className="h-full w-full object-cover grayscale-[15%]" loading="lazy" />
      </div>
      {eyebrow && (
        <p className="mb-3 font-[family-name:var(--font-sans)] text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--violet)]">{eyebrow}</p>
      )}
      <h2 className="font-[family-name:var(--font-serif-display)] text-[24px] font-extrabold leading-tight text-[color:var(--navy)]">{title}</h2>
      <p className="mt-4 font-[family-name:var(--font-serif-body)] text-[14px] leading-relaxed text-[color:var(--paper-muted)] max-w-[280px]">{body}</p>
      <button
        onClick={onNext}
        className="mt-9 inline-flex items-center justify-center gap-2 bg-[color:var(--navy)] px-8 py-4 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[color:var(--gold)] transition-transform hover:-translate-y-0.5"
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
