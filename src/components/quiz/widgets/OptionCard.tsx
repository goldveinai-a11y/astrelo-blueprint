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
        "group flex w-full items-center justify-between gap-3 border-b border-[color:var(--paper-ink)]/15 px-2 py-4 text-left text-[15px] font-[family-name:var(--font-serif-body)] leading-snug transition-colors",
        selected ? "text-[color:var(--navy)] font-semibold" : "text-[color:var(--paper-ink)]",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
          selected ? "border-[color:var(--violet)] bg-[color:var(--violet)]" : "border-[color:var(--paper-ink)]/35",
        )}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
    </button>
  );
}
