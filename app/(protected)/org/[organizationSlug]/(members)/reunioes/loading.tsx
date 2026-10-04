import { Skeleton } from "@/components/ui/skeleton";

export default function ReunioesLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-4 w-48" />
      {Array.from({ length: 2 }, (_, i) => i + 1).map((item) => (
        <div
          key={`skeleton-${item}`}
          className="rounded-2xl border bg-card p-5 flex flex-col gap-3"
        >
          <div className="flex justify-between">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 4 }, (_, j) => j + 1).map((sub) => (
            <div key={`skeleton-${item}-${sub}`} className="flex gap-3">
              <Skeleton className="h-4 w-12" />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
