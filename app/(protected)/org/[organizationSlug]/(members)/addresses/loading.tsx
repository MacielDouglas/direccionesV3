import { getServerDictionary } from "@/lib/i18n/server";

export default async function AddressListLoading() {
  const t = await getServerDictionary();
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6"
      aria-busy="true"
      aria-label={t.common.loadingLabels.addresses}
    >
      {/* Resumo */}
      <div className="rounded-2xl bg-black p-6">
        <div className="h-3 w-32 animate-pulse rounded bg-white/20" />
        <div className="mt-3 h-12 w-24 animate-pulse rounded bg-white/20" />
        <div className="mt-3 flex gap-4">
          <div className="h-3 w-20 animate-pulse rounded bg-white/20" />
          <div className="h-3 w-20 animate-pulse rounded bg-white/20" />
        </div>
      </div>

      {/* CTA novo endereço */}
      <div className="h-12 w-full animate-pulse rounded-full bg-muted" />

      {/* Busca + filtros */}
      <div className="flex flex-col gap-3">
        <div className="h-12 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex gap-2">
            <div className="h-11 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-11 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-11 w-24 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex gap-2">
            <div className="h-11 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-11 w-28 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>

      {/* Contador */}
      <div className="h-4 w-40 animate-pulse rounded bg-muted" />

      {/* Lista vertical */}
      <ul className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => i + 1).map((item) => (
          <li
            key={`skeleton-${item}`}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="aspect-video w-full animate-pulse bg-muted" />
            <div className="flex flex-col gap-3 p-4">
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
