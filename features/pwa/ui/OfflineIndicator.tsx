"use client";

import { useCallback, useEffect, useState } from "react";

async function hasConnection(): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.onLine) return true;
  // navigator.onLine = false pode ser falso-positivo (WebView/adb) —
  // confirma com uma requisição real antes de mostrar o modo leitura.
  try {
    const res = await fetch("/manifest.webmanifest", {
      method: "HEAD",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);

  const recheck = useCallback(async () => {
    setOnline(await hasConnection());
  }, []);

  useEffect(() => {
    let cancelled = false;

    void hasConnection().then((ok) => {
      if (!cancelled) setOnline(ok);
    });

    const onOnline = () => setOnline(true);
    const onOffline = () => {
      void hasConnection().then((ok) => {
        if (!cancelled) setOnline(ok);
      });
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void recheck();
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [recheck]);

  // Offline: tenta a cada 5s para sumir sozinho ao recuperar a rede.
  useEffect(() => {
    if (online) return;
    const id = window.setInterval(() => {
      void recheck();
    }, 5000);
    return () => window.clearInterval(id);
  }, [online, recheck]);

  if (online) return null;

  // Bloco estático no fluxo (não fixed): empurra o header em vez de cobri-lo.
  return (
    <div className="flex w-full items-center justify-center gap-3 bg-amber-500 px-4 py-2">
      <output aria-live="polite" className="text-center text-sm font-medium text-black">
        Sin conexión — modo lectura. Los cambios necesitan internet.
      </output>
      <button
        type="button"
        onClick={() => void recheck()}
        className="inline-flex h-9 shrink-0 items-center rounded-md border border-black/20 px-3 text-xs font-semibold text-black"
      >
        Reintentar
      </button>
    </div>
  );
}
