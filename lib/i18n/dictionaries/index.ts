import type { I18nDictionary, Locale } from "../types";
import es from "./es";
import pt from "./pt";

export const dictionaries: Record<Locale, I18nDictionary> = {
  pt: pt,
  es: es,
};

export const localeLabels: Record<Locale, string> = {
  pt: "Português",
  es: "Español",
};
