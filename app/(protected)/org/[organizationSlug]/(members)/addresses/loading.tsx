export default function AddressListLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-0"
      aria-busy="true"
      aria-label="Cargando direcciones"
    >
      {/* Header */}
      <div className="space-y-6 border-b p-5 md:p-10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-52 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-72 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-3 py-4 sm:px-4 sm:py-6">
        {/* Botão + busca */}
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="flex gap-2">
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
            <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        <div className="h-4 w-32 animate-pulse rounded bg-muted" />

        {/* Grid de cards */}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="overflow-hidden rounded-2xl">
              <div className="relative aspect-video w-full animate-pulse bg-muted" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
