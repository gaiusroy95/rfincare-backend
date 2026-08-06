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
    { label: 'Tax Saving', path: '/tax-saving', icon: 'Receipt' },
  ];

  const aboutUsChildren = [
    { label: 'About Us', path: '/about-us', icon: 'Info' },
    { label: 'About Team', path: '/about-team', icon: 'Users' },
  ];

  return [
    v.bankMarketplace !== false
      ? { id: 'bank-marketplace', label: t('header.bankMarketplace', 'Bank Marketplace'), path: '/bank-marketplace' }
      : null,
    v.creditCardMarketplace !== false
      ? { id: 'credit-cards', label: t('header.creditCards', 'Credit cards'), path: '/credit-cards' }
      : null,
    investmentsChildren.length ? { id: 'investments', label: 'Investments', children: investmentsChildren } : null,
    insuranceChildren.length ? { id: 'insurance', label: 'Insurance', children: insuranceChildren } : null,
    govtChildren.length ? { id: 'government', label: 'Govt.Schemes', children: govtChildren } : null,
    { id: 'about-us', label: t('header.aboutUs', 'About Us'), children: aboutUsChildren },
    { id: 'resources', label: 'Resources', children: resourcesChildren },
    { id: 'contact-us', label: t('header.contactUs', 'Contact'), path: '/contact-us' },
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
