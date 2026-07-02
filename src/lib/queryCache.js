const store = new Map();
const inflight = new Map();

const DEFAULT_TTL_MS = 120_000;

function isExpired(entry) {
  return !entry || Date.now() > entry.expiresAt;
}

/**
 * Lightweight in-memory query cache with request deduplication.
 * Use for public/read-mostly endpoints (visibility, catalogs, etc.).
 */
export function queryCacheGet(key) {
  const entry = store.get(key);
  if (isExpired(entry)) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function queryCacheSet(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function queryCacheInvalidate(keyOrPrefix) {
  if (!keyOrPrefix) {
    store.clear();
    inflight.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) store.delete(key);
  }
  for (const key of inflight.keys()) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) inflight.delete(key);
  }
}

export async function queryCacheFetch(key, fetcher, ttlMs = DEFAULT_TTL_MS) {
  const cached = queryCacheGet(key);
  if (cached != null) return cached;

  if (inflight.has(key)) return inflight.get(key);

  const promise = Promise.resolve()
    .then(fetcher)
    .then((value) => {
      queryCacheSet(key, value, ttlMs);
      inflight.delete(key);
      return value;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}
