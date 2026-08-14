import { getUserLanguage } from "@/server/users";
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

function isLocale(value: string | null | undefined): value is Locale {
  return value === "pt" || value === "es";
}

/**
 * Resolve o idioma ativo no servidor: cookie persistido > preferência no banco > Accept-Language > pt.
 * Server components não têm acesso ao contexto cliente, por isso leem cookie/banco.
 */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const stored = store.get(LOCALE_COOKIE_NAME)?.value;
  if (isLocale(stored)) return stored;

  const fromDb = await getUserLanguage();
  if (fromDb) return fromDb;

  const acceptLanguage = store.get("Accept-Language")?.value;
  return resolveLocale("pt", acceptLanguage ?? undefined);
}

export async function getServerDictionary(): Promise<I18nDictionary> {
  const locale = await getServerLocale();
  return dictionaries[locale];
}
