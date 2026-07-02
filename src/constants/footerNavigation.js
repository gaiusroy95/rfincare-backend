import { COMPARE_SHOWCASE_PRODUCT } from './marketplaceShowcaseProducts';
import { filterMarketplaceShowcase } from '../utils/showcaseProducts';
/** Marketplace product links for the footer PRODUCTS column */
export function buildFooterMarketplaceProducts(visibility = {}) {
  return filterMarketplaceShowcase(visibility).map((item) => ({
    label: item.label,
    path: item.route,
  }));
}

/** Map loan catalog slugs to preferred marketplace routes */
const LOAN_PRODUCT_ROUTE_OVERRIDES = {
  credit_card: '/credit-cards',
};

export function buildFooterLoanProducts(loanProducts = [], visibility = {}) {
  return (Array.isArray(loanProducts) ? loanProducts : [])
    .filter((p) => p?.slug)
    .filter((p) => {
      if (p.slug === 'credit_card' && visibility.creditCardMarketplace === false) return false;
      return true;
    })
    .map((p) => ({
      label: p.label,
      path: LOAN_PRODUCT_ROUTE_OVERRIDES[p.slug] || `/products/${p.slug}`,
    }));
}

/** Calculator & tool links for the footer RESOURCES column */
export const FOOTER_CALCULATOR_LINKS = [
  { label: 'All Financial Calculators', path: '/resources/calculators' },
  { label: 'Loan EMI Calculator', path: '/resources/loan-emi-calculator' },
  { label: 'Loan Eligibility Calculator', path: '/eligibility-assessment' },
  { label: 'SIP Calculator', path: '/resources/calculators/sip' },
  { label: 'Income Tax Calculator', path: '/resources/calculators/income-tax' },
  { label: 'Retirement Corpus Planner', path: '/resources/calculators/retirement-corpus' },
  { label: 'Post Office Calculator', path: '/post-office-marketplace?calculator=1' },
  { label: 'Mutual Fund Calculator', path: '/mutual-fund-marketplace?calculator=1' },
  { label: 'Investment Calculator', path: '/investment-marketplace?calculator=1' },
];

export const FOOTER_PLANNING_HUB_LINKS = [
  { label: 'Retirement Planning', path: '/retirement-planning' },
  { label: 'Tax Saving Products', path: '/tax-saving' },
  { label: 'Wealth Management', path: '/wealth-management' },
];

export const FOOTER_RESOURCE_LINKS = [
  { labelKey: 'footer.helpCenter', path: '/legal/help-center', defaultLabel: 'Help Center' },
  { labelKey: 'footer.financialGuides', path: '/legal/financial-guides', defaultLabel: 'Financial Guides' },
  { label: 'Compare Products', path: COMPARE_SHOWCASE_PRODUCT.route },
  { label: 'Share Your Story', path: '/share-your-story' },
];

export function buildFooterCompanyLinks(t, visibility = {}) {
  const vis = { ...visibility };
  const marketplaceEntries = [
    { label: 'Credit Cards', path: '/credit-cards', key: 'creditCardMarketplace' },
    { label: 'Insurance Marketplace', path: '/insurance-marketplace', key: 'insuranceMarketplace' },
    { label: 'Mutual Fund Marketplace', path: '/mutual-fund-marketplace', key: 'mutualFundMarketplace' },
    { label: 'Fixed Income Marketplace', path: '/fixed-income-marketplace', key: 'fixedIncomeMarketplace' },
    { label: 'Post Office Marketplace', path: '/post-office-marketplace', key: 'postOfficeMarketplace' },
    { label: 'Government Schemes', path: '/government-schemes-marketplace', key: 'governmentSchemesMarketplace' },
    { label: 'Investment Marketplace', path: '/investment-marketplace', key: 'investmentMarketplace' },
  ].filter((item) => vis[item.key] !== false);

  return [
    { label: t('footer.aboutUs'), path: '/about-us' },
    { label: t('footer.howItWorks'), path: '/homepage#how-it-works' },
    { label: t('footer.bankPartners'), path: '/bank-marketplace' },
    ...marketplaceEntries,
    { label: t('footer.careers'), path: '/legal/careers' },
  ];
}

export function buildFooterProductLinks(loanProducts, visibility = {}) {
  const loans = buildFooterLoanProducts(loanProducts, visibility);
  const marketplaces = buildFooterMarketplaceProducts(visibility);
  const seen = new Set();
  const merged = [];

  for (const link of [...loans, ...marketplaces]) {
    const key = link.path;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(link);
  }

  return merged;
}
