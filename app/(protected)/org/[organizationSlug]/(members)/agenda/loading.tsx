import { Skeleton } from "@/components/ui/skeleton";

export default function AgendaLoading() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Calendário */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm flex flex-col gap-4">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="size-9 rounded-full" />
        </div>
        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full rounded" />
          ))}
        </div>
        {/* Grid dias */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="mx-auto size-8 rounded-full" />
          ))}
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 flex flex-col gap-2"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
