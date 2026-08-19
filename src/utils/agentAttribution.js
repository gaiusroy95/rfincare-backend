const STORAGE_KEY = 'rfincare_agent_code';
const REFERRAL_STORAGE_KEY = 'rfincare_referral';

function readParam(params, key) {
  const value = params.get(key);
  return value ? String(value).trim() : null;
}

function readFromUrl() {
  if (typeof window === 'undefined') return { agent: null, ref: null, aref: null };
  const params = new URLSearchParams(window.location.search);
  return {
    agent: readParam(params, 'agent') || readParam(params, 'agentCode'),
    ref: readParam(params, 'ref'),
    aref: readParam(params, 'aref') || readParam(params, 'agentRef'),
  };
}

export function normalizeAgentCode(value) {
  if (!value) return null;
  const code = String(value).trim().toUpperCase();
  return code.length >= 3 ? code : null;
}

export function normalizeReferralCode(value) {
  if (!value) return null;
  const code = String(value).trim().toUpperCase();
  return code.length >= 4 ? code : null;
}

function writeReferralState(state) {
  try {
    sessionStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(state));
    if (state?.sourcedAgentCode) {
      sessionStorage.setItem(STORAGE_KEY, state.sourcedAgentCode);
    }
  } catch {
    /* ignore */
  }
}

function readReferralState() {
  try {
    const raw = sessionStorage.getItem(REFERRAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.referralCode) return parsed;
    }
  } catch {
    /* ignore */
  }
  const legacy = normalizeAgentCode(
    typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null,
  );
  if (!legacy) return null;
  return {
    referralCode: legacy,
    referralProgram: 'customer',
    sourcedAgentCode: legacy,
  };
}

export function captureAgentFromUrl() {
  const fromUrl = readFromUrl();
  const aref = normalizeReferralCode(fromUrl.aref);
  const ref = normalizeReferralCode(fromUrl.ref);
  const agent = normalizeAgentCode(fromUrl.agent);

  if (aref) {
    const state = {
      referralCode: aref,
      referralProgram: 'agent',
      sourcedAgentCode: null,
    };
    writeReferralState(state);
    return aref;
  }

  if (ref) {
    const looksLikeAgent = /^RFA([-\s]|$)/.test(ref);
    const state = {
      referralCode: ref,
      referralProgram: 'customer',
      sourcedAgentCode: looksLikeAgent ? ref : null,
    };
    writeReferralState(state);
    return ref;
  }

  if (agent) {
    const state = {
      referralCode: agent,
      referralProgram: 'customer',
      sourcedAgentCode: agent,
    };
    writeReferralState(state);
    return agent;
  }

  return readReferralState()?.referralCode || null;
}

export function getStoredAgentCode() {
  const state = readReferralState();
  return normalizeAgentCode(state?.sourcedAgentCode) || normalizeAgentCode(
    (() => {
      try {
        return sessionStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    })(),
  );
}

export function setStoredAgentCode(code) {
  const normalized = normalizeAgentCode(code);
  if (!normalized) return;
  const prev = readReferralState() || {};
  writeReferralState({
    ...prev,
    referralCode: prev.referralCode || normalized,
    referralProgram: prev.referralProgram || 'customer',
    sourcedAgentCode: normalized,
  });
}

export function clearStoredAgentCode() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getAgentAttributionPayload() {
  const state = readReferralState();
  if (!state?.referralCode && !state?.sourcedAgentCode) return {};
  return {
    sourcedAgentCode: state.sourcedAgentCode || undefined,
    agentCode: state.sourcedAgentCode || undefined,
    referralCode: state.referralCode || undefined,
    referralProgram: state.referralProgram || undefined,
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

export function buildReferralShareUrl(path, referralCode, program = 'customer') {
  const code = normalizeReferralCode(referralCode);
  if (!code) return path;
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const url = new URL(path, base || 'https://rfincare.com');
  if (program === 'agent') url.searchParams.set('aref', code);
  else if (String(code).startsWith('RFA')) url.searchParams.set('agent', code);
  else url.searchParams.set('ref', code);
  return url.toString();
}
