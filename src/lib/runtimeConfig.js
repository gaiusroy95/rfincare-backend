const buildTime = {
  VITE_API_BASE_URL: import.meta.env?.VITE_API_BASE_URL || '',
  VITE_GA_MEASUREMENT_ID: import.meta.env?.VITE_GA_MEASUREMENT_ID || '',
  VITE_SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || '',
};

let runtime = { ...buildTime };
let loaded = false;

export function getRuntimeEnv(key) {
  return runtime[key] ?? buildTime[key] ?? '';
}

const PRODUCTION_API_BASE = 'https://rfincare.onrender.com';

/** Vercel full-stack deploy serves the SPA but rejects POST on /public/* — use Render API instead. */
export function normalizeApiBaseUrl(url) {
  const trimmed = String(url || '').trim().replace(/\/$/, '');
  if (!trimmed) return '';
  try {
    const { hostname, protocol } = new URL(trimmed);
    if (hostname === 'rfincare-backend.vercel.app') {
      return PRODUCTION_API_BASE;
    }
    if (!protocol.startsWith('http')) return '';
    return trimmed;
  } catch {
    return trimmed;
  }
}

export function inferApiBaseFromHost() {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  const origin = `${window.location.protocol}//${host}`;
  // Full-stack API deploy (serves SPA + /uploads from the same host).
  if (host === 'rfincare-backend.vercel.app') {
    return origin;
  }
  if (
    host === 'rfincare-frontend.vercel.app'
    || host.endsWith('.vercel.app')
    || host === 'rfincare.com'
    || host === 'www.rfincare.com'
  ) {
    return PRODUCTION_API_BASE;
  }
  return '';
}

export function getApiBaseUrl() {
  const raw = getRuntimeEnv('VITE_API_BASE_URL') || inferApiBaseFromHost() || '';
  return normalizeApiBaseUrl(raw);
}

function applyInferredDefaults() {
  const inferred = normalizeApiBaseUrl(
    buildTime.VITE_API_BASE_URL?.replace(/\/$/, '') || inferApiBaseFromHost(),
  );
  if (inferred) {
    runtime = { ...buildTime, VITE_API_BASE_URL: inferred };
    loaded = true;
  }
}

async function fetchRemoteOverrides() {
  const buildBase = buildTime.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
  const inferredBase = inferApiBaseFromHost();
  const fetchBase = buildBase || inferredBase;
  const configUrl = fetchBase
    ? `${fetchBase}/public/runtime-config`
    : '/public/runtime-config';
  try {
    const res = await fetch(configUrl, { credentials: 'omit' });
    if (!res.ok) return;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return;
    const data = await res.json();
    runtime = { ...runtime, ...(data?.vite || {}) };
    runtime.VITE_API_BASE_URL = normalizeApiBaseUrl(
      runtime.VITE_API_BASE_URL || inferredBase || '',
    );
    if (!runtime.VITE_API_BASE_URL && inferredBase) {
      runtime.VITE_API_BASE_URL = normalizeApiBaseUrl(inferredBase);
    }
    loaded = true;
  } catch {
    applyInferredDefaults();
  }
}

export async function loadRuntimeConfig() {
  applyInferredDefaults();
  if (loaded && runtime.VITE_API_BASE_URL) {
    fetchRemoteOverrides();
    return runtime;
  }

  const buildBase = buildTime.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
  const inferredBase = inferApiBaseFromHost();
  if (buildBase || inferredBase) {
    runtime.VITE_API_BASE_URL = normalizeApiBaseUrl(buildBase || inferredBase);
    loaded = true;
    fetchRemoteOverrides();
    return runtime;
  }

  await fetchRemoteOverrides();
  if (!loaded) {
    runtime = { ...buildTime };
    loaded = true;
  }
  return runtime;
}

export function isRuntimeConfigLoaded() {
  return loaded;
}

export function applyRuntimeToApiClient(apiClient) {
  const base = getApiBaseUrl();
  if (base) apiClient.defaults.baseURL = base;
}
