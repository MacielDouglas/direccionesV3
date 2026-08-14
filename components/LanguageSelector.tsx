"use client";

import { useHaptic } from "@/app/hooks/useHaptic";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localeLabels } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { updateUserLanguageAction } from "@/server/users/user.action";
import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";

export function LanguageSelector({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale, t } = useI18n();
  const { vibrate } = useHaptic();
  const router = useRouter();
  const locales: Locale[] = ["pt", "es"];

  function handleChangeLanguage(next: Locale) {
    setLocale(next);
    vibrate("light");
    updateUserLanguageAction({ language: next }).catch(() => {
      /* persistência no banco é best-effort — cookie/localStorage seguem valendo */
    });
    router.refresh();
  }

  if (compact) {
    return (
      <fieldset
        aria-label={t.login.chooseLanguage}
        className={cn(
          "inline-flex w-fit rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-sm",
          className,
        )}
      >
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => handleChangeLanguage(l)}
            aria-pressed={locale === l}
            aria-label={localeLabels[l]}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              locale === l
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-white/70 hover:text-white",
            )}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </fieldset>
    );
  }

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
            onClick={() => handleChangeLanguage(l)}
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
