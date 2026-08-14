import { Skeleton } from "@/components/ui/skeleton";

export default function UsuariosLoading() {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 py-6"
      aria-busy="true"
      aria-label="Cargando usuarios"
    >
      {/* Header skeleton */}
      <header className="mb-6 space-y-1.5">
        <Skeleton className="h-6 w-28 rounded-md" />
        <Skeleton className="h-4 w-52 rounded" />
      </header>

      {/* Lista de usuários skeleton */}
      <ul className="flex flex-col gap-3" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => i + 1).map((item) => (
          <li key={`skeleton-${item}`}>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-64 rounded" />
              </div>
              <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
