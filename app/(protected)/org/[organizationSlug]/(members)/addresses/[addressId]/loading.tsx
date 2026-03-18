export default function AddressDetailLoading() {
  return (
    <article
      className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-3 py-4 sm:px-4 sm:py-6"
      aria-busy="true"
      aria-label="Cargando dirección"
    >
      {/* Mapa */}
      <div className="h-56 w-full animate-pulse rounded-2xl bg-muted sm:h-72" />

      {/* Card de detalhes */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white p-4 dark:bg-surface-subtle-dark sm:p-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-2 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded bg-muted shrink-0" />
        </header>

        <div className="flex gap-2">
          <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
        </div>

        {/* Imagem */}
        <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />

        {/* Campos */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        <div className="h-20 w-full animate-pulse rounded-xl bg-muted" />

        <footer className="flex flex-col gap-3 border-t pt-3">
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-36" />
        </footer>
      </section>
    </article>
  );
}
