/** Maximum number of banks a user can select for side-by-side comparison. */
export const MAX_BANK_COMPARE = 6;

export function canAddToBankCompare(currentCount) {
  return currentCount < MAX_BANK_COMPARE;
}
