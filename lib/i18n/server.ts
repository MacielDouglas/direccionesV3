import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME } from "./I18nProvider";
import { dictionaries } from "./dictionaries";
import type { I18nDictionary, Locale } from "./types";

const ACCEPT_LANGUAGE_REGEX = /^(pt|es)(?:[-_]|$)/i;

export function resolveLocale(preferred: Locale, acceptLanguage?: string): Locale {
  if (preferred === "pt" || preferred === "es") return preferred;
  if (acceptLanguage && ACCEPT_LANGUAGE_REGEX.test(acceptLanguage)) {
    const detected = acceptLanguage.slice(0, 2).toLowerCase();
    if (detected === "pt" || detected === "es") return detected;
  }
  return "pt";
}

/**
 * Resolve o idioma ativo no servidor: cookie persistido > Accept-Language > pt.
 * Server components não têm acesso ao contexto cliente, por isso leem o cookie.
 */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const stored = store.get(LOCALE_COOKIE_NAME)?.value;
  const acceptLanguage = store.get("Accept-Language")?.value;
  return resolveLocale((stored as Locale) ?? "pt", acceptLanguage);
}

export async function getServerDictionary(): Promise<I18nDictionary> {
  const locale = await getServerLocale();
  return dictionaries[locale];
}
