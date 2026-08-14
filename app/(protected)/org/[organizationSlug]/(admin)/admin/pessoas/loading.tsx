import { Skeleton } from "@/components/ui/skeleton";

export default function PessoasLoading() {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Cargando personas"
    >
      {/* Header skeleton */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </header>

      {/* Hero skeleton */}
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-black p-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-24 rounded bg-white/20" />
          <Skeleton className="h-6 w-48 rounded bg-white/20" />
          <Skeleton className="h-4 w-32 rounded bg-white/20" />
        </div>
        <Skeleton className="size-11 shrink-0 rounded-full bg-white/20" />
      </div>

      {/* Lista de pessoas skeleton */}
      <ul className="mt-8 flex flex-col gap-3" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => i + 1).map((item) => (
          <li key={`skeleton-${item}`}>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-44 rounded" />
                <Skeleton className="h-3 w-60 rounded" />
              </div>
              <Skeleton className="h-8 w-24 shrink-0 rounded-lg" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
