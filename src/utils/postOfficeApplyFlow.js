import { leadService } from '../services/leadService';

export function buildPostOfficeEligibilityData(product, profile = {}) {
  return {
    marketplaceType: 'post_office',
    productId: product?.id,
    productName: product?.name,
    providerName: product?.providerName || 'India Post',
    applyUrl: product?.applyUrl,
    categories: product?.categories,
    interestRate: product?.interestRate,
    calculatorType: product?.calculatorType,
    taxBenefitsText: product?.taxBenefitsText,
    returnsSummary: product?.returnsSummary,
    ...profile,
  };
}

export async function recordPostOfficeApplicationLead(product, profile) {
  if (!product?.id) return null;

  const eligibilityData = buildPostOfficeEligibilityData(product, profile);

  if (profile?.leadId) {
    await leadService.updateLead(profile.leadId, {
      loanType: 'post_office',
      eligibilityData,
      status: 'application_started',
    });
    return profile.leadId;
  }

  const res = await leadService.createLead({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    loanType: 'post_office',
    source: 'post_office_marketplace',
    consentAccepted: true,
    eligibilityData,
    status: 'application_started',
  });
  return res?.id || res?.lead?.id || null;
}

export function redirectToPostOfficeApplication(applyUrl) {
  if (!applyUrl) return false;
  window.open(applyUrl, '_blank', 'noopener,noreferrer');
  return true;
}

export async function completePostOfficeApply(product, profile) {
  if (!product?.applyUrl) return false;

  try {
    await recordPostOfficeApplicationLead(product, profile);
  } catch {
    // Continue to purchase page even if lead recording fails.
  }

  return redirectToPostOfficeApplication(product.applyUrl);
}
