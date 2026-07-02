import { DEFAULT_FIXED_INCOME_FILTERS } from '../constants/fixedIncomeMarketplace';

export function formatInterestRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function formatMonths(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '—';
  if (n % 12 === 0) return `${n / 12} yr`;
  return `${n} mo`;
}

export function formatBool(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '—';
}

export function formatCompareCell(product, row) {
  if (!product) return '—';
  switch (row.type) {
    case 'rate':
      return formatInterestRate(product[row.key] ?? product.interestRateMax ?? product.interestRateMin);
    case 'months':
      return formatMonths(product[row.key]);
    case 'bool':
      return formatBool(product[row.key]);
    default:
      return product[row.key] ?? '—';
  }
}

export function buildFixedIncomeQueryParams(filters = {}) {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  return params;
}

export function resetFixedIncomeFilters() {
  return { ...DEFAULT_FIXED_INCOME_FILTERS };
}

