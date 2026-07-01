import { DEFAULT_MUTUAL_FUND_FILTERS, getRiskLabel } from '../constants/mutualFundMarketplace';

export function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function formatExpenseRatio(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function formatAum(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k Cr`;
  return `₹${n.toLocaleString('en-IN')} Cr`;
}

export function formatRating(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)} ★`;
}

export function formatCompareCell(fund, row) {
  if (!fund) return '—';
  switch (row.type) {
    case 'percent': return formatPercent(fund[row.key]);
    case 'expense': return formatExpenseRatio(fund[row.key]);
    case 'aum': return formatAum(fund[row.key]);
    case 'rating': return formatRating(fund[row.key]);
    case 'risk': return fund.riskLevel ? getRiskLabel(fund.riskLevel) : '—';
    case 'text':
    default: return fund[row.key] || '—';
  }
}

export function buildMutualFundQueryParams(filters = {}) {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.riskLevel && filters.riskLevel !== 'all') params.riskLevel = filters.riskLevel;
  if (filters.returns && filters.returns !== 'all') params.returns = filters.returns;
  if (filters.expenseRatio && filters.expenseRatio !== 'all') params.expenseRatio = filters.expenseRatio;
  if (filters.rating && filters.rating !== 'all') params.rating = filters.rating;
  if (filters.supportsSip) params.supportsSip = 'true';
  if (filters.supportsLumpsum) params.supportsLumpsum = 'true';
  return params;
}

export function countActiveFilters(filters = {}) {
  let count = 0;
  if (filters.search?.trim()) count += 1;
  if (filters.category && filters.category !== 'all') count += 1;
  if (filters.riskLevel && filters.riskLevel !== 'all') count += 1;
  if (filters.returns && filters.returns !== 'all') count += 1;
  if (filters.expenseRatio && filters.expenseRatio !== 'all') count += 1;
  if (filters.rating && filters.rating !== 'all') count += 1;
  if (filters.supportsSip) count += 1;
  if (filters.supportsLumpsum) count += 1;
  return count;
}

export function resetMutualFundFilters() {
  return { ...DEFAULT_MUTUAL_FUND_FILTERS };
}
