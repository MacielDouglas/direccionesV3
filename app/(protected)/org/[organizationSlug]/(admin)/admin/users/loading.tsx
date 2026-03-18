export default function UsersLoading() {
  return (
    <main
      className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6"
      aria-busy="true"
      aria-label="Cargando usuarios"
    >
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
      <section className="space-y-3">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </section>
    </main>
  );
}
