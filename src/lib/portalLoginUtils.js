const PORTAL_BY_ROLE = {
  customer: { label: 'Customer Portal', path: '/customer-login' },
  agent: { label: 'Agent Portal', path: '/agent-login' },
  employee: { label: 'Employee Portal', path: '/employee-login' },
  admin: { label: 'Admin Portal', path: '/admin-login' },
  super_admin: { label: 'Admin Portal', path: '/admin-login' },
};

/** Login API returns `{ user: { role } }`; legacy wrappers used `{ profile: { role } }`. */
export function resolveLoginRole(loginData) {
  return loginData?.user?.role || loginData?.profile?.role || null;
}

export function getPortalForRole(role) {
  return PORTAL_BY_ROLE[role] || null;
}

export function getLoginPathForRole(role) {
  return getPortalForRole(role)?.path || '/login-page';
}

export function resolveEffectiveRole(user, userProfile) {
  return userProfile?.role || user?.role || null;
}

export function getWrongPortalMessage(actualRole, expectedRole) {
  const actualPortal = getPortalForRole(actualRole);
  const expectedPortal = getPortalForRole(expectedRole);

  if (actualPortal) {
    return `This email is registered as ${actualRole.replace('_', ' ')}. Use the ${actualPortal.label} instead — you do not need to create a new account.`;
  }

  return `Access denied. ${expectedPortal?.label || 'This portal'} credentials required.`;
}
