import { ELIGIBILITY_SESSION_KEY } from '../services/leadService';

/** True when the customer completed the standalone eligibility check in this browser session. */
export function hasCompletedEligibilityCheck() {
  try {
    const raw = sessionStorage.getItem(ELIGIBILITY_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const hasResult =
      parsed?.score != null ||
      parsed?.overallProbability != null ||
      parsed?.status != null ||
      parsed?.result != null;
    return Boolean(hasResult && parsed?.formData);
  } catch {
    return false;
  }
}

/**
 * Navigate to the 8-step application only after eligibility; otherwise send to eligibility first.
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {{ loanType?: string, slug?: string, state?: object, bypass?: boolean }} params
 */
export function openAssessmentOrEligibilityFirst(navigate, params = {}) {
  const { loanType, slug, state, bypass } = params;
  const loanSlug = slug || loanType || '';
  const qs = loanSlug ? `?loanType=${encodeURIComponent(loanSlug)}` : '';

  if (bypass) {
    navigate(`/customer-assessment-portal${qs}`, { state });
    return;
  }

  if (hasCompletedEligibilityCheck()) {
    navigate(`/customer-assessment-portal${qs}`, { state });
    return;
  }

  navigate(`/eligibility-assessment${qs}`, {
    state: { ...state, fromApply: true },
  });
}

/** Product-level direct apply URL from bank, falling back to bank-wide apply URL. */
export function resolveMarketplaceApplyUrl(bank, productData = null) {
  const data = productData || {};
  return (
    data.apply_url ||
    data.applyUrl ||
    bank?.applyUrl ||
    bank?.apply_url ||
    null
  );
}

export function openExternalApplyUrl(url) {
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/** Apply on marketplace/product card: external bank link if configured, else eligibility → application. */
export function openMarketplaceApply(navigate, { bank, productData, loanType, slug, state } = {}) {
  const applyUrl = resolveMarketplaceApplyUrl(bank, productData);
  if (openExternalApplyUrl(applyUrl)) return;

  openAssessmentOrEligibilityFirst(navigate, {
    loanType,
    slug,
    state: {
      ...state,
      selectedBank: bank || state?.selectedBank,
    },
  });
}
