import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div
      aria-label="Cargando inicio de sesión"
      aria-busy="true"
      className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-4 py-12 bg-background"
    >
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 rounded-xl border border-border bg-card p-8 shadow-sm sm:p-9">
        <header className="flex flex-col items-center gap-5 text-center">
          <Skeleton className="size-24 rounded-xl" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-60" />
          </div>
        </header>

        <div className="w-full space-y-3">
          <Skeleton className="h-11 w-full rounded-full" />
        </div>

        <div className="w-full border-t border-border pt-6">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
