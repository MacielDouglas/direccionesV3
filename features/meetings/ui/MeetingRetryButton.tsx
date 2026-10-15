"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** Recarrega a programação (recuperação do erro de carga da semana). */
export function MeetingRetryButton() {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-meeting/30 bg-meeting/10 px-5 text-sm font-semibold text-meeting-text shadow-xs transition-colors hover:bg-meeting/20 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meeting"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw className="size-4" aria-hidden="true" />
      )}
      {t.errors.retry}
    </button>
  );
}
