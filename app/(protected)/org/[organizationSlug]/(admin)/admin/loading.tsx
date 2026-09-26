import { Skeleton } from "@/components/ui/skeleton";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function AdminLoading() {
  const t = await getServerDictionary();
  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10"
      aria-busy="true"
      aria-label={t.common.loadingLabels.adminPanel}
    >
      {/* Cabeçalho */}
      <header className="mb-6">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="mt-2 h-8 w-56 rounded-lg" />
        <Skeleton className="mt-1 h-4 w-72 max-w-full rounded" />
      </header>

      {/* Hero */}
      <div className="rounded-2xl bg-black p-6 sm:p-8">
        <Skeleton className="h-3 w-24 rounded bg-white/20" />
        <Skeleton className="mt-3 h-6 w-64 max-w-full rounded bg-white/20" />
        <Skeleton className="mt-4 h-11 w-40 rounded-full bg-white/20" />
      </div>

      {/* Painel */}
      <div className="mt-8 flex flex-col gap-3">
        <Skeleton className="h-5 w-32 rounded" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => i + 1).map((item) => (
            <div
              key={`skeleton-${item}`}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="mt-1 h-3 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
