import Fuse from "fuse.js";
// features/addresses/hooks/useAddressSuggestions.ts
import { useMemo } from "react";

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

const normalize = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

const MAX_SUGGESTIONS = 50;

export function useAddressSuggestions({ existing, query, threshold = 0.4 }: Options) {
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
      // Sem digitação — amostra dos existentes (dropdown gigante trava o mobile)
      return existing.slice(0, MAX_SUGGESTIONS).map((v) => ({ value: v, isNew: false, score: 1 }));
    }

    const results = fuse.search(normalize(query)).slice(0, MAX_SUGGESTIONS);
    const matched = results.map((r) => ({
      value: r.item,
      isNew: false,
      score: 1 - (r.score ?? 0),
    }));

    // Adiciona "nuevo" só se não existe exato
    const alreadyExact = existing.some((e) => normalize(e) === normalize(query));
    if (!alreadyExact) {
      matched.push({ value: query.trim(), isNew: true, score: 0 });
    }

    return matched;
  }, [query, fuse, existing]);

  return { suggestions };
}
