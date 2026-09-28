// Normaliza o slug da organização para uso em keys do R2.
//
// Slugs legítimos gerados por `createSlug` usam "_" (ex.: "mi_grupo") e podem
// conter maiúsculas — normalizar em vez de rejeitar evita 403 indevido no
// upload. A saída contém apenas [a-z0-9-], sem risco de path traversal.
// Para slugs já válidos a função é identidade (keys existentes inalteradas).
export function sanitizeSlugForKey(slug: string): string | null {
  const clean = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || null;
}

// Monta a key de imagem de endereço — 100% no servidor, o cliente nunca escolhe o caminho.
export function buildAddressImageKey(slug: string, id: string, extension: string): string | null {
  const safe = sanitizeSlugForKey(slug);
  if (!safe) return null;
  return `organizations/${safe}/addresses/${id}.${extension}`;
}

// Prefixo da organização para escopar deletes — deve usar a MESMA normalização do upload.
export function organizationKeyPrefix(slug: string): string | null {
  const safe = sanitizeSlugForKey(slug);
  if (!safe) return null;
  return `organizations/${safe}/`;
}
