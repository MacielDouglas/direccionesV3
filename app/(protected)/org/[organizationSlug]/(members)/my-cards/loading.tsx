export default function MyCardsLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pt-6 pb-28 md:py-10"
      aria-busy="true"
      aria-label="Cargando mis tarjetas"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-44 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-11 w-28 shrink-0 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="h-44 w-full animate-pulse rounded-2xl bg-muted" />

      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }, (_, i) => i + 1).map((item) => (
          <div key={`skeleton-${item}`} className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex items-center gap-3 border-b px-4 py-3.5">
              <div className="size-9 shrink-0 animate-pulse rounded-xl bg-muted" />
              <div className="flex-1">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-1.5 h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="size-6 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="h-3.5 flex-1 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
