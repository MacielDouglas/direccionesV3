type RateEntry = {
  count: number;
  resetAt: number;
};

// Rate limit em memória (por instância). Aceitável para este projeto:
// sem tabela no banco, sem custo de latência; contadores são zerados no restart.
const buckets = new Map<string, RateEntry>();

export function checkRateLimit(key: string, opts?: { max?: number; windowMs?: number }): boolean {
  const { max = 5, windowMs = 15 * 60 * 1000 } = opts ?? {};
  const now = Date.now();

  if (buckets.size > 10_000) {
    for (const [bucketKey, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count += 1;
  return entry.count <= max;
}
