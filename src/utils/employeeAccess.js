const MODULE_LABELS = {
  applications: 'Loan Applications',
  customers: 'Customer Management',
  agents: 'Agent Management',
  banks: 'Bank Management',
  reports: 'Reports & Analytics',
  documents: 'Document Management',
  approval_matrix: 'Approval Matrix',
  system_config: 'System Configuration',
};

/** Routes in the main header → required module (any listed module grants portal). */
export const EMPLOYEE_NAV_MODULE_MAP = {
  '/employee-portal': [
    'applications',
    'agents',
    'documents',
    'customers',
    'banks',
    'approval_matrix',
    'reports',
  ],
  '/document-management-center': ['documents'],
  '/reports-and-analytics': ['reports'],
};

/** No admin-configured access → full employee role defaults. */
export function isAccessConfigured(access) {
  return Boolean(access?.configured);
}

export function isEmployeeAccessActive(access) {
  if (!isAccessConfigured(access)) return true;
  if (access.expired) return false;
  return Boolean(access.isActive);
}

export function employeeCan(access, moduleName, permission = 'read') {
  if (!isAccessConfigured(access)) return true;
  if (!isEmployeeAccessActive(access)) return false;
  const perms = access.modules?.[moduleName];
  if (!perms?.length) return false;
  if (perms.includes(permission)) return true;
  if (permission === 'read' && perms.includes('write')) return true;
  return false;
}

export function employeeCanReachRoute(access, path) {
  const modules = EMPLOYEE_NAV_MODULE_MAP[path];
  if (!modules?.length) return true;
  return modules.some((moduleName) => employeeCan(access, moduleName, 'read'));
}

export function employeeModuleLabel(moduleName) {
  return MODULE_LABELS[moduleName] || moduleName;
}

export function grantedModuleLabels(access) {
  if (!isAccessConfigured(access)) return [];
  if (Array.isArray(access.grantedModuleLabels) && access.grantedModuleLabels.length) {
    return access.grantedModuleLabels;
  }
  return Object.keys(access.modules || {}).map((key) => employeeModuleLabel(key));
}
