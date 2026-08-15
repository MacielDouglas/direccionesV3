"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function DemoBackToLogin() {
  const { t } = useI18n();

  return (
    <Link
      href="/login"
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {t.demo.backToLogin}
    </Link>
  );
}
