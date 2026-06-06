/** Bank institution types — used in marketplace filters and admin bank forms. */
export const BANK_TYPE_OPTIONS = [
  { value: 'public', label: 'Public Sector' },
  { value: 'private', label: 'Private Sector' },
  { value: 'foreign', label: 'Foreign Bank' },
  { value: 'nbfc', label: 'NBFC' },
  { value: 'cooperative', label: 'Cooperative Bank' },
];

const LABEL_BY_VALUE = Object.fromEntries(BANK_TYPE_OPTIONS.map((o) => [o.value, o.label]));

export function getBankTypeLabel(bankType) {
  if (!bankType) return '—';
  return LABEL_BY_VALUE[String(bankType).toLowerCase()] || String(bankType);
}
