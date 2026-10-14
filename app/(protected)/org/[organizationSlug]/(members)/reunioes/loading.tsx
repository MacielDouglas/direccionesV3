import { Skeleton } from "@/components/ui/skeleton";

function ProgramRowsSkeleton({ rows }: { rows: number }) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => i + 1).map((row) => (
        <li key={`row-${row}`} className="flex items-start gap-3 py-2.5">
          <Skeleton className="mt-0.5 h-4 w-10 shrink-0" />
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="flex items-baseline justify-between gap-2">
              <Skeleton className="h-4 min-w-0 flex-1" />
              <Skeleton className="h-3 w-10 shrink-0" />
            </span>
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-4 w-1/2 self-end" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function ProgramSectionSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex min-w-0 flex-col px-4 pt-2">
      <div className="flex items-center gap-3 py-2">
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <Skeleton className="h-6 min-w-0 flex-1" />
      </div>
      <ProgramRowsSkeleton rows={rows} />
    </div>
  );
}

export default function ReunioesLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-4 px-4 py-6 md:py-10">
      <header className="mb-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-2 h-4 w-64" />
      </header>

      <div className="flex min-w-0 flex-col rounded-2xl bg-meeting px-4 pb-3 pt-5 shadow-xs">
        <Skeleton className="mx-auto h-5 w-44 bg-white/40" />
        <div className="mt-3 flex min-w-0 rounded-xl bg-white/15 p-1">
          <Skeleton className="h-11 min-w-0 flex-1 rounded-lg bg-white/50" />
          <Skeleton className="h-11 min-w-0 flex-1 rounded-lg bg-white/15" />
        </div>
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-11 min-w-0 flex-1 rounded-full" />
        <Skeleton className="h-11 min-w-0 flex-1 rounded-full" />
      </div>

      <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card pb-3 shadow-xs">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-xl bg-meeting/10 py-1.5">
            <Skeleton className="h-3 w-8 bg-meeting/20" />
            <Skeleton className="h-4 w-10 bg-meeting/20" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </span>
        </div>

        <ProgramSectionSkeleton rows={3} />
        <ProgramSectionSkeleton rows={2} />
      </section>

      <Skeleton className="h-3 w-40" />
    </div>
  );
}
