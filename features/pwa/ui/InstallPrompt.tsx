"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const NEVER_KEY = "pwa-install-never";
const SNOOZE_KEY = "pwa-install-snoozed-at";
const INSTALLED_KEY = "pwa-installed";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const MANUAL_GRACE_MS = 2500;

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // armazenamento indisponível — ignora
  }
}

function isStandaloneDisplay(): boolean {
  const modes = ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"];
  return modes.some((mode) => window.matchMedia(`(display-mode: ${mode})`).matches);
}

function isIosStandalone(): boolean {
  return (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

function isLaunchedFromHomeScreen(): boolean {
  if (document.referrer.startsWith("android-app://")) return true;
  const params = new URLSearchParams(window.location.search);
  const source = params.get("source");
  if (source === "pwa" || source === "pwa-shortcut") return true;
  return safeGet(INSTALLED_KEY) === "1";
}

function isInstalled(): boolean {
  return isStandaloneDisplay() || isIosStandalone() || isLaunchedFromHomeScreen();
}

function isIos(ua: string): boolean {
  return /iphone|ipad|ipod/i.test(ua);
}

function isAndroid(ua: string): boolean {
  return /android/i.test(ua);
}

function isWebView(ua: string): boolean {
  if (/;\s*wv\)/i.test(ua) || /\bWebView\b/i.test(ua)) return true;
  if ("Android" in window) return true;
  // WebView Android clássico: tem Version/ mas não Chrome/
  return isAndroid(ua) && /Version\/\d/i.test(ua) && !/Chrome\/\d/i.test(ua);
}

function isLocalhost(): boolean {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

type ManualContext = "webview" | "dev" | "android";

export function InstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [never, setNever] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [manual, setManual] = useState<ManualContext | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ua = navigator.userAgent || "";

    if (isInstalled()) {
      safeSet(INSTALLED_KEY, "1");
      setInstalled(true);
      setMounted(true);
      return;
    }

    // Melhor esforço: Chrome Android informa apps instalados relacionados.
    const nav = navigator as unknown as {
      getInstalledRelatedApps?: () => Promise<Array<{ id?: string }>>;
    };
    if (typeof nav.getInstalledRelatedApps === "function") {
      nav
        .getInstalledRelatedApps()
        .then((apps) => {
          if (!cancelled && apps.length > 0) {
            safeSet(INSTALLED_KEY, "1");
            setInstalled(true);
          }
        })
        .catch(() => {
          // API indisponível — ignora
        });
    }

    setNever(safeGet(NEVER_KEY) === "1");
    const snoozeAt = Number(safeGet(SNOOZE_KEY) || 0);
    setSnoozed(Date.now() - snoozeAt < SNOOZE_MS);

    if (isIos(ua)) {
      setIosHint(true);
      setMounted(true);
      return;
    }

    const markInstalled = () => {
      if (cancelled) return;
      safeSet(INSTALLED_KEY, "1");
      setInstalled(true);
    };
    window.addEventListener("appinstalled", markInstalled);

    const mq = window.matchMedia("(display-mode: standalone)");
    const onDisplayChange = (e: MediaQueryListEvent) => {
      if (e.matches) markInstalled();
    };
    mq.addEventListener("change", onDisplayChange);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      if (!cancelled) setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // WebView nunca dispara beforeinstallprompt; no dev (localhost, sem SW)
    // o Chrome também não oferece instalação — mostra orientação manual.
    const grace = window.setTimeout(() => {
      if (cancelled) return;
      if (isWebView(ua)) setManual("webview");
      else if (isAndroid(ua)) setManual(isLocalhost() ? "dev" : "android");
    }, MANUAL_GRACE_MS);

    setMounted(true);
    return () => {
      cancelled = true;
      window.clearTimeout(grace);
      window.removeEventListener("appinstalled", markInstalled);
      mq.removeEventListener("change", onDisplayChange);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  const snooze = () => {
    safeSet(SNOOZE_KEY, String(Date.now()));
    setSnoozed(true);
  };

  const neverShow = () => {
    safeSet(NEVER_KEY, "1");
    setNever(true);
  };

  if (!mounted || installed || never || snoozed) return null;

  const cardClass =
    "fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 rounded-xl border bg-background p-4 shadow-lg md:left-auto md:right-6 md:w-96";

  if (iosHint) {
    return (
      <div className={cardClass}>
        <p className="text-sm font-medium">Instalar Direcciones</p>
        <p className="mt-1 text-xs text-muted-foreground">
          En Safari: Compartir → Añadir a pantalla de inicio para usar offline.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={snooze}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md border px-3 text-xs font-medium"
          >
            Ahora no
          </button>
          <button
            type="button"
            onClick={neverShow}
            className="inline-flex h-11 items-center rounded-md px-3 text-xs text-muted-foreground"
          >
            No mostrar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (deferred) {
    return (
      <div className={cardClass}>
        <p className="text-sm font-medium">Instalar Direcciones</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Acceso rápido y lectura offline de mapas y fotos.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={async () => {
              try {
                await deferred.prompt();
                const choice = await deferred.userChoice;
                if (choice.outcome === "accepted") {
                  safeSet(INSTALLED_KEY, "1");
                  setInstalled(true);
                }
              } catch {
                // prompt indisponível — ignora
              } finally {
                setDeferred(null);
              }
            }}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={snooze}
            className="inline-flex h-11 items-center rounded-md border px-3 text-xs font-medium"
          >
            Ahora no
          </button>
          <button
            type="button"
            onClick={neverShow}
            className="inline-flex h-11 items-center rounded-md px-3 text-xs text-muted-foreground"
          >
            No mostrar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (manual === "webview") {
    return (
      <div className={cardClass}>
        <p className="text-sm font-medium">Instalar Direcciones</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Abre esta página en Chrome y usa el menú ⋮ → Instalar app o Añadir a pantalla de inicio
          para usar offline.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={snooze}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md border px-3 text-xs font-medium"
          >
            Entendido
          </button>
          <button
            type="button"
            onClick={neverShow}
            className="inline-flex h-11 items-center rounded-md px-3 text-xs text-muted-foreground"
          >
            No mostrar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (manual === "dev") {
    return (
      <div className={cardClass}>
        <p className="text-sm font-medium">Instalar Direcciones</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Estás en desarrollo (localhost, sin service worker): la instalación PWA solo aparece en
          producción. Abre la URL de producción en Chrome Android → menú ⋮ → Instalar app.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={snooze}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md border px-3 text-xs font-medium"
          >
            Entendido
          </button>
          <button
            type="button"
            onClick={neverShow}
            className="inline-flex h-11 items-center rounded-md px-3 text-xs text-muted-foreground"
          >
            No mostrar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (manual === "android") {
    return (
      <div className={cardClass}>
        <p className="text-sm font-medium">Instalar Direcciones</p>
        <p className="mt-1 text-xs text-muted-foreground">
          En Chrome Android: menú ⋮ → Instalar app o Añadir a pantalla de inicio para acceso rápido
          y lectura offline.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={snooze}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md border px-3 text-xs font-medium"
          >
            Ahora no
          </button>
          <button
            type="button"
            onClick={neverShow}
            className="inline-flex h-11 items-center rounded-md px-3 text-xs text-muted-foreground"
          >
            No mostrar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return null;
}
