import {
  buildExistingLoanStatementDocuments,
  isExistingLoanStatementDocType,
} from '../utils/existingLoans';

export const APPLICANT_DOCUMENTS = [
  {
    type: 'customer_photo',
    label: 'Customer photo',
    description: 'Recent passport-size photo (JPG or PNG, face clearly visible)',
    icon: 'User',
  },
  {
    type: 'pan_card',
    label: 'PAN Card',
    description: 'Clear photo or PDF of PAN card',
    icon: 'CreditCard',
  },
  {
    type: 'aadhaar_card',
    label: 'Aadhaar Card',
    description: 'Front side of Aadhaar (mask last 4 digits if preferred)',
    icon: 'Contact',
  },
  {
    type: 'income_proof',
    label: 'Income Proof',
    description: 'Salary slip, ITR, or last 3 months bank statement',
    icon: 'FileText',
  },
];

export const CO_APPLICANT_DOC_PREFIX = 'co_applicant_';

export function coApplicantDocType(baseType) {
  return `${CO_APPLICANT_DOC_PREFIX}${baseType}`;
}

export function requiresCoApplicant(employmentType) {
  return employmentType === 'retired';
}

export function normalizeDynamicDocumentRequirements(requirements = []) {
  if (!Array.isArray(requirements) || !requirements.length) return APPLICANT_DOCUMENTS;
  const seen = new Set();
  const normalized = [];
  requirements.forEach((item, index) => {
    const type = item?.documentType || item?.type;
    if (!type || seen.has(type)) return;
    seen.add(type);
    normalized.push({
      type,
      label: item.title || item.label || type,
      description: item.subtitle || item.description || '',
      icon: item.icon || 'FileText',
      allowedFileTypes: item.allowedFileTypes || [],
      sortOrder: Number(item.sortOrder ?? index),
      isRequired: item.isRequired !== false,
    });
  });
  return normalized.length ? normalized : APPLICANT_DOCUMENTS;
}

/** All document type keys required for the current applicant profile. */
export function getRequiredDocumentTypes(employmentType, requirements = APPLICANT_DOCUMENTS) {
  const base = requirements
    .filter((d) => d.isRequired !== false && d.type)
    .map((d) => d.type);
  if (!requiresCoApplicant(employmentType)) return base;
  return [...base, ...base.map(coApplicantDocType)];
}

/** Base applicant docs plus one statement upload per existing loan row. */
export function getAssessmentDocumentTypes({
  employmentType,
  requirements = APPLICANT_DOCUMENTS,
  existingLoans = [],
  hasRunningLoanOrCard,
}) {
  const baseDefs = normalizeDynamicDocumentRequirements(requirements);
  const baseTypes = getRequiredDocumentTypes(employmentType, baseDefs);
  if (hasRunningLoanOrCard !== 'yes') return baseTypes;

  const loanStatementTypes = buildExistingLoanStatementDocuments(existingLoans).map((d) => d.type);
  return [...baseTypes, ...loanStatementTypes];
}

/** Merge server/base document defs with dynamic loan-statement uploads. */
export function mergeAssessmentDocumentDefinitions({
  requirements = APPLICANT_DOCUMENTS,
  existingLoans = [],
  hasRunningLoanOrCard,
}) {
  const base = normalizeDynamicDocumentRequirements(requirements);
  if (hasRunningLoanOrCard !== 'yes') return base;
  return [...base, ...buildExistingLoanStatementDocuments(existingLoans)];
}

export { isExistingLoanStatementDocType };
