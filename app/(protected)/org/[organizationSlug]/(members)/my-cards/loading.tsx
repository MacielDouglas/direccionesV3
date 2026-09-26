import { getServerDictionary } from "@/lib/i18n/server";

export default async function MyCardsLoading() {
  const t = await getServerDictionary();
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-7 md:py-10"
      aria-busy="true"
      aria-label={t.common.loadingLabels.myCards}
    >
      {/* Cabeçalho voltar + título */}
      <header className="flex items-start gap-3">
        <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="min-w-0 flex-1">
          <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-1 h-4 w-56 max-w-full animate-pulse rounded bg-muted" />
        </div>
      </header>

      {/* Resumo */}
      <div className="rounded-2xl bg-black p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-white/20" />
        <div className="mt-2 h-12 w-20 animate-pulse rounded bg-white/20" />
        <div className="mt-3 h-3 w-48 animate-pulse rounded bg-white/20" />
      </div>

      {/* Ver mapa */}
      <div className="h-12 w-full animate-pulse rounded-full bg-muted" />

      {/* Lista de cartões */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }, (_, i) => i + 1).map((item) => (
          <div
            key={`skeleton-${item}`}
            className="h-44 w-full animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
