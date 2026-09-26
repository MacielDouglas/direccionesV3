import { getServerDictionary } from "@/lib/i18n/server";

export default async function AddressDetailLoading() {
  const t = await getServerDictionary();
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-7"
      aria-busy="true"
      aria-label={t.common.loadingLabels.address}
    >
      {/* Cabeçalho voltar + título */}
      <header className="flex items-start gap-3">
        <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="min-w-0 flex-1">
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-4 w-64 max-w-full animate-pulse rounded bg-muted" />
        </div>
      </header>

      {/* Imagem */}
      <div className="aspect-video w-full animate-pulse rounded-2xl bg-muted" />

      {/* Card de detalhes */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <header className="flex flex-wrap items-center gap-3">
          <div className="size-11 shrink-0 animate-pulse rounded-2xl bg-muted" />
          <div className="flex gap-2">
            <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
          </div>
        </header>

        {/* Ações */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="h-11 flex-1 animate-pulse rounded-md bg-muted" />
          <div className="h-11 flex-1 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Campos */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 3 }, (_, i) => i + 1).map((item) => (
            <div key={`skeleton-${item}`} className="flex flex-col gap-1">
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        <div className="h-20 w-full animate-pulse rounded-xl bg-muted" />
      </section>

      {/* Mapa */}
      <div className="h-56 w-full animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
