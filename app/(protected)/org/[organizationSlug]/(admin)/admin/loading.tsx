import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 py-6"
      aria-busy="true"
      aria-label="Cargando panel de administración"
    >
      {/* Header skeleton */}
      <header className="mb-6">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-80 rounded" />
      </header>

      {/* Cards skeleton */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i}>
            <div className="flex flex-col gap-3 rounded-2xl border p-5">
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-7 w-24 rounded-lg" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
