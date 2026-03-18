export default function UserLoading() {
  return (
    <main
      className="mx-auto w-full max-w-lg px-4 py-8 flex flex-col gap-8"
      aria-busy="true"
      aria-label="Cargando perfil"
    >
      <section className="flex flex-col items-center gap-4">
        <div className="size-28 animate-pulse rounded-full bg-muted" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border px-4 py-3"
          >
            <div className="h-5 w-5 animate-pulse rounded bg-muted shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-3 w-10 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </section>
    </main>
  );
}
