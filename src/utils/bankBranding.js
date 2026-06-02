function appendVersion(url, versionValue) {
  if (!url) return null;
  if (!versionValue) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(versionValue)}`;
}

function normalizeVersion(value) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.getTime();
  return String(value);
}

export function getBankLogoUrl(bank) {
  const raw = bank?.logoUrl || bank?.logo_url || null;
  const version = normalizeVersion(bank?.updatedAt || bank?.updated_at);
  return appendVersion(raw, version);
}

export function getBankLogoAlt(bank) {
  return bank?.logoAlt || bank?.logo_alt || `${bank?.name || 'Bank'} logo`;
}

