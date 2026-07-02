import { DEFAULT_POST_OFFICE_FILTERS } from '../constants/postOfficeMarketplace';

function round2(n) {
  return Math.round(n * 100) / 100;
}

function compoundFv(principal, annualRate, years, compoundsPerYear = 1) {
  const r = annualRate / 100;
  const n = compoundsPerYear;
  const t = years;
  return principal * ((1 + r / n) ** (n * t));
}

function recurringDepositMaturity(monthlyDeposit, annualRate, months) {
  const r = annualRate / 100 / 12;
  if (r === 0) return monthlyDeposit * months;
  return monthlyDeposit * (((1 + r) ** months - 1) / r) * (1 + r);
}

function annualContributionFv(annualDeposit, annualRate, years) {
  const r = annualRate / 100;
  if (r === 0) return annualDeposit * years;
  return annualDeposit * (((1 + r) ** years - 1) / r) * (1 + r);
}

export function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatInterestRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function computeMaturityPreview(product = {}) {
  const type = product.calculatorType || product.categories?.[0] || 'time_deposit';
  const annualRate = Number(product.interestRate ?? 7.1);
  const tenureYears = product.tenureMaxMonths
    ? Number(product.tenureMaxMonths) / 12
    : product.tenureMinMonths
      ? Number(product.tenureMinMonths) / 12
      : 5;
  const tenureMonths = Math.round(tenureYears * 12);
  const principal = Number(product.minDepositAmount ?? 100000);

  let maturityValue = 0;
  let totalInvested = 0;

  switch (type) {
    case 'ppf':
    case 'sukanya_samriddhi': {
      totalInvested = principal * tenureYears;
      maturityValue = annualContributionFv(principal, annualRate, tenureYears);
      break;
    }
    case 'recurring_deposit': {
      totalInvested = principal * tenureMonths;
      maturityValue = recurringDepositMaturity(principal, annualRate, tenureMonths);
      break;
    }
    case 'monthly_income_scheme': {
      totalInvested = principal;
      maturityValue = principal;
      break;
    }
    case 'kvp': {
      totalInvested = principal;
      maturityValue = principal * 2;
      break;
    }
    case 'nsc':
    case 'senior_citizen_savings':
    case 'time_deposit':
    default: {
      totalInvested = principal;
      const freq = type === 'senior_citizen_savings' ? 4 : 1;
      maturityValue = compoundFv(principal, annualRate, tenureYears, freq);
      break;
    }
  }

  return {
    maturityValue: round2(maturityValue),
    totalInvested: round2(totalInvested),
    returnsAmount: round2(maturityValue - totalInvested),
  };
}

export function formatCompareCell(product, row) {
  if (!product) return '—';
  switch (row.type) {
    case 'maturity': {
      const preview = computeMaturityPreview(product);
      return preview.maturityValue ? formatCurrency(preview.maturityValue) : '—';
    }
    case 'text':
    default:
      return product[row.key] || '—';
  }
}

export function buildQueryParams(filters = {}) {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  return params;
}

export function resetPostOfficeFilters() {
  return { ...DEFAULT_POST_OFFICE_FILTERS };
}
