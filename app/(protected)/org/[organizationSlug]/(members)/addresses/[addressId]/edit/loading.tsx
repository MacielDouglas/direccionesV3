export default function AddressEditLoading() {
  return (
    <article
      className="mx-auto flex w-full max-w-2xl flex-col gap-2"
      aria-busy="true"
      aria-label="Cargando editor de dirección"
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pb-2 pt-4">
        <div className="h-5 w-5 animate-pulse rounded bg-muted" />
        <div className="space-y-1">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      </header>

      {/* Mesmo skeleton do new address */}
      <div className="px-6 space-y-6 py-4">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>

      <div className="border-t bg-muted/30 px-6 py-5 space-y-3">
        <div className="h-48 w-full animate-pulse rounded-xl bg-muted" />
      </div>

      <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted px-6" />

      <div className="sticky bottom-0 border-t bg-background px-4 py-3">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </article>
  );
}
