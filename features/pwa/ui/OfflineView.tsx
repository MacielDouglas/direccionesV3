"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { WifiOff } from "lucide-react";
import Link from "next/link";

export function OfflineView() {
  const { t } = useI18n();

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-4 px-6 py-10 text-center"
      style={{
        paddingBottom: "max(2.5rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <span className="grid size-16 place-items-center rounded-full bg-muted">
        <WifiOff className="size-8 text-muted-foreground" aria-hidden="true" />
      </span>
      <h1 className="text-balance text-xl font-semibold">{t.pwa.offlineTitle}</h1>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        {t.pwa.offlineDescription}
      </p>
      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t.pwa.offlineRetry}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          {t.pwa.offlineHome}
        </Link>
      </div>
    </main>
  );
}
