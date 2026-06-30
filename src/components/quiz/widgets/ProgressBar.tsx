export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-[2px] w-full overflow-hidden bg-[color:var(--paper-ink)]/12">
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: "var(--gold)" }}
      />
    </div>
  );
}
