import { LOAN_PRODUCTS } from '../constants/loanProducts';

/**
 * Canonical shared loan-product labels used across Approval Matrix + Interest Matrix.
 * Ensures partner products always appear even before catalog/banks finish loading.
 */
export const SHARED_BANK_PARTNER_PRODUCTS = [
  'Personal Loan',
  'Home Loan',
  'Loan Against Property',
  'Mortgage Loan',
  'Business Loan',
  'Car Loan',
  'Two Wheeler Loan',
  'Over Draft Loan',
  'CC Limit',
  'Consumer Loan',
  'School Loan',
  'Equipment Loan',
  'Kishan Credit Card',
  'Credit Card',
  'Unsecured CC Limit',
  'Unsecured Overdraft Limit',
  'Secured CC Limit',
  'Secured Overdraft Limit',
  'Add Other Product',
];

/** Normalize for dedupe keys (case/spacing insensitive). */
export function normalizeLoanTypeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

export function humanizeLoanTypeLabel(value) {
  return String(value || '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Stable select value: api_key / loan_type / slugified product name. */
export function toLoanTypeOptionValue({ name, label, apiKey, loanType, slug } = {}) {
  const explicit =
    String(apiKey || loanType || slug || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
  if (explicit) return explicit.replace(/_+/g, '_');

  const fromName = String(name || label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  return fromName || '';
}

function upsertOption(map, { value, label, bankId = null }) {
  const rawValue = String(value || '').trim();
  const rawLabel = String(label || '').trim();
  if (!rawValue && !rawLabel) return;

  const optionValue = rawValue || toLoanTypeOptionValue({ name: rawLabel });
  if (!optionValue) return;

  const key = normalizeLoanTypeKey(rawLabel || optionValue);
  if (!key) return;

  const existing = map.get(key);
  if (existing) {
    if (bankId && existing.bankId && existing.bankId !== bankId) {
      existing.shared = true;
    }
    return;
  }

  map.set(key, {
    value: optionValue,
    label: rawLabel || humanizeLoanTypeLabel(optionValue),
    bankId,
  });
}

function collectFromBankProduct(map, product, bankId) {
  if (!product) return;
  const data = product.data && typeof product.data === 'object' ? product.data : {};
  const name =
    product.name
    || product.label
    || data.name
    || data.label
    || '';
  const loanType =
    product.loanType
    || product.loan_type
    || data.loanType
    || data.loan_type
    || data.type
    || data.productType
    || '';
  const apiKey = product.apiKey || product.api_key || data.apiKey || data.api_key || '';

  const value = toLoanTypeOptionValue({
    name,
    label: name,
    apiKey: apiKey || undefined,
    loanType: name ? undefined : loanType,
  });

  upsertOption(map, {
    value: value || loanType || name,
    label: name || humanizeLoanTypeLabel(loanType || value),
    bankId: bankId || product.bankId || product.bank_id || null,
  });
}

function collectFromCatalogProduct(map, product) {
  if (!product || product.isActive === false) return;
  const label = product.label || product.name || product.shortLabel || '';
  const value = toLoanTypeOptionValue({
    name: label,
    label,
    apiKey: product.apiKey || product.api_key,
    slug: product.slug,
    loanType: product.parentLoanType || product.loanType,
  });
  upsertOption(map, {
    value,
    label: label || humanizeLoanTypeLabel(value),
    bankId: product.bankId || product.bank_id || null,
  });
}

/**
 * Build Loan Type / Product Type select options from:
 * shared partner list + static catalog + admin catalog + bank partner products.
 */
export function buildLoanTypeSelectOptions({
  banks = [],
  catalogProducts = [],
  selectedBankId = null,
  includeAllOption = true,
  allOptionLabel = 'All Loan Types',
  valueMode = 'slug',
  includeSharedPartnerProducts = true,
} = {}) {
  const map = new Map();

  if (includeSharedPartnerProducts) {
    for (const label of SHARED_BANK_PARTNER_PRODUCTS) {
      upsertOption(map, {
        value: toLoanTypeOptionValue({ name: label, label }),
        label,
      });
    }
  }

  for (const product of LOAN_PRODUCTS) {
    collectFromCatalogProduct(map, product);
  }

  for (const product of catalogProducts || []) {
    collectFromCatalogProduct(map, product);
  }

  for (const bank of banks || []) {
    const bankId = bank?.id || null;
    const products = bank?.bankProducts || bank?.bank_products || [];
    for (const product of products) {
      collectFromBankProduct(map, product, bankId);
    }
  }

  let options = [...map.values()];

  if (selectedBankId) {
    options.sort((a, b) => {
      const aMatch = a.bankId === selectedBankId ? 0 : 1;
      const bMatch = b.bankId === selectedBankId ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return a.label.localeCompare(b.label);
    });
  } else {
    options.sort((a, b) => a.label.localeCompare(b.label));
  }

  options = options.map(({ value, label }) => ({
    value: valueMode === 'label' ? label : value,
    label,
  }));

  if (valueMode === 'label') {
    const seen = new Set();
    options = options.filter((opt) => {
      const key = normalizeLoanTypeKey(opt.value);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  if (includeAllOption) {
    return [{ value: '', label: allOptionLabel }, ...options];
  }
  return options;
}

/** @deprecated Prefer buildLoanTypeSelectOptions */
export function extractLoanProductOptionsFromBanks(banks = []) {
  return buildLoanTypeSelectOptions({
    banks,
    includeAllOption: false,
    valueMode: 'label',
  });
}
