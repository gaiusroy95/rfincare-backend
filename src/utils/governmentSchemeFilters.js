import { DEFAULT_GOVERNMENT_SCHEME_FILTERS } from '../constants/governmentSchemeMarketplace';

export function formatInterestRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}%`;
}

export function formatLoanAmount(scheme) {
  if (!scheme) return '—';
  const min = scheme.loanAmountMin;
  const max = scheme.loanAmountMax;
  if (min != null && max != null) {
    return `₹${Number(min).toLocaleString('en-IN')} – ₹${Number(max).toLocaleString('en-IN')}`;
  }
  if (max != null) return `Up to ₹${Number(max).toLocaleString('en-IN')}`;
  if (min != null) return `From ₹${Number(min).toLocaleString('en-IN')}`;
  return '—';
}

export function formatCompareCell(scheme, row) {
  if (!scheme) return '—';
  switch (row.type) {
    case 'rate':
      return formatInterestRate(scheme[row.key]);
    case 'percent':
      return formatPercent(scheme[row.key]);
    case 'loanAmount':
      return formatLoanAmount(scheme);
    case 'text':
    default:
      return scheme[row.key] || '—';
  }
}

export function buildQueryParams(filters = {}) {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  return params;
}

export function resetGovernmentSchemeFilters() {
  return { ...DEFAULT_GOVERNMENT_SCHEME_FILTERS };
}
