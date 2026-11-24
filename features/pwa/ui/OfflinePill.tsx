"use client";

import { Loader2, WifiOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useNetworkStatus } from "../core/network-status";

export function OfflinePill() {
  const { t } = useI18n();
  const { online, checking, recheck } = useNetworkStatus();

  if (online) return null;

  return (
    <button
      type="button"
      onClick={() => void recheck()}
      disabled={checking}
      aria-label={t.pwa.offlinePillAria}
      title={t.pwa.offlinePillAria}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-500/25 disabled:opacity-70 dark:text-amber-300"
    >
      {checking ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <WifiOff className="size-3.5" aria-hidden="true" />
      )}
      <span>{t.pwa.offlinePill}</span>
    </button>
  );
}
