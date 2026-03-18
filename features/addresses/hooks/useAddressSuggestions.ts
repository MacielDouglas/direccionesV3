// features/addresses/hooks/useAddressSuggestions.ts
import { useMemo } from "react";
import Fuse from "fuse.js";

interface Options {
  existing: string[];
  query: string; // ✅ recebe de fora — SmartCombobox controla
  threshold?: number;
}

interface Suggestion {
  value: string;
  isNew: boolean;
  score: number;
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function useAddressSuggestions({
  existing,
  query,
  threshold = 0.4,
}: Options) {
  const fuse = useMemo(
    () =>
      new Fuse(existing, {
        threshold,
        includeScore: true,
        ignoreLocation: true,
        getFn: (item) => normalize(item),
      }),
    [existing, threshold],
  );

  const suggestions = useMemo((): Suggestion[] => {
    if (!query.trim()) {
      // Sem digitação — lista todos os existentes
      return existing.map((v) => ({ value: v, isNew: false, score: 1 }));
    }

    const results = fuse.search(normalize(query));
    const matched = results.map((r) => ({
      value: r.item,
      isNew: false,
      score: 1 - (r.score ?? 0),
    }));

    // Adiciona "nuevo" só se não existe exato
    const alreadyExact = existing.some(
      (e) => normalize(e) === normalize(query),
    );
    if (!alreadyExact) {
      matched.push({ value: query.trim(), isNew: true, score: 0 });
    }

    return matched;
  }, [query, fuse, existing]);

  return { suggestions };
}
