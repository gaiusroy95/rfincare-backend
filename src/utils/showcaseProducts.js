import {
  MARKETPLACE_SHOWCASE_PRODUCTS,
  COMPARE_SHOWCASE_PRODUCT,
} from '../constants/marketplaceShowcaseProducts';

const DEFAULT_VISIBILITY = {
  bankMarketplace: true,
  creditCardMarketplace: true,
  insuranceMarketplace: true,
  mutualFundMarketplace: true,
};

export function filterMarketplaceShowcase(visibility = DEFAULT_VISIBILITY) {
  const vis = { ...DEFAULT_VISIBILITY, ...visibility };
  return MARKETPLACE_SHOWCASE_PRODUCTS.filter((item) => {
    if (!item.visibilityKey) return true;
    return vis[item.visibilityKey] !== false;
  });
}

/** Loan catalog + insurance/MF marketplace cards + optional compare card for homepage grids */
export function buildHomepageShowcaseProducts(loanProducts, visibility, { includeCompareCard = true } = {}) {
  const loans = Array.isArray(loanProducts) ? loanProducts : [];
  const marketplaces = filterMarketplaceShowcase(visibility);
  const extras = includeCompareCard ? [COMPARE_SHOWCASE_PRODUCT] : [];
  return [...loans, ...marketplaces, ...extras];
}

/** Chips for product landing / comparison filter rows */
export function buildProductCatalogChips(loanProducts, visibility) {
  const loans = Array.isArray(loanProducts) ? loanProducts : [];
  const marketplaces = filterMarketplaceShowcase(visibility);
  return [
    ...loans.map((p) => ({ ...p, chipKind: 'loan', route: `/products/${p.slug}` })),
    ...marketplaces.map((p) => ({ ...p, chipKind: 'marketplace', route: p.route })),
    { ...COMPARE_SHOWCASE_PRODUCT, chipKind: 'compare', route: COMPARE_SHOWCASE_PRODUCT.route },
  ];
}

export function getShowcaseViewRoute(item) {
  if (!item) return '/homepage';
  if (item.route) return item.route;
  if (item.kind === 'compare') return '/product-comparison';
  if (item.slug === 'credit_card' || item.apiKey === 'credit_card') return '/credit-cards';
  if (item.slug) return `/products/${item.slug}`;
  return '/homepage';
}

export function getShowcasePrimaryCtaLabel(item) {
  if (item?.kind === 'compare') return 'Start comparing';
  if (item?.kind === 'marketplace') return 'Explore marketplace';
  if (item?.slug === 'credit_card') return 'View cards';
  return 'Apply now';
}
