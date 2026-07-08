import { getApiBaseUrl } from '../lib/runtimeConfig';

/** Canonical Wikimedia logos for major partner banks. */
const KNOWN_BANK_LOGO_URLS = {
  'hdfc bank': 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg',
  'icici bank': 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg',
  'state bank of india': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg',
  sbi: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg',
};

function normalizeBankNameKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function getKnownBankLogoUrl(bank) {
  const key = normalizeBankNameKey(bank?.name);
  return KNOWN_BANK_LOGO_URLS[key] || null;
}

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
  const raw = bank?.logoUrl || bank?.logo_url || getKnownBankLogoUrl(bank) || null;
  const resolved = resolveBankLogoUrl(raw);
  const version = normalizeVersion(bank?.updatedAt || bank?.updated_at);
  return appendVersion(resolved, version);
}

export function getBankLogoAlt(bank) {
  return bank?.logoAlt || bank?.logo_alt || `${bank?.name || 'Bank'} logo`;
}

const BANK_SHORT_LABELS = {
  'state bank of india': 'SBI',
  sbi: 'SBI',
  'hdfc bank': 'HDFC',
  hdfc: 'HDFC',
  'icici bank': 'ICICI',
  icici: 'ICICI',
  'axis bank': 'Axis',
  'punjab national bank': 'PNB',
  pnb: 'PNB',
  'bank of baroda': 'BoB',
  'kotak mahindra bank': 'Kotak',
};

/** Short label for compact UI chips (e.g. homepage partner pills). */
export function getBankShortLabel(bankOrName) {
  const name = typeof bankOrName === 'string' ? bankOrName : bankOrName?.name;
  const key = normalizeBankNameKey(name);
  if (BANK_SHORT_LABELS[key]) return BANK_SHORT_LABELS[key];
  const words = String(name || '').trim().split(/\s+/);
  if (words.length === 1) return words[0];
  if (words.length >= 2 && words.every((w) => w.length <= 4)) {
    return words.map((w) => w[0]?.toUpperCase() || '').join('');
  }
  return words[0];
}

