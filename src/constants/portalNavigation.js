/** Sidebar navigation for customer, agent, employee portals */

export const CUSTOMER_NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard', tab: 'overview' },
  { id: 'applications', label: 'My Applications', icon: 'FileText', tab: 'applications' },
  { id: 'portfolio', label: 'My Investments', icon: 'TrendingUp', tab: 'portfolio' },
  { id: 'documents', label: 'My Documents', icon: 'FolderOpen', tab: 'documents' },
  { id: 'notifications', label: 'My Alerts', icon: 'Bell', tab: 'notifications', badgeKey: 'notifications' },
  { id: 'profile', label: 'My Profile', icon: 'User', tab: 'profile' },
  { id: 'support', label: 'Support Center', icon: 'Headphones', tab: 'support' },
  { id: 'settings', label: 'Settings', icon: 'Settings', tab: 'settings' },
];

export const AGENT_NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard', view: 'overview' },
  { id: 'leads', label: 'Leads', icon: 'UserPlus', view: 'clients', badgeKey: 'leads' },
  { id: 'applications', label: 'Applications', icon: 'FileText', view: 'clients' },
  { id: 'customers', label: 'My Customers', icon: 'Users', view: 'clients' },
  { id: 'earnings', label: 'My Earnings', icon: 'IndianRupee', view: 'performance' },
  { id: 'payouts', label: 'Payouts', icon: 'Wallet', view: 'performance' },
  { id: 'marketing', label: 'Marketing Tools', icon: 'Megaphone', path: '/agent-learning' },
  { id: 'products', label: 'Products', icon: 'Package', path: '/product-comparison' },
  { id: 'training', label: 'Trainings & Materials', icon: 'GraduationCap', path: '/agent-learning' },
  { id: 'refer', label: 'Refer & Earn', icon: 'Gift', view: 'overview' },
  { id: 'support', label: 'Support Center', icon: 'Headphones', path: '/contact-us' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3', view: 'performance' },
  { id: 'settings', label: 'Profile Settings', icon: 'Settings', path: '/agent/settings' },
];

export const EMPLOYEE_NAV_ITEMS = [
  { id: 'applications', label: 'Dashboard', icon: 'LayoutDashboard', tab: 'applications' },
  { id: 'leads', label: 'Leads & CRM', icon: 'UserCheck', tab: 'leads' },
  { id: 'agents', label: 'Agent Verification', icon: 'Users', tab: 'agents' },
  { id: 'documents', label: 'Documents', icon: 'FolderOpen', tab: 'documents' },
  { id: 'training', label: 'Training', icon: 'GraduationCap', tab: 'training' },
  { id: 'activity', label: 'Activity Log', icon: 'Activity', tab: 'activity' },
  { id: 'support', label: 'Support Center', icon: 'Headphones', path: '/contact-us' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/employee/settings' },
];
