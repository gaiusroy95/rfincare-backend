/**
 * Single admin navigation — always shown in AdminLayout top bar.
 * tab: in-dashboard section via /admin-dashboard?tab=
 * route: separate admin page
 */
export const ADMIN_NAV_ITEMS = [
  { label: 'Applications', tab: 'applications', icon: 'FileText' },
  { label: 'Registrations', tab: 'registrations', icon: 'UserPlus' },
  { label: 'Agents', tab: 'agents', icon: 'Users' },
  { label: 'Employees', tab: 'employees', icon: 'Briefcase' },
  { label: 'Hierarchy', tab: 'hierarchy', icon: 'GitBranch' },
  { label: 'Agent learning', tab: 'agent-learning', icon: 'GraduationCap' },
  { label: 'Employee learning', tab: 'employee-learning', icon: 'BookOpen' },
  { label: 'Leads', tab: 'leads', icon: 'UserCheck' },
  { label: 'Status check', tab: 'status-check', icon: 'Search' },
  { label: 'OTP settings', tab: 'otp', icon: 'MessageSquare' },
  { label: 'Loan products', tab: 'loan-products', icon: 'Package' },
  { label: 'Document matrix', tab: 'document-requirements', icon: 'Files' },
  { label: 'Banks', tab: 'bank-management', icon: 'Building' },
  { label: 'Credit cards', tab: 'credit-cards', icon: 'CreditCard' },
  { label: 'Homepage CMS', tab: 'homepage-cms', icon: 'Layout' },
  { label: 'Marketing & SEO', tab: 'marketing-seo', icon: 'TrendingUp' },
  { label: 'Settings', tab: 'settings', icon: 'UserCog' },
  { label: 'System', tab: 'system', icon: 'Settings' },
  { label: 'Activity', tab: 'activity', icon: 'Activity' },
  { label: 'Reports', path: '/reports-and-analytics', icon: 'BarChart' },
  { label: 'Documents', path: '/admin/documents', icon: 'FolderOpen' },
  { label: 'Bank partners', path: '/bank-marketplace-management', icon: 'Building2' },
  { label: 'Approval matrix', path: '/approval-matrix-management', icon: 'Grid' },
  { label: 'Interest matrix', path: '/interest-matrix-management', icon: 'Percent' },
  { label: 'Audit & security', path: '/admin-security-dashboard', icon: 'Shield' },
];

export const DEFAULT_ADMIN_TAB = 'applications';

export function getAdminTabFromSearch(searchParams) {
  const tab = searchParams.get('tab');
  if (tab && ADMIN_NAV_ITEMS.some((i) => i.tab === tab)) return tab;
  return DEFAULT_ADMIN_TAB;
}

export function isAdminNavItemActive(item, pathname, searchParams) {
  if (item.path) {
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  }
  if (item.tab) {
    return pathname === '/admin-dashboard' && getAdminTabFromSearch(searchParams) === item.tab;
  }
  return false;
}

export function getAdminNavHref(item) {
  if (item.path) return item.path;
  return `/admin-dashboard?tab=${item.tab}`;
}
