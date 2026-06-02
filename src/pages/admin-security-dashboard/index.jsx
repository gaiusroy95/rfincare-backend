import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/apiClient';

import { trackEvent } from '../../hooks/useGoogleAnalytics';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import StatsCard from '../admin-dashboard/components/StatsCard';
import ActivityLog from '../admin-dashboard/components/ActivityLog';

const AdminSecurityDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('permissions');
  const [rolePermissions, setRolePermissions] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [permissionConflicts, setPermissionConflicts] = useState([]);
  const [securityStats, setSecurityStats] = useState({
    totalUsers: 0,
    activeRoles: 0,
    accessAttempts: 0,
    conflicts: 0
  });

  const ROLE_HIERARCHY = {
    customer: 1,
    agent: 2,
    employee: 3,
    admin: 4,
    super_admin: 5
  };

  const PERMISSIONS_MATRIX = {
    customer: ['read:own_profile', 'update:own_profile', 'create:loan_application', 'read:own_loan_applications', 'update:own_loan_applications', 'read:banks', 'read:bank_products'],
    agent: ['read:own_profile', 'update:own_profile', 'read:assigned_customers', 'read:assigned_loan_applications', 'update:assigned_loan_applications', 'read:banks', 'read:bank_products', 'read:commission_tracker', 'read:performance_metrics'],
    employee: ['read:own_profile', 'update:own_profile', 'read:all_loan_applications', 'update:all_loan_applications', 'read:all_customers', 'read:banks', 'read:bank_products', 'read:approval_matrix', 'read:documents', 'update:documents'],
    admin: ['read:*', 'create:*', 'update:*', 'delete:loan_applications', 'manage:agents', 'manage:employees', 'manage:customers', 'manage:banks', 'manage:bank_products', 'manage:approval_matrix', 'manage:interest_matrix', 'read:audit_logs', 'read:reports'],
    super_admin: ['read:*', 'create:*', 'update:*', 'delete:*', 'manage:*', 'system:*']
  };

  useEffect(() => {
    if (!user || !userProfile) {
      navigate('/authentication-management-center');
      return;
    }

    if (userProfile?.role !== 'admin' && userProfile?.role !== 'super_admin') {
      navigate('/admin-dashboard');
      return;
    }

    loadSecurityData();
    trackEvent('page_view', { page_name: 'admin_security_dashboard' });
  }, [user, userProfile]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/auth/users');
      const users = res.data.users || [];
      
      processSecurityData(users);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processSecurityData = (users) => {
    // 1. Role Permissions
    const roleData = Object.keys(ROLE_HIERARCHY).map((role) => {
      const usersWithRole = users.filter((u) => u.role === role);
      return {
        role,
        hierarchy: ROLE_HIERARCHY[role],
        permissions: PERMISSIONS_MATRIX[role] || [],
        userCount: usersWithRole.length,
        activeUsers: usersWithRole.filter((u) => u.is_active && u.account_status === 'active').length
      };
    });
    setRolePermissions(roleData);

    // 2. Conflicts
    const conflicts = [];
    const inactiveWithAccess = users.filter((u) => (!u.is_active || u.account_status !== 'active'));
    if (inactiveWithAccess.length > 0) {
      conflicts.push({
        id: 'conflict-1',
        type: 'inactive_account',
        severity: 'high',
        title: 'Inactive Accounts with Potential Access',
        description: `${inactiveWithAccess.length} user(s) with inactive accounts detected.`,
        affectedUsers: inactiveWithAccess.length,
        recommendation: 'Revoke search permissions and sessions for these users.'
      });
    }

    const superAdminCount = users.filter(u => u.role === 'super_admin').length;
    if (superAdminCount > 3) {
      conflicts.push({
        id: 'conflict-2',
        type: 'excessive_privileges',
        severity: 'medium',
        title: 'Excessive Super Admin Accounts',
        description: `${superAdminCount} super admin accounts detected (recommended: max 3).`,
        affectedUsers: superAdminCount,
        recommendation: 'Review and downgrade unnecessary super admin privileges.'
      });
    }
    setPermissionConflicts(conflicts);

    // 3. Stats
    setSecurityStats({
      totalUsers: users.length,
      activeRoles: new Set(users.map(u => u.role)).size,
      accessAttempts: 1247, // Placeholder
      conflicts: conflicts.length
    });

    // 4. Access Logs (Mocked for now)
    setAccessLogs([
      { id: 'log-1', type: 'login', userName: 'System', action: 'Security scan completed', timestamp: 'Just now', status: 'success' }
    ]);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      customer: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: 'User' },
      agent: { bg: 'bg-pink-500/10', text: 'text-pink-600', icon: 'Users' },
      employee: { bg: 'bg-green-500/10', text: 'text-green-600', icon: 'Briefcase' },
      admin: { bg: 'bg-purple-500/10', text: 'text-purple-600', icon: 'Shield' },
      super_admin: { bg: 'bg-orange-500/10', text: 'text-orange-600', icon: 'Crown' }
    };

    const config = roleConfig[role] || roleConfig.customer;
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        <Icon name={config.icon} size={14} />
        <span className="capitalize">{role?.replace('_', ' ')}</span>
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      high: { bg: 'bg-destructive/10', text: 'text-destructive', icon: 'AlertTriangle' },
      medium: { bg: 'bg-warning/10', text: 'text-warning', icon: 'AlertCircle' },
      low: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: 'Info' }
    };

    const config = severityConfig[severity] || severityConfig.low;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon name={config.icon} size={12} />
        <span className="uppercase">{severity}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading security dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Security Monitoring</h1>
            <p className="text-muted-foreground">Real-time role permissions, access logs, and security conflicts</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button variant="outline" iconName="RefreshCw" onClick={loadSecurityData}>Refresh</Button>
            <Button variant="outline" iconName="ArrowLeft" onClick={() => navigate('/admin-dashboard')}>Back</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Users" value={securityStats.totalUsers} icon="Users" iconBg="bg-primary/10" />
          <StatsCard title="Active Roles" value={securityStats.activeRoles} icon="Shield" iconBg="bg-purple-500/10" />
          <StatsCard title="Access Attempts" value={securityStats.accessAttempts} icon="Activity" iconBg="bg-blue-500/10" />
          <StatsCard title="Conflicts" value={securityStats.conflicts} icon="AlertTriangle" iconBg="bg-destructive/10" />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex border-b border-border">
            {['permissions', 'logs', 'conflicts'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'permissions' && (
              <div className="space-y-4">
                {rolePermissions.map(r => (
                  <div key={r.role} className="p-4 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        {getRoleBadge(r.role)}
                        <span className="text-xs text-muted-foreground">Level {r.hierarchy}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 max-w-xl">
                        {r.permissions.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{r.userCount}</div>
                      <div className="text-xs text-muted-foreground">Users</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'logs' && <ActivityLog activities={accessLogs} />}

            {activeTab === 'conflicts' && (
              <div className="space-y-4">
                {permissionConflicts.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
                    <p className="text-lg font-bold">No issues found</p>
                  </div>
                ) : (
                  permissionConflicts.map(c => (
                    <div key={c.id} className="p-4 border border-border rounded-lg bg-card">
                      <div className="flex items-center space-x-2 mb-2">
                        {getSeverityBadge(c.severity)}
                        <h4 className="font-bold">{c.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{c.description}</p>
                      <div className="p-3 bg-muted rounded text-xs">
                        <strong>Recommendation:</strong> {c.recommendation}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurityDashboard;