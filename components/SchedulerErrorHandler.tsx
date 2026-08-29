"use client";

import { useEffect } from "react";

// Cobre o TypeError intermitente `Cannot read properties of undefined (reading 'startTime')`
// que aparece como `et.reportAllChanges` em VM/minificado (React Scheduler / DevTools / Workbox)
// e impede que a app quebre em produção. Não esconde outros erros.
export function SchedulerErrorHandler() {
  useEffect(() => {
    const isStartTimeError = (msg: string) =>
      msg.includes("startTime") && msg.includes("Cannot read properties of undefined");

    const onError = (event: ErrorEvent) => {
      const msg = event.message || event.error?.message || "";
      if (isStartTimeError(msg)) {
        event.preventDefault();
        // mantém visível apenas em dev para debug, sem quebrar a UI
        if (process.env.NODE_ENV === "development") {
          // biome-ignore lint/suspicious/noConsole: log intencional para debug suprimido
          console.warn("[suppressed] Scheduler startTime error", event.error || msg);
        }
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = (event.reason as Error)?.message || String(event.reason || "");
      if (isStartTimeError(msg)) {
        event.preventDefault();
        if (process.env.NODE_ENV === "development") {
          // biome-ignore lint/suspicious/noConsole: log intencional para debug suprimido
          console.warn("[suppressed] Scheduler startTime rejection", event.reason);
        }
      }
    };

    // Captura também erros dentro de requestAnimationFrame / setTimeout usados pelo scheduler
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    // Patch defensivo para PerformanceObserver que pode enviar entries indefinidas em alguns browsers/extensões
    // Se o callback receber `undefined`, não tenta ler `entry.startTime`
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      const OriginalPO = window.PerformanceObserver;
      try {
        (
          window as unknown as { PerformanceObserver: typeof PerformanceObserver }
        ).PerformanceObserver = class extends OriginalPO {
          constructor(callback: PerformanceObserverCallback) {
            const guarded: PerformanceObserverCallback = (list, observer) => {
              try {
                const entries = list.getEntries?.() || [];
                // Se alguma entry estiver undefined, filtra antes de repassar
                if (
                  entries.some((e) => !e || typeof (e as PerformanceEntry).startTime !== "number")
                ) {
                  const filtered = entries.filter(
                    (e) => e && typeof (e as PerformanceEntry).startTime === "number",
                  );
                  // Não chama o callback original com dados corrompidos — evita o throw
                  if (filtered.length === 0) return;
                }
                callback(list, observer);
              } catch (err) {
                const m = (err as Error)?.message || "";
                if (isStartTimeError(m)) {
                  if (process.env.NODE_ENV === "development") {
                    // biome-ignore lint/suspicious/noConsole: log intencional para debug suprimido
                    console.warn("[suppressed] PerformanceObserver startTime", err);
                  }
                  return;
                }
                throw err;
              }
            };
            super(guarded);
          }
        };
      } catch {}
    }

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
