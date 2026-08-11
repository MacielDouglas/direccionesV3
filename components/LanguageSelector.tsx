"use client";

import { useHaptic } from "@/app/hooks/useHaptic";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localeLabels } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";

export function LanguageSelector({
  className,
}: {
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();
  const { vibrate } = useHaptic();
  const locales: Locale[] = ["pt", "es"];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Languages className="size-3.5" aria-hidden="true" />
        {t.user.languagePreference}
      </span>
      <div className="inline-flex w-fit rounded-full border border-border bg-card p-1 shadow-xs">
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              setLocale(l);
              vibrate("light");
            }}
            aria-pressed={locale === l}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              locale === l
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {localeLabels[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
