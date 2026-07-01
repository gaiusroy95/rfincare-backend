/** Shared credit score range options for eligibility and application forms. */
export const CREDIT_SCORE_RANGE_OPTIONS = [
  { value: 'excellent', label: 'Excellent (750+)' },
  { value: 'good', label: 'Good (700-749)' },
  { value: 'fair', label: 'Fair (650-699)' },
  { value: 'poor', label: 'Below 650' },
  { value: '-1', label: '-1' },
  { value: '0', label: '0' },
  { value: 'no_history', label: 'No history' },
];

/** Full application form — includes legacy buckets. */
export const CREDIT_SCORE_RANGE_OPTIONS_FULL = [
  ...CREDIT_SCORE_RANGE_OPTIONS,
  { value: 'very_poor', label: 'Very Poor (Below 600)' },
  { value: 'unknown', label: "I don't know" },
];

const LABEL_BY_VALUE = Object.fromEntries(
  [...CREDIT_SCORE_RANGE_OPTIONS_FULL].map((o) => [o.value, o.label]),
);

export function getCreditScoreRangeLabel(value) {
  if (value == null || value === '') return '—';
  return LABEL_BY_VALUE[value] || String(value);
}
