"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { Download } from "lucide-react";
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
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [never, setNever] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
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

  const canInstall = deferred !== null;

  // Desktop aguarda o evento nativo; Android mostra após a pausa; iOS sempre orienta.
  if (!iosHint && !canInstall && manual === null) return null;

  // Instalação em 1 toque (diálogo nativo do navegador).
  const handleInstall = async () => {
    if (!deferred || installing) return;
    setInstalling(true);
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
      setInstalling(false);
      setDeferred(null);
    }
  };

  const hint = iosHint
    ? t.pwa.iosHint
    : manual === "webview"
      ? t.pwa.webviewHint
      : manual === "dev"
        ? t.pwa.devHint
        : manual === "android"
          ? t.pwa.androidHint
          : null;

  return (
    <section
      aria-label={t.pwa.installTitle}
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border bg-background p-5 shadow-xl md:left-auto md:right-6 md:w-96"
    >
      <div className="flex items-start gap-3">
        <img
          src="/icons/icon-192.png"
          alt=""
          width={52}
          height={52}
          className="size-[52px] shrink-0 rounded-xl"
        />
        <div className="min-w-0">
          <p className="text-base font-semibold leading-snug">{t.pwa.installTitle}</p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">
            {t.pwa.installDescription}
          </p>
        </div>
      </div>

      {hint && (
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}

      {canInstall ? (
        <button
          type="button"
          onClick={() => void handleInstall()}
          disabled={installing}
          className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-semibold text-primary-foreground transition active:scale-[0.99] disabled:opacity-70"
        >
          <Download className="size-5" aria-hidden="true" />
          {installing ? t.pwa.installing : t.pwa.installNow}
        </button>
      ) : (
        <button
          type="button"
          onClick={snooze}
          className="mt-4 inline-flex h-14 w-full items-center justify-center rounded-xl border border-border px-4 text-base font-semibold"
        >
          {t.pwa.understood}
        </button>
      )}

      <div className="mt-2 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={snooze}
          className="inline-flex min-h-11 items-center px-2 text-xs text-muted-foreground"
        >
          {t.pwa.later}
        </button>
        <button
          type="button"
          onClick={neverShow}
          className="inline-flex min-h-11 items-center px-2 text-xs text-muted-foreground"
        >
          {t.pwa.neverShow}
        </button>
      </div>
    </section>
  );
}
