const STORAGE_KEY = 'rfincare_agent_code';

function readFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('agent') || params.get('ref') || params.get('agentCode') || null;
}

export function normalizeAgentCode(value) {
  if (!value) return null;
  const code = String(value).trim().toUpperCase();
  return code.length >= 3 ? code : null;
}

export function captureAgentFromUrl() {
  const fromUrl = normalizeAgentCode(readFromUrl());
  if (!fromUrl) return null;
  try {
    sessionStorage.setItem(STORAGE_KEY, fromUrl);
  } catch {
    /* ignore */
  }
  return fromUrl;
}

export function getStoredAgentCode() {
  try {
    return normalizeAgentCode(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function setStoredAgentCode(code) {
  const normalized = normalizeAgentCode(code);
  if (!normalized) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    /* ignore */
  }
}

export function clearStoredAgentCode() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getAgentAttributionPayload() {
  const code = getStoredAgentCode();
  if (!code) return {};
  return {
    sourcedAgentCode: code,
    agentCode: code,
  };
}

export function initAgentAttribution() {
  captureAgentFromUrl();
}

export function buildAgentReferralUrl(path, agentCode) {
  const code = normalizeAgentCode(agentCode);
  if (!code) return path;
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const url = new URL(path, base || 'https://rfincare.com');
  url.searchParams.set('agent', code);
  return url.toString();
}
