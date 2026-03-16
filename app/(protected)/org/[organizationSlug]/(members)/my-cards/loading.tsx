import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

export default function MyCardLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto py-2">
      <Skeleton className="w-full h-full" />
      <div className="flex flex-col h-dvh">
        <div className="h-64 shrink-0 w-full">
          <Skeleton className="w-full h-64 rounded-2xl bg-gray-400" />
          {/* <CardViewMap addresses={allAddresses} onMarkerClick={openAddress} /> */}
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-4">
          <header className="mb-4">
            <h1 className="text-2xl font-bold">Mis Tarjetas</h1>
          </header>

          <ul className="flex flex-col gap-4" aria-label="Mis tarjetas">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <article
                  aria-label={`Tarjeta #${String(i).padStart(2, "0")}`}
                  className="rounded-xl border bg-card p-4 flex flex-col gap-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-bold tabular-nums">
                      #{String(i).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" aria-hidden />
                    Recibido el <Skeleton className="w-full" />
                  </div>

                  <Skeleton className="w-full h-10" />
                </article>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
