/** Bank / document processing stages (employee QC, admin verification). */
export const APPLICATION_STAGE_OPTIONS = [
  { value: 'submitted_to_bank', label: 'Submitted To Bank' },
  { value: 'under_process', label: 'Under process' },
  { value: 'pending_at_qc', label: 'Pending at QC' },
  { value: 'at_kyc_stage', label: 'At KYC Stage' },
  { value: 'at_bgv_stage', label: 'At BGV Stage' },
  { value: 'at_credit_stage', label: 'At Credit Stage' },
  { value: 'at_property_valuation_stage', label: 'At Property Valuation Stage' },
  { value: 'at_property_technical_stage', label: 'At Property Technical Stage' },
  { value: 'at_disbursement_stage', label: 'At Disbursement Stage' },
  { value: 'bank_rejected', label: 'Bank Rejected' },
];

/** Document stage dropdown — excludes bank-only rejection. */
export const DOCUMENT_STAGE_SELECT_OPTIONS = APPLICATION_STAGE_OPTIONS.filter(
  (o) => o.value !== 'bank_rejected',
);

/** Bank approval stage dropdown — full list. */
export const BANK_APPROVAL_STAGE_SELECT_OPTIONS = APPLICATION_STAGE_OPTIONS;

export function prettifyStageStatus(value) {
  if (!value) return '—';
  const match = APPLICATION_STAGE_OPTIONS.find((o) => o.value === value);
  if (match) return match.label;
  return String(value).replace(/_/g, ' ');
}
