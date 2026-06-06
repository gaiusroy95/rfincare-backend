import { getLoanPriorities, serializeLoanPriorities } from './loanPriorities';
import { normalizeLoanApiKey } from '../constants/loanProducts';

/** Scalar fields copied from eligibility / quick-check (never nested API payloads). */
export function pickEligibilityPrefill(source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return {};
  return {
    loanAmount: source.loanAmount ?? source.requestedAmount,
    monthlyIncome: source.monthlyIncome,
    creditScoreRange: source.creditScoreRange ?? source.creditScore,
    loanType: source.loanType,
    employmentType: source.employmentType,
    existingLoans: source.existingLoans,
    monthlyDebtPayments: source.monthlyDebtPayments ?? source.existingLoans,
  };
}

export function resolveLeadMetaFromLocation(locationState) {
  if (!locationState || typeof locationState !== 'object') return null;
  if (locationState.leadMeta && typeof locationState.leadMeta === 'object') {
    return locationState.leadMeta;
  }
  const { fullName, email, phone } = locationState;
  if (fullName || email || phone) {
    return { fullName, email, phone };
  }
  try {
    const stored = sessionStorage.getItem('rfincare_registration_prefill');
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  return null;
}

export function applyLeadMetaPrefill(base, leadMeta) {
  if (!leadMeta || typeof leadMeta !== 'object') return base;
  const next = { ...base };
  const name = String(leadMeta.fullName || '').trim();
  if (name && !next.firstName && !next.lastName) {
    const parts = name.split(/\s+/).filter(Boolean);
    next.firstName = parts[0] || '';
    next.lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  }
  if (leadMeta.email && !next.email) next.email = String(leadMeta.email).trim();
  if (leadMeta.phone && !next.phone) {
    next.phone = String(leadMeta.phone).replace(/\D/g, '').slice(-10);
  }
  return next;
}

const coerceYesNo = (value) => {
  if (value === 'yes' || value === 'no') return value;
  if (value === true || value === 'true' || value === 1 || value === '1') return 'yes';
  if (value === false || value === 'false' || value === 0 || value === '0') return 'no';
  return typeof value === 'string' ? value : '';
};

/**
 * Strip nested eligibility/API fields (banks, scores) before merging into assessment form state.
 */
export function stripUnsafeFormFields(raw, allowedKeys) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  for (const key of allowedKeys) {
    if (key === 'coApplicant' || key === 'loanPriorities') continue;
    const v = raw[key];
    if (v === undefined || v === null) continue;
    if (typeof v === 'object') continue;
    if (Array.isArray(v)) continue;
    out[key] = v;
  }
  if (Array.isArray(raw.loanPriorities)) {
    out.loanPriorities = raw.loanPriorities;
  }
  return out;
}

export function buildAssessmentEntryState({
  initialFormData,
  financialHistoryInitial,
  financialHistoryQuestions,
  locationState,
  searchParams,
  sessionFormData,
}) {
  const loanTypeParam = searchParams?.get?.('loanType');
  const quick =
    locationState?.quickCheck ||
    pickEligibilityPrefill(locationState?.eligibilityData) ||
    pickEligibilityPrefill(sessionFormData);
  const selectedBank = locationState?.selectedBank;

  let merged = { ...initialFormData, ...financialHistoryInitial };

  if (quick && Object.keys(quick).length) {
    merged = {
      ...merged,
      loanAmount: quick.loanAmount != null ? String(quick.loanAmount) : merged.loanAmount,
      monthlyIncome: quick.monthlyIncome != null ? String(quick.monthlyIncome) : merged.monthlyIncome,
      creditScoreRange: quick.creditScoreRange || merged.creditScoreRange,
      loanPurpose:
        normalizeLoanApiKey(quick.loanType || loanTypeParam) || merged.loanPurpose,
      employmentType: quick.employmentType || merged.employmentType,
      monthlyDebtPayments:
        quick.monthlyDebtPayments != null
          ? String(quick.monthlyDebtPayments)
          : merged.monthlyDebtPayments,
    };
  } else if (loanTypeParam) {
    merged.loanPurpose = normalizeLoanApiKey(loanTypeParam) || merged.loanPurpose;
  }

  if (selectedBank?.id) {
    merged.preferredBankId = String(selectedBank.id);
    merged.preferredBankName = selectedBank.name || merged.preferredBankName;
  }

  merged = applyLeadMetaPrefill(merged, resolveLeadMetaFromLocation(locationState));

  financialHistoryQuestions.forEach((q) => {
    const direct = coerceYesNo(merged[q.field]);
    if (direct) {
      merged[q.field] = direct;
      return;
    }
    if (q.legacyBooleanKey && merged[q.legacyBooleanKey] != null) {
      merged[q.field] = coerceYesNo(merged[q.legacyBooleanKey]);
    }
  });

  merged.hasRunningLoanOrCard = coerceYesNo(merged.hasRunningLoanOrCard);
  merged.hasAnyOverdue = coerceYesNo(merged.hasAnyOverdue);
  if (!merged.hasRunningLoanOrCard && merged.hasBankruptcy != null) {
    merged.hasRunningLoanOrCard = coerceYesNo(merged.hasBankruptcy);
  }

  const priorities = getLoanPriorities(merged);
  merged.loanPriorities = priorities;
  merged.loanPriority = serializeLoanPriorities(priorities);

  return merged;
}
