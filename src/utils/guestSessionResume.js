const CALC_PREFIX = 'rfincare_calc_';
const COMPARE_PREFIX = 'rfincare_compare_';
const SESSION_INDEX_KEY = 'rfincare_guest_sessions';

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function updateSessionIndex(entry) {
  const list = safeParse(localStorage.getItem(SESSION_INDEX_KEY)) || [];
  const filtered = list.filter((item) => item.key !== entry.key);
  filtered.unshift({ ...entry, savedAt: Date.now() });
  localStorage.setItem(SESSION_INDEX_KEY, JSON.stringify(filtered.slice(0, 12)));
}

export function saveCalculatorSession(slug, { form = {}, result = null, title = '' } = {}) {
  if (!slug) return;
  const key = `${CALC_PREFIX}${slug}`;
  const payload = { slug, form, result, title, savedAt: Date.now() };
  localStorage.setItem(key, JSON.stringify(payload));
  updateSessionIndex({
    key,
    type: 'calculator',
    slug,
    title: title || slug,
    path: `/resources/calculators/${slug}`,
  });
}

export function loadCalculatorSession(slug) {
  if (!slug) return null;
  return safeParse(localStorage.getItem(`${CALC_PREFIX}${slug}`));
}

const MARKETPLACE_RESUME_PATHS = {
  insurance: '/insurance-marketplace',
  mutual_funds: '/mutual-fund-marketplace',
  post_office: '/post-office-marketplace',
  government_scheme: '/government-schemes-marketplace',
  investment: '/investment-marketplace',
};

export function marketplaceResumePath(marketplaceType) {
  return MARKETPLACE_RESUME_PATHS[marketplaceType] || '/product-comparison';
}

export function saveCompareBasket(marketplaceType, { selectedIds = [], productLabels = [] } = {}) {
  if (!marketplaceType) return;
  const key = `${COMPARE_PREFIX}${marketplaceType}`;
  const payload = {
    marketplaceType,
    selectedIds,
    productLabels,
    savedAt: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(payload));
  updateSessionIndex({
    key,
    type: 'compare',
    slug: marketplaceType,
    title: `${productLabels.length || selectedIds.length} products compared`,
    path: marketplaceResumePath(marketplaceType),
  });
}

export function loadCompareBasket(marketplaceType) {
  if (!marketplaceType) return null;
  return safeParse(localStorage.getItem(`${COMPARE_PREFIX}${marketplaceType}`));
}

export function saveProductComparisonSelection(selectedSlugs = []) {
  localStorage.setItem(`${COMPARE_PREFIX}product_comparison`, JSON.stringify({
    selectedSlugs,
    savedAt: Date.now(),
  }));
  if (selectedSlugs.length) {
    updateSessionIndex({
      key: `${COMPARE_PREFIX}product_comparison`,
      type: 'product_comparison',
      slug: 'comparison',
      title: `${selectedSlugs.length} products selected`,
      path: '/product-comparison',
    });
  }
}

export function loadProductComparisonSelection() {
  const data = safeParse(localStorage.getItem(`${COMPARE_PREFIX}product_comparison`));
  return data?.selectedSlugs || [];
}

export function listGuestResumeSessions() {
  return safeParse(localStorage.getItem(SESSION_INDEX_KEY)) || [];
}

/** Filter resume sessions relevant to a marketplace page (compare basket + calculators). */
export function listMarketplaceResumeSessions(marketplaceType, { includeCalculators = true } = {}) {
  const compareKey = `${COMPARE_PREFIX}${marketplaceType}`;
  const sessions = listGuestResumeSessions();
  return sessions.filter((session) => {
    if (session.key === compareKey) return true;
    if (!includeCalculators) return false;
    if (session.type !== 'calculator') return false;
    if (marketplaceType === 'mutual_funds') {
      return session.slug === 'sip' || session.slug === 'goal-sip';
    }
    if (marketplaceType === 'insurance') {
      return session.slug === 'term-insurance' || session.slug === 'health-insurance';
    }
    return false;
  });
}

export function clearGuestSession(key) {
  localStorage.removeItem(key);
  const list = listGuestResumeSessions().filter((item) => item.key !== key);
  localStorage.setItem(SESSION_INDEX_KEY, JSON.stringify(list));
}

export function formatResumeAge(savedAt) {
  if (!savedAt) return '';
  const mins = Math.floor((Date.now() - savedAt) / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
