import { COMPARE_TABLE_ROWS as INSURANCE_ROWS } from './insuranceMarketplace';
import { COMPARE_TABLE_ROWS as MF_ROWS } from './mutualFundMarketplace';
import { COMPARE_TABLE_ROWS as CC_ROWS } from './creditCardMarketplace';
import { COMPARE_TABLE_ROWS as FI_ROWS } from './fixedIncomeMarketplace';
import { COMPARE_TABLE_ROWS as PO_ROWS } from './postOfficeMarketplace';
import { COMPARE_TABLE_ROWS as GS_ROWS } from './governmentSchemeMarketplace';
import { COMPARE_TABLE_ROWS as INV_ROWS } from './investmentMarketplace';
import { formatCompareCell as formatInsuranceCell } from '../utils/insuranceFilters';
import { formatPremiumRange, formatSumInsuredRange } from '../utils/insuranceFilters';
import { formatCompareCell as formatMfCell } from '../utils/mutualFundFilters';
import { formatPercent, formatExpenseRatio, formatRating, formatAum } from '../utils/mutualFundFilters';
import { formatCompareCell as formatCcCell, formatCardFee } from '../utils/creditCardFilters';
import { formatCompareCell as formatFiCell, formatInterestRate, formatMonths, formatBool } from '../utils/fixedIncomeFilters';
import { formatCompareCell as formatPoCell } from '../utils/postOfficeFilters';
import { formatCompareCell as formatGsCell, formatLoanAmount } from '../utils/governmentSchemeFilters';
import { formatCompareCell as formatInvCell, formatPercent as formatInvPercent, formatCurrency as formatInvCurrency } from '../utils/investmentMarketplaceFilters';
import { getRiskLabel } from './mutualFundMarketplace';
import { getRiskLabel as getInvestmentRiskLabel } from './investmentMarketplace';
import { getServiceUrl } from '../utils/insuranceFilters';
import { resolveBankLogoUrl } from '../utils/bankBranding';
import { getMarketplaceCompareKey } from '../utils/bankMarketplace';

export const COMPARE_SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

function pickPriceNumber(product, type) {
  if (type === 'insurance') return Number(product?.premiumFrom ?? product?.premiumTo ?? 0);
  if (type === 'mutual_fund') return Number(product?.returns3y ?? product?.returns1y ?? 0);
  if (type === 'credit_card') return Number(product?.annualFee ?? 0);
  if (type === 'loan') return Number(product?.interestRate ?? 999);
  if (type === 'fixed_income') return Number(product?.interestRate ?? product?.interestRateMax ?? 0);
  if (type === 'post_office') return Number(product?.interestRate ?? 0);
  if (type === 'government_scheme') return Number(product?.subsidyPercent ?? product?.interestRate ?? 0);
  if (type === 'investment') return Number(product?.returns3y ?? product?.returns1y ?? 0);
  return 0;
}

export function sortCompareProducts(products, sortBy, type) {
  const list = [...products];
  switch (sortBy) {
    case 'price-asc':
      return list.sort((a, b) => pickPriceNumber(a, type) - pickPriceNumber(b, type));
    case 'price-desc':
      return list.sort((a, b) => pickPriceNumber(b, type) - pickPriceNumber(a, type));
    case 'rating-desc':
      return list.sort((a, b) => Number(b?.rating ?? b?.claimSettlementRatio ?? 0) - Number(a?.rating ?? a?.claimSettlementRatio ?? 0));
    case 'name-asc':
      return list.sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')));
    default:
      return list.sort((a, b) => Number(b?.displayPriority ?? 0) - Number(a?.displayPriority ?? 0));
  }
}

const INSURANCE_CONFIG = {
  type: 'insurance',
  label: 'Insurance',
  maxCompare: 3,
  tableRows: INSURANCE_ROWS,
  formatCell: formatInsuranceCell,
  getId: (p) => p.id,
  getName: (p) => p.name,
  getProvider: (p) => p.insurerName,
  getLogo: (p) => resolveBankLogoUrl(p?.logoUrl),
  getBadge: (p) => (p?.displayPriority >= 80 ? 'Lowest Price Guarantee' : p?.highlights ? 'Featured' : null),
  getSubtitle: (p) => p?.highlights || null,
  getHighlightMetrics: (p) => [
    { label: 'Premium', value: formatPremiumRange(p) },
    { label: 'Sum insured', value: formatSumInsuredRange(p) },
    { label: 'Claim settled', value: p?.claimSettlementRatio != null ? `${p.claimSettlementRatio}%` : '—' },
  ],
  getFeatures: (p) => [...(p?.features || []), ...(p?.benefits || [])].slice(0, 5),
  getPrice: (p) => formatPremiumRange(p),
  getPriceLabel: (p) => (p?.premiumUnit === 'monthly' ? '/month' : '/year'),
  getOriginalPrice: () => null,
  getSavingsText: (p) => (p?.taxBenefit80d ? '80D tax benefit' : p?.taxBenefit80c ? '80C tax benefit' : null),
  getCtaUrl: (p, ctx) => (
    p?.purchaseEnabled && (ctx?.service || 'new_policy') === 'new_policy'
      ? null
      : getServiceUrl(p, ctx?.service || 'new_policy')
  ),
  getCtaLabel: (p, ctx) => (
    p?.purchaseEnabled && (ctx?.service || 'new_policy') === 'new_policy'
      ? 'Buy on Rfincare'
      : 'View Plan'
  ),
};

const MUTUAL_FUND_CONFIG = {
  type: 'mutual_fund',
  label: 'Mutual Fund',
  maxCompare: 3,
  tableRows: MF_ROWS,
  formatCell: formatMfCell,
  getId: (p) => p.id,
  getName: (p) => p.name,
  getProvider: (p) => p.amcName,
  getLogo: (p) => resolveBankLogoUrl(p?.logoUrl),
  getBadge: (p) => (p?.rating >= 4.5 ? 'Top Rated' : p?.supportsSip ? 'SIP Available' : null),
  getSubtitle: (p) => (p?.fundManager ? `Fund manager: ${p.fundManager}` : null),
  getHighlightMetrics: (p) => [
    { label: '3Y Returns', value: formatPercent(p?.returns3y) },
    { label: 'Risk', value: p?.riskLevel ? getRiskLabel(p.riskLevel) : '—' },
    { label: 'Expense ratio', value: formatExpenseRatio(p?.expenseRatio) },
  ],
  getFeatures: (p) => (p?.features || []).slice(0, 5),
  getPrice: (p) => (p?.minSipAmount ? `SIP from ₹${Number(p.minSipAmount).toLocaleString('en-IN')}` : formatPercent(p?.returns1y)),
  getPriceLabel: (p) => (p?.minSipAmount ? '/month' : '1Y returns'),
  getOriginalPrice: () => null,
  getSavingsText: (p) => (p?.rating ? `${formatRating(p.rating)} rating` : null),
  getCtaUrl: (p) => p?.investUrl,
  getCtaLabel: () => 'Invest Now',
};

const CREDIT_CARD_CONFIG = {
  type: 'credit_card',
  label: 'Credit Card',
  maxCompare: 3,
  tableRows: CC_ROWS,
  formatCell: formatCcCell,
  getId: (p) => p.id,
  getName: (p) => p.name,
  getProvider: (p) => p.bankName,
  getLogo: (p) => resolveBankLogoUrl(p?.logoUrl),
  getBadge: (p) => (Number(p?.annualFee) === 0 ? 'Lifetime Free' : p?.loungeAccess ? 'Lounge Access' : null),
  getSubtitle: (p) => p?.rewardPoints || p?.description || null,
  getHighlightMetrics: (p) => [
    { label: 'Annual fee', value: formatCardFee(p?.annualFee) },
    { label: 'Joining fee', value: formatCardFee(p?.joiningFee) },
    { label: 'Network', value: p?.cardNetwork || '—' },
  ],
  getFeatures: (p) => [...(p?.features || []), ...(p?.advantages || []), ...(p?.benefits || [])].slice(0, 5),
  getPrice: (p) => formatCardFee(p?.annualFee),
  getPriceLabel: () => '/year',
  getOriginalPrice: (p) => (Number(p?.joiningFee) > 0 ? formatCardFee(p.joiningFee) : null),
  getSavingsText: (p) => (Number(p?.annualFee) === 0 ? 'No annual fee' : null),
  getCtaUrl: () => null,
  getCtaLabel: () => 'Apply Now',
};

const LOAN_CONFIG = {
  type: 'loan',
  label: 'Loan',
  maxCompare: 4,
  tableRows: [
    { key: 'interestRate', label: 'Interest rate', type: 'rate' },
    { key: 'processingFee', label: 'Processing fee', type: 'text' },
    { key: 'probability', label: 'Match score', type: 'percent' },
    { key: 'rating', label: 'Rating', type: 'text' },
    { key: 'maxLoanAmount', label: 'Max loan amount', type: 'text' },
    { key: 'tenure', label: 'Tenure', type: 'text' },
  ],
  formatCell: (bank, row) => {
    if (!bank) return '—';
    if (row.key === 'interestRate') return bank.interestRate != null ? `${bank.interestRate}%` : '—';
    if (row.key === 'probability') return bank.probability != null ? `${bank.probability}%` : '—';
    return bank[row.key] || '—';
  },
  getId: (p) => getMarketplaceCompareKey(p) || p.id,
  getName: (p) => p.productName && p.productName !== p.name ? p.productName : p.name,
  getProvider: (p) => (p.productName && p.productName !== p.name ? p.name : p.productCategoryLabel || 'Bank'),
  getLogo: (p) => p?.logo,
  getBadge: (p) => (p?.probability >= 80 ? 'Best Match' : p?.isCreditCard ? 'Credit Card' : null),
  getSubtitle: (p) => p?.productCategoryLabel || null,
  getHighlightMetrics: (p) => [
    { label: 'Interest rate', value: p?.interestRate != null ? `${p.interestRate}%` : '—' },
    { label: 'Processing fee', value: p?.processingFee || '—' },
    { label: 'Match score', value: p?.probability != null ? `${p.probability}%` : '—' },
  ],
  getFeatures: (p) => (p?.features || []).slice(0, 5),
  getPrice: (p) => (p?.interestRate != null ? `${p.interestRate}%` : '—'),
  getPriceLabel: () => 'p.a.',
  getOriginalPrice: () => null,
  getSavingsText: (p) => (p?.probability >= 80 ? 'High approval chance' : null),
  getCtaUrl: (p) => p?.applyUrl,
  getCtaLabel: () => 'Apply Now',
};

const POST_OFFICE_CONFIG = {
  type: 'post_office',
  label: 'Post Office',
  maxCompare: 3,
  tableRows: PO_ROWS,
  formatCell: formatPoCell,
  getId: (p) => p.id,
  getName: (p) => p.name,
  getProvider: (p) => p.providerName || 'India Post',
  getLogo: (p) => resolveBankLogoUrl(p?.logoUrl),
  getBadge: (p) => (p?.taxBenefitsText ? 'Tax benefits' : p?.calculatorEnabled !== false ? 'Calculator' : null),
  getSubtitle: (p) => p?.returnsSummary || p?.highlights || null,
  getHighlightMetrics: (p) => [
    { label: 'Rate', value: formatInterestRate(p?.interestRate) },
    { label: 'Returns', value: p?.returnsSummary || '—' },
    { label: 'Tax', value: p?.taxBenefitsText ? 'Available' : '—' },
  ],
  getFeatures: (p) => (p?.features || []).slice(0, 5),
  getPrice: (p) => formatInterestRate(p?.interestRate),
  getPriceLabel: () => 'p.a.',
  getOriginalPrice: () => null,
  getSavingsText: (p) => (p?.taxBenefitsText ? 'Tax saving scheme' : null),
  getCtaUrl: () => null,
  getCtaLabel: (p) => (p?.applyUrl ? 'Apply Now' : (p?.calculatorEnabled !== false ? 'Calculator' : 'View Scheme')),
};

const GOVERNMENT_SCHEME_CONFIG = {
  type: 'government_scheme',
  label: 'Government Scheme',
  maxCompare: 3,
  tableRows: GS_ROWS,
  formatCell: formatGsCell,
  getId: (p) => p.id,
  getName: (p) => p.name,
  getProvider: (p) => p.ministryName,
  getLogo: (p) => resolveBankLogoUrl(p?.logoUrl),
  getBadge: (p) => (p?.subsidyPercent ? `${p.subsidyPercent}% subsidy` : p?.loanAmountMax ? 'Loan available' : null),
  getSubtitle: (p) => p?.highlights || p?.benefitsText || null,
  getHighlightMetrics: (p) => [
    { label: 'Loan / subsidy', value: formatLoanAmount(p) },
    { label: 'Interest', value: formatInterestRate(p?.interestRate) },
    { label: 'Subsidy', value: p?.subsidyPercent != null ? `${p.subsidyPercent}%` : '—' },
  ],
  getFeatures: (p) => (p?.features || []).slice(0, 5),
  getPrice: (p) => (p?.subsidyPercent != null ? `${p.subsidyPercent}%` : formatInterestRate(p?.interestRate)),
  getPriceLabel: (p) => (p?.subsidyPercent != null ? 'subsidy' : 'p.a.'),
  getOriginalPrice: () => null,
  getSavingsText: (p) => (p?.benefitsText ? 'Benefits available' : null),
  getCtaUrl: (p) => p?.applicationUrl,
  getCtaLabel: () => 'Apply Now',
};

const INVESTMENT_CONFIG = {
  type: 'investment',
  label: 'Investment',
  maxCompare: 3,
  tableRows: INV_ROWS,
  formatCell: formatInvCell,
  getId: (p) => p.id,
  getName: (p) => p.name,
  getProvider: (p) => p.providerName,
  getLogo: (p) => resolveBankLogoUrl(p?.logoUrl),
  getBadge: (p) => (p?.riskLevel === 'low' ? 'Low risk' : p?.returns3y >= 10 ? 'High returns' : null),
  getSubtitle: (p) => p?.maturityTenureText || p?.highlights || null,
  getHighlightMetrics: (p) => [
    { label: '3Y Returns', value: formatInvPercent(p?.returns3y) },
    { label: 'Risk', value: p?.riskLevel ? getInvestmentRiskLabel(p.riskLevel) : '—' },
    { label: 'Min invest', value: formatInvCurrency(p?.minInvestmentAmount) },
  ],
  getFeatures: (p) => (p?.features || []).slice(0, 5),
  getPrice: (p) => formatInvPercent(p?.returns1y ?? p?.returns3y),
  getPriceLabel: () => 'returns',
  getOriginalPrice: () => null,
  getSavingsText: (p) => (p?.taxBenefitsText ? 'Tax benefits' : null),
  getCtaUrl: (p) => p?.applyUrl,
  getCtaLabel: () => 'Invest Now',
};

const FIXED_INCOME_CONFIG = {
  type: 'fixed_income',
  label: 'Fixed Income',
  maxCompare: 3,
  tableRows: FI_ROWS,
  formatCell: formatFiCell,
  getId: (p) => p.id,
  getName: (p) => p.name,
  getProvider: (p) => p.providerName,
  getLogo: (p) => resolveBankLogoUrl(p?.logoUrl),
  getBadge: (p) => (p?.interestRateMax != null || p?.interestRateMin != null ? 'Rate Range' : p?.interestRate != null ? 'Best Rate' : null),
  getSubtitle: (p) => p?.highlights || p?.description || null,
  getHighlightMetrics: (p) => [
    { label: 'Rate', value: formatInterestRate(p?.interestRate ?? p?.interestRateMax ?? p?.interestRateMin) },
    { label: 'Lock-in', value: formatMonths(p?.lockInMonths) },
    { label: 'Premature', value: formatBool(p?.prematureWithdrawal) },
  ],
  getFeatures: (p) => (p?.features || []).slice(0, 5),
  getPrice: (p) => formatInterestRate(p?.interestRate ?? p?.interestRateMax ?? p?.interestRateMin),
  getPriceLabel: () => 'p.a.',
  getOriginalPrice: () => null,
  getSavingsText: (p) => (p?.taxBenefit ? '80C tax benefit' : null),
  getCtaUrl: (p) => p?.applyUrl,
  getCtaLabel: () => 'Apply Now',
};

export function getMarketplaceCompareConfig(type) {
  switch (type) {
    case 'insurance': return INSURANCE_CONFIG;
    case 'mutual_fund': return MUTUAL_FUND_CONFIG;
    case 'credit_card': return CREDIT_CARD_CONFIG;
    case 'loan': return LOAN_CONFIG;
    case 'fixed_income': return FIXED_INCOME_CONFIG;
    case 'post_office': return POST_OFFICE_CONFIG;
    case 'government_scheme': return GOVERNMENT_SCHEME_CONFIG;
    case 'investment': return INVESTMENT_CONFIG;
    default: return INSURANCE_CONFIG;
  }
}
