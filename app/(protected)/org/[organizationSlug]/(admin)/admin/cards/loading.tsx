export default function CardsLoading() {
  return (
    <div
      className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10"
      aria-busy="true"
      aria-label="Cargando tarjetas"
    >
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-7 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
      </header>

      <ul className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="rounded-xl border bg-card p-4 flex flex-col gap-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-10 animate-pulse rounded bg-muted" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}
