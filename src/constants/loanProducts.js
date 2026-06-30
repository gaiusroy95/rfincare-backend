/**
 * Loan product catalog — static defaults + runtime registry from API.
 * slug: URL segment (/products/personal)
 * apiKey: backend / form values (personal_loan)
 */
export const LOAN_PRODUCTS = [
  {
    slug: 'personal',
    apiKey: 'personal_loan',
    label: 'Personal Loan',
    shortLabel: 'Personal',
    icon: 'Wallet',
    description:
      'Flexible financing for weddings, education, medical expenses, or debt consolidation.',
    interestRange: '8.5% - 15.9%',
    features: ['Up to ₹40 Lakhs', 'Terms 1-5 years', 'Quick approval', 'No collateral required'],
    color: 'var(--color-primary)',
  },
  {
    slug: 'home',
    apiKey: 'home_loan',
    label: 'Home Loan',
    shortLabel: 'Home',
    icon: 'Home',
    description: 'Competitive rates for purchase, construction, or balance transfer.',
    interestRange: '6.2% - 9.5%',
    features: ['Up to ₹5 Crore', 'Terms up to 30 years', 'Tax benefits', 'Balance transfer'],
    color: 'var(--color-secondary)',
  },
  {
    slug: 'business',
    apiKey: 'business_loan',
    label: 'Business Loan',
    shortLabel: 'Business',
    icon: 'Briefcase',
    description: 'Working capital, equipment finance, and expansion funding for your business.',
    interestRange: '9.0% - 18.0%',
    features: ['Up to ₹50 Crore', 'Flexible repayment', 'Working capital', 'Equipment finance'],
    color: 'var(--color-accent)',
  },
  {
    slug: 'auto',
    apiKey: 'auto_loan',
    label: 'Auto Loan',
    shortLabel: 'Auto',
    icon: 'Car',
    description: 'Finance for new and used vehicles with competitive rates.',
    interestRange: '5.5% - 12.0%',
    features: ['Up to ₹1 Crore', 'Terms 2-7 years', 'New & used cars', 'Refinancing'],
    color: 'var(--color-conversion)',
  },
  {
    slug: 'education',
    apiKey: 'education_loan',
    label: 'Education Loan',
    shortLabel: 'Education',
    icon: 'GraduationCap',
    description: 'Fund higher education in India or abroad with moratorium options.',
    interestRange: '7.5% - 15.0%',
    features: ['Moratorium period', 'Tax benefits', 'Tuition & living costs', 'Study abroad'],
    color: '#0ea5e9',
  },
  {
    slug: 'credit_card',
    apiKey: 'credit_card',
    label: 'Credit Card',
    shortLabel: 'Credit Card',
    icon: 'CreditCard',
    description: 'Compare rewards, fees, and benefits from partner banks.',
    interestRange: 'Varies by card',
    features: ['Rewards & cashback', 'Lounge access', 'Zero annual fee options', 'Instant apply links'],
    color: '#7c3aed',
  },
];

/**
 * Credit Card is managed by the credit cards module (not the loan product catalog API),
 * so it must always remain in the catalog even when the API overrides the registry.
 */
export const CREDIT_CARD_PRODUCT = LOAN_PRODUCTS.find((p) => p.slug === 'credit_card');

/** Ensure the synthetic Credit Card product is present in any product list. */
export function ensureCreditCardProduct(products) {
  const list = Array.isArray(products) ? [...products] : [];
  const hasCreditCard = list.some(
    (p) => p?.slug === 'credit_card' || p?.apiKey === 'credit_card',
  );
  if (!hasCreditCard && CREDIT_CARD_PRODUCT) {
    list.push(CREDIT_CARD_PRODUCT);
  }
  return list;
}

let registry = [...LOAN_PRODUCTS];
let slugToProduct = buildMaps(registry).slugMap;
let apiKeyToProduct = buildMaps(registry).apiMap;

function buildMaps(products) {
  return {
    slugMap: new Map(products.map((p) => [p.slug, p])),
    apiMap: new Map(products.map((p) => [p.apiKey, p])),
  };
}

/** Called by LoanProductsProvider after API load */
export function setLoanProductRegistry(products) {
  if (!Array.isArray(products) || products.length === 0) {
    registry = [...LOAN_PRODUCTS];
  } else {
    registry = ensureCreditCardProduct(products);
  }
  const maps = buildMaps(registry);
  slugToProduct = maps.slugMap;
  apiKeyToProduct = maps.apiMap;
}

export function getLoanProducts() {
  return registry;
}

export function getLoanProductBySlug(slug) {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase().replace(/-/g, '_');
  return (
    slugToProduct.get(normalized)
    || apiKeyToProduct.get(normalized)
    || apiKeyToProduct.get(`${normalized}_loan`)
    || slugToProduct.get(normalized.replace(/_loan$/, ''))
    || null
  );
}

export function normalizeLoanApiKey(input) {
  const product = getLoanProductBySlug(input);
  if (product) return product.apiKey;
  const s = String(input || '').toLowerCase();
  if (s.endsWith('_loan')) return s;
  const fromRegistry = registry.find((p) => p.slug === s);
  if (fromRegistry) return fromRegistry.apiKey;
  return s || null;
}

export function productMatchesLoanType(productData, apiKey) {
  if (!apiKey) return true;
  const d = productData || {};
  const candidate =
    d.loanType || d.loan_type || d.type || d.productType || d.product_type || '';
  const normalized = String(candidate).toLowerCase();
  if (!normalized) return true;
  return normalized === apiKey || normalized === apiKey.replace('_loan', '');
}
