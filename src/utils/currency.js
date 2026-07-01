/**
 * Indian Rupee (INR) formatting for the India loan platform.
 */

export function formatInr(amount, { maximumFractionDigits = 0 } = {}) {
  const num = Number(typeof amount === 'string' ? amount.replace(/[^\d.-]/g, '') : amount);
  if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits,
  }).format(num);
}

/** Compact labels for large loan amounts (Lakh / Crore). */
export function formatLoanAmount(value) {
  if (value == null || value === '') return 'On request';
  const str = String(value).trim();
  if (str.startsWith('₹')) return str;
  const num = Number(str.replace(/[^\d.-]/g, ''));
  if (Number.isNaN(num)) return str;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}
