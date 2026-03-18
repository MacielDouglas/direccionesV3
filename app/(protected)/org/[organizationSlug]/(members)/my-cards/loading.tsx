export default function MyCardsLoading() {
  return (
    <div
      className="w-full max-w-5xl mx-auto py-2 px-4"
      aria-busy="true"
      aria-label="Cargando mis tarjetas"
    >
      <div className="h-7 w-40 animate-pulse rounded-md bg-muted mb-6" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-6 w-16 animate-pulse rounded bg-muted" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
            </div>
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="h-4 w-3/4 animate-pulse rounded bg-muted"
              />
            ))}
            <div className="h-48 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
