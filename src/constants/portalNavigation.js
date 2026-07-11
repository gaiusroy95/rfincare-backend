/** Sidebar navigation for customer, agent, employee portals */

export const CUSTOMER_NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard', tab: 'overview' },
  { id: 'applications', label: 'My Applications', icon: 'FileText', tab: 'applications' },
  { id: 'portfolio', label: 'My Investments', icon: 'TrendingUp', tab: 'portfolio' },
  { id: 'documents', label: 'My Documents', icon: 'FolderOpen', tab: 'documents' },
  { id: 'notifications', label: 'My Alerts', icon: 'Bell', tab: 'notifications', badgeKey: 'notifications' },
  { id: 'profile', label: 'My Profile', icon: 'User', tab: 'profile' },
  { id: 'support', label: 'Support Center', icon: 'Headphones', tab: 'support' },
  { id: 'refer', label: 'Refer & Earn', icon: 'Gift', tab: 'refer' },
  { id: 'settings', label: 'Settings', icon: 'Settings', tab: 'settings' },
];

export const CUSTOMER_TAB_IDS = CUSTOMER_NAV_ITEMS.map((i) => i.tab).filter(Boolean);

export const AGENT_NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard', view: 'overview' },
  { id: 'leads', label: 'Leads', icon: 'UserPlus', view: 'clients', section: 'leads', badgeKey: 'leads' },
  { id: 'applications', label: 'Applications', icon: 'FileText', view: 'clients', section: 'applications' },
  { id: 'customers', label: 'My Customers', icon: 'Users', view: 'clients', section: 'customers' },
  { id: 'earnings', label: 'My Earnings', icon: 'IndianRupee', view: 'performance', section: 'earnings' },
  { id: 'payouts', label: 'Payouts', icon: 'Wallet', view: 'performance', section: 'payouts' },
  { id: 'marketing', label: 'Marketing Tools', icon: 'Megaphone', view: 'learning', section: 'marketing' },
  { id: 'products', label: 'Products', icon: 'Package', view: 'products' },
  { id: 'training', label: 'Trainings & Materials', icon: 'GraduationCap', view: 'learning', section: 'training' },
  { id: 'refer', label: 'Refer & Earn', icon: 'Gift', view: 'refer' },
  { id: 'support', label: 'Support Center', icon: 'Headphones', view: 'support' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3', view: 'performance', section: 'reports' },
  { id: 'settings', label: 'Profile Settings', icon: 'Settings', view: 'settings' },
];

export const EMPLOYEE_NAV_ITEMS = [
  { id: 'applications', label: 'Dashboard', icon: 'LayoutDashboard', tab: 'applications' },
  { id: 'leads', label: 'Leads & CRM', icon: 'UserCheck', tab: 'leads' },
  { id: 'agents', label: 'Agent Verification', icon: 'Users', tab: 'agents' },
  { id: 'documents', label: 'Application Verification', icon: 'FolderOpen', tab: 'documents' },
  { id: 'training', label: 'Training', icon: 'GraduationCap', tab: 'training' },
  { id: 'activity', label: 'Activity Log', icon: 'Activity', tab: 'activity' },
  { id: 'agent-referral', label: 'Agent Referral', icon: 'Gift', tab: 'agent-referral' },
  { id: 'customer-referral', label: 'Customer Referral', icon: 'Share2', tab: 'customer-referral' },
  { id: 'support', label: 'Support Center', icon: 'Headphones', tab: 'support' },
  { id: 'settings', label: 'Settings', icon: 'Settings', tab: 'settings' },
];

export const EMPLOYEE_ALWAYS_VISIBLE_TABS = [
  'support',
  'settings',
  'agent-referral',
  'customer-referral',
];

export function resolveAgentNavFromSearch(searchParams) {
  const view = searchParams.get('view');
  const section = searchParams.get('section');

  if (!view) {
    return { view: 'overview', section: null, navId: 'overview' };
  }

  const exact = AGENT_NAV_ITEMS.find(
    (item) => item.view === view && (item.section ? item.section === section : !section),
  );
  if (exact) {
    return { view: exact.view, section: exact.section || null, navId: exact.id };
  }

  const byView = AGENT_NAV_ITEMS.find((item) => item.view === view);
  if (byView) {
    return { view: byView.view, section: byView.section || section || null, navId: byView.id };
  }

  return { view: 'overview', section: null, navId: 'overview' };
}

export function getAgentSearchParamsForNavId(navId) {
  const item = AGENT_NAV_ITEMS.find((i) => i.id === navId);
  if (!item || item.view === 'overview') return {};
  if (item.section) return { view: item.view, section: item.section };
  return { view: item.view };
}

export function getEmployeeTabFromSearch(searchParams) {
  const tab = searchParams.get('tab');
  const validTabs = [
    ...EMPLOYEE_NAV_ITEMS.map((i) => i.tab).filter(Boolean),
  ];
  if (tab && validTabs.includes(tab)) return tab;
  return 'applications';
}
