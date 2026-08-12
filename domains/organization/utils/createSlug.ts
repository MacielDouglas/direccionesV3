export function createSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\p{M}]/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_");
}
