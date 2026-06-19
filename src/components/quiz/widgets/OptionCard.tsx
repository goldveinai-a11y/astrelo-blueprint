import { cn } from "@/lib/utils";

export function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-2xl border-2 bg-card px-5 py-4 text-left text-[15px] font-medium leading-snug text-foreground shadow-card transition-all",
        "hover:border-violet hover:-translate-y-0.5",
        selected ? "border-violet ring-glow" : "border-border",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-violet bg-violet" : "border-border",
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </button>
  );
}
