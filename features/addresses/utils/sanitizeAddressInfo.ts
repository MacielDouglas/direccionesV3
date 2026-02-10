import { GENDER_REGEX, NATIONALITY_REGEX } from "../regex/address.regex";

function maskWord(word: string): string {
  return "*".repeat(word.length);
}

export function sanitizedAddressInfo(text: string): string {
  if (!text) return text;

  return text
    .replace(GENDER_REGEX, (match) => maskWord(match))
    .replace(NATIONALITY_REGEX, (match) => maskWord(match));
}
