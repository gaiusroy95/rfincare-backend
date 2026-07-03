/**
 * Main site navigation — matches new RFINCARE header IA.
 * Items are filtered at runtime by marketplace visibility.
 */

export const TRUST_BAR_ITEMS = [
  { icon: 'Shield', label: '100% Secure' },
  { icon: 'BadgeCheck', label: 'RBI Registered Partners' },
  { icon: 'ShieldCheck', label: 'Best Prices Guaranteed' },
  { icon: 'Headphones', label: '24x7 Expert Support' },
];

export function buildMainNavGroups({ marketplaceVisibility = {}, t = (k) => k } = {}) {
  const v = marketplaceVisibility;

  const productsChildren = [
    { label: t('header.productComparison', 'Compare Products'), path: '/product-comparison', icon: 'GitCompare' },
    v.creditCardMarketplace !== false
      ? { label: t('header.creditCardMarketplace', 'Credit Cards'), path: '/credit-cards', icon: 'CreditCard' }
      : null,
    v.bankMarketplace !== false
      ? { label: t('header.bankMarketplace', 'Bank Marketplace'), path: '/bank-marketplace', icon: 'Building2' }
      : null,
  ].filter(Boolean);

  const loansChildren = [
    { label: 'Check Eligibility', path: '/eligibility-assessment', icon: 'CheckCircle' },
    { label: t('header.applyForLoan', 'Apply for Loan'), path: '/customer-assessment-portal', icon: 'FileText' },
    v.bankMarketplace !== false
      ? { label: 'Bank Loans', path: '/bank-marketplace', icon: 'Building2' }
      : null,
  ].filter(Boolean);

  const investmentsChildren = [
    v.mutualFundMarketplace !== false
      ? { label: t('header.mutualFundMarketplace', 'Mutual Funds'), path: '/mutual-fund-marketplace', icon: 'TrendingUp' }
      : null,
    v.investmentMarketplace !== false
      ? { label: t('header.investmentMarketplace', 'Investment Products'), path: '/investment-marketplace', icon: 'Gem' }
      : null,
    v.fixedIncomeMarketplace !== false
      ? { label: t('header.fixedIncomeMarketplace', 'Fixed Income'), path: '/fixed-income-marketplace', icon: 'Landmark' }
      : null,
    v.postOfficeMarketplace !== false
      ? { label: t('header.postOfficeMarketplace', 'Post Office Schemes'), path: '/post-office-marketplace', icon: 'Mailbox' }
      : null,
    { label: 'Retirement Planning', path: '/retirement-planning', icon: 'Sunset' },
    { label: 'Wealth Management', path: '/wealth-management', icon: 'PieChart' },
  ].filter(Boolean);

  const insuranceChildren = v.insuranceMarketplace !== false
    ? [{ label: t('header.insuranceMarketplace', 'Insurance Marketplace'), path: '/insurance-marketplace', icon: 'Shield' }]
    : [];

  const govtChildren = v.governmentSchemesMarketplace !== false
    ? [{ label: t('header.governmentSchemesMarketplace', 'Government Schemes'), path: '/government-schemes-marketplace', icon: 'Landmark' }]
    : [];

  const resourcesChildren = [
    { label: 'Financial Calculators', path: '/resources/calculators', icon: 'Calculator' },
    { label: 'About Us', path: '/about-us', icon: 'Info' },
    { label: 'Contact Us', path: '/contact-us', icon: 'Phone' },
    { label: 'Share Your Story', path: '/share-your-story', icon: 'MessageSquare' },
    { label: 'Tax Saving', path: '/tax-saving', icon: 'Receipt' },
  ];

  return [
    productsChildren.length ? { id: 'products', label: 'Products', children: productsChildren } : null,
    loansChildren.length ? { id: 'loans', label: 'Loans', children: loansChildren } : null,
    investmentsChildren.length ? { id: 'investments', label: 'Investments', children: investmentsChildren } : null,
    insuranceChildren.length ? { id: 'insurance', label: 'Insurance', children: insuranceChildren } : null,
    govtChildren.length ? { id: 'government', label: 'Government Schemes', children: govtChildren } : null,
    { id: 'resources', label: 'Resources', children: resourcesChildren },
    { id: 'calculators', label: 'Calculators', path: '/resources/calculators' },
  ].filter(Boolean);
}

export const QUICK_SEARCH_LINKS = [
  { label: 'Compare Products', path: '/product-comparison', icon: 'GitCompare' },
  { label: 'Check Eligibility', path: '/eligibility-assessment', icon: 'CheckCircle' },
  { label: 'Insurance', path: '/insurance-marketplace', icon: 'Shield' },
  { label: 'Mutual Funds', path: '/mutual-fund-marketplace', icon: 'TrendingUp' },
  { label: 'Calculators', path: '/resources/calculators', icon: 'Calculator' },
  { label: 'Contact Us', path: '/contact-us', icon: 'Phone' },
];
