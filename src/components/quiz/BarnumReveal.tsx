export function BarnumReveal({
  name,
  paragraph,
  onContinue,
}: {
  name: string;
  paragraph: string | null;
  onContinue: () => void;
}) {
  const loading = !paragraph;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet">
            Decode Complete
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-snug text-navy">
            {name}, here is what we found
          </h2>
        </div>

        <div className="min-h-[160px] rounded-2xl border border-violet/30 bg-card p-6 shadow-card">
          {loading ? (
            <div className="flex h-full min-h-[120px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-foreground">{paragraph}</p>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Your full Blueprint breaks this down chapter by chapter — with specific dates, patterns, and guidance built from your exact numbers.
        </p>

        <button
          type="button"
          onClick={onContinue}
          disabled={loading}
          className="h-14 w-full rounded-2xl bg-navy text-sm font-bold text-gold shadow-md transition-opacity active:opacity-80 disabled:opacity-40"
        >
          See My Full Blueprint →
        </button>
      </div>
    </div>
  );
}
