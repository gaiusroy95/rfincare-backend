const SESSION_PREFIX = 'rfincare_marketplace_profile_';

export function getMarketplaceSessionKey(marketplaceType) {
  return `${SESSION_PREFIX}${marketplaceType}`;
}

export function loadMarketplaceProfile(marketplaceType) {
  try {
    const raw = sessionStorage.getItem(getMarketplaceSessionKey(marketplaceType));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.verifiedAt || !data?.phone || !data?.email) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveMarketplaceProfile(marketplaceType, profile) {
  const payload = {
    ...profile,
    marketplaceType,
    verifiedAt: profile.verifiedAt || Date.now(),
    savedAt: Date.now(),
  };
  sessionStorage.setItem(getMarketplaceSessionKey(marketplaceType), JSON.stringify(payload));
  return payload;
}

export function clearMarketplaceProfile(marketplaceType) {
  sessionStorage.removeItem(getMarketplaceSessionKey(marketplaceType));
}
