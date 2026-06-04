import { getApiBaseUrl } from '../lib/runtimeConfig';

/** Resolve stored logo path or external URL for display. */
export function resolveBankLogoUrl(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const base = getApiBaseUrl().replace(/\/$/, '');
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${base}${path}`;
  }
  return trimmed;
}

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
  const resolved = resolveBankLogoUrl(raw);
  const version = normalizeVersion(bank?.updatedAt || bank?.updated_at);
  return appendVersion(resolved, version);
}

export function getBankLogoAlt(bank) {
  return bank?.logoAlt || bank?.logo_alt || `${bank?.name || 'Bank'} logo`;
}

