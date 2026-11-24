"use client";

import { Check, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useOfflineSync } from "../core/offline-sync";

interface Props {
  className?: string;
}

function formatSyncTime(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function OfflineSyncButton({ className }: Props) {
  const { t, locale } = useI18n();
  const { online, ready, syncing, lastSyncedAt, syncNow } = useOfflineSync();

  const handleSync = async () => {
    const ok = await syncNow(true);
    if (ok) {
      toast.success(t.pwa.offlineSynced);
      return;
    }
    toast.error(t.pwa.offlineSyncError);
  };

  const lastSyncLabel = lastSyncedAt
    ? t.pwa.offlineLastSync.replace("{time}", formatSyncTime(lastSyncedAt, locale))
    : null;

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className ?? ""}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleSync()}
        disabled={!online || !ready || syncing}
        aria-busy={syncing}
        className="min-h-9 gap-2"
      >
        {syncing ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : online ? (
          <RefreshCw className="size-4" aria-hidden="true" />
        ) : (
          <WifiOff className="size-4" aria-hidden="true" />
        )}
        <span>{syncing ? t.pwa.offlineSyncing : t.pwa.offlineSyncNow}</span>
      </Button>
      {lastSyncLabel ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          {lastSyncLabel}
        </span>
      ) : null}
    </div>
  );
}
