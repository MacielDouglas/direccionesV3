export default function PendingDeletionLoading() {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 py-6"
      aria-busy="true"
      aria-label="Cargando solicitudes"
    >
      <div className="h-7 w-56 animate-pulse rounded-md bg-muted" />
      <div className="mt-1 h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 flex flex-col gap-3">
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
