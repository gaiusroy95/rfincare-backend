import { leadService } from '../services/leadService';

export function buildGovernmentSchemeEligibilityData(scheme, profile = {}) {
  return {
    marketplaceType: 'government_scheme',
    productId: scheme?.id,
    productName: scheme?.name,
    ministryName: scheme?.ministryName,
    applyUrl: scheme?.applyUrl,
    categories: scheme?.categories,
    interestRate: scheme?.interestRate,
    highlights: scheme?.highlights,
    ...profile,
  };
}

export async function recordGovernmentSchemeApplicationLead(scheme, profile) {
  if (!scheme?.id) return null;

  const eligibilityData = buildGovernmentSchemeEligibilityData(scheme, profile);

  if (profile?.leadId) {
    await leadService.updateLead(profile.leadId, {
      loanType: 'government_scheme',
      eligibilityData,
      status: 'application_started',
    });
    return profile.leadId;
  }

  const res = await leadService.createLead({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    loanType: 'government_scheme',
    source: 'government_schemes_marketplace',
    consentAccepted: true,
    eligibilityData,
    status: 'application_started',
  });
  return res?.id || res?.lead?.id || null;
}

export function redirectToGovernmentSchemeApplication(applyUrl) {
  if (!applyUrl) return false;
  window.open(applyUrl, '_blank', 'noopener,noreferrer');
  return true;
}

export async function completeGovernmentSchemeApply(scheme, profile) {
  try {
    await recordGovernmentSchemeApplicationLead(scheme, profile);
  } catch {
    /* best-effort */
  }

  if (scheme?.applyUrl) {
    return redirectToGovernmentSchemeApplication(scheme.applyUrl);
  }
  return true;
}
