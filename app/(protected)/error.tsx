"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CircleAlert } from "lucide-react";

export default function ProtectedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  function goHome() {
    window.location.href = "/";
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-destructive/10">
        <CircleAlert className="size-8 text-destructive" aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-balance text-xl font-semibold tracking-tight">{t.errors.generic}</h1>
      </div>
      <div className="flex w-full flex-col gap-2">
        <Button onClick={reset} className="min-h-11 w-full">
          {t.errors.retry}
        </Button>
        <Button variant="outline" onClick={goHome} className="min-h-11 w-full">
          {t.common.home}
        </Button>
      </div>
    </main>
  );
}
