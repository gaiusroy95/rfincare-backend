const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();
const inflight = new Map();

function cacheKey(path, params = {}) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return `${path}?${sorted}`;
}

export function getCachedBanks(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCachedBanks(key, data) {
  cache.set(key, { data, at: Date.now() });
}

export function invalidateBankCache() {
  cache.clear();
}

/**
 * Deduplicate concurrent identical bank list requests and reuse recent responses.
 */
export async function fetchBanksCached(key, fetcher) {
  const cached = getCachedBanks(key);
  if (cached) return cached;

  if (inflight.has(key)) return inflight.get(key);

  const promise = fetcher()
    .then((data) => {
      setCachedBanks(key, data);
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

export function buildBankListCacheKey(params = {}) {
  return cacheKey('/banks', params);
}
