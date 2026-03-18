export default function CardNewLoading() {
  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      aria-busy="true"
      aria-label="Cargando formulario de tarjeta"
    >
      {/* Mapa */}
      <div className="h-96 w-full shrink-0 animate-pulse bg-muted" />

      <div className="flex flex-col gap-4 px-4 py-4">
        {/* Número */}
        <div className="rounded-lg border bg-muted/40 px-4 py-3 flex items-center justify-between">
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          <div className="h-8 w-14 animate-pulse rounded bg-muted" />
        </div>

        {/* Lista de addresses */}
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="h-6 w-6 animate-pulse rounded-full bg-muted shrink-0" />
              <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-4 w-4 animate-pulse rounded-full bg-muted shrink-0" />
            </div>
          ))}
        </div>

        {/* Botões */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-24" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
