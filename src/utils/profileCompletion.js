/**
 * Derive profile completion percentage from snapshot and user profile.
 */
export function computeProfileCompletion(userProfile, financialSnapshot) {
  const profile = financialSnapshot?.profile || {};
  const summary = financialSnapshot?.summary || {};
  const checks = [
    Boolean(userProfile?.fullName || profile.fullName),
    Boolean(userProfile?.email || profile.email),
    Boolean(userProfile?.phone || profile.phone),
    Boolean(profile.customerCode),
    (summary.pendingDocuments ?? 0) === 0 && (financialSnapshot?.documentVault?.length ?? 0) > 0,
    (financialSnapshot?.documentVault || []).some(
      (d) => ['verified', 'approved'].includes(String(d.status || '').toLowerCase()),
    ),
    summary.creditScore != null,
    (summary.financialHealthScore ?? 0) >= 50,
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}
