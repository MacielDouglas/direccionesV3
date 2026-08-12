"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { dictionaries } from "./dictionaries";
import type { I18nDictionary, Locale } from "./types";

export const LOCALE_STORAGE_KEY = "direcciones.locale";
export const LOCALE_COOKIE_NAME = "direcciones.locale";

export function isLocale(value: string | null): value is Locale {
  return value === "pt" || value === "es";
}

export function detectBrowserLocale(): Locale {
  const raw =
    typeof navigator !== "undefined" ? navigator.language || navigator.languages?.[0] : "";
  return isLocale(raw.slice(0, 2).toLowerCase()) ? (raw.slice(0, 2).toLowerCase() as Locale) : "pt";
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "pt";
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* localStorage indisponível — usa fallback */
  }
  return detectBrowserLocale();
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: I18nDictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale = "pt" }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* localStorage indisponível — idioma vale só para a sessão */
    }
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: dictionaries[locale],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n deve ser usado dentro de <I18nProvider>");
  return ctx;
}
