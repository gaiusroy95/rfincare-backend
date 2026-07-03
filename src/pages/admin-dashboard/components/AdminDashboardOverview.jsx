import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';
import DashboardKpiCard from '../../../components/dashboard/DashboardKpiCard';
import QuickActionsPanel from './QuickActionsPanel';

const DONUT_COLORS = ['#004d2c', '#7c3aed', '#2563eb', '#ff5a00', '#059669', '#ca8a04'];

const STATUS_STYLES = {
  approved: 'bg-emerald-100 text-emerald-800',
  under_review: 'bg-sky-100 text-sky-800',
  documents_pending: 'bg-orange-100 text-orange-800',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-800',
};

const REVENUE_DEMO = [
  { month: 'Jan', revenue: 8.2 },
  { month: 'Feb', revenue: 9.1 },
  { month: 'Mar', revenue: 10.4 },
  { month: 'Apr', revenue: 9.8 },
  { month: 'May', revenue: 12.4 },
  { month: 'Jun', revenue: 11.2 },
];

const SYSTEM_SERVICES = [
  'User Management',
  'Payment Gateway',
  'Document Service',
  'Notification Service',
  'API Gateway',
  'Database',
];

function formatStatus(status) {
  if (!status) return 'Pending';
  return String(status).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const AdminDashboardOverview = ({
  applications = [],
  stats = {},
  activityLog = [],
  onQuickAction,
  onViewApplication,
}) => {
  const donutData = useMemo(() => {
    const counts = {};
    for (const app of applications) {
      const type = app.loanType || app.recordType || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    }
    const entries = Object.entries(counts);
    if (!entries.length) {
      return [
        { name: 'Loans', value: 40 },
        { name: 'Insurance', value: 28 },
        { name: 'Investments', value: 18 },
        { name: 'Credit Cards', value: 14 },
      ];
    }
    return entries.map(([name, value]) => ({ name, value }));
  }, [applications]);

  const recentApps = applications.slice(0, 5);

  const kpis = [
    { title: 'Total Users', value: stats.totalUsers || '125,340', change: '+12.5%', icon: 'Users', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700' },
    { title: 'Total Applications', value: stats.totalApplications ?? '0', change: '+15.8%', icon: 'FileText', iconBg: 'bg-violet-50', iconColor: 'text-violet-700' },
    { title: 'Total Disbursed', value: stats.totalDisbursed || '₹250.45 Cr', change: '+18.3%', icon: 'IndianRupee', iconBg: 'bg-sky-50', iconColor: 'text-sky-700' },
    { title: 'Total Premium', value: stats.totalPremium || '₹28.75 Cr', change: '+10.2%', icon: 'Shield', iconBg: 'bg-orange-50', iconColor: 'text-orange-700' },
    { title: 'Total Investments', value: stats.totalInvestments || '₹312.80 Cr', change: '+14.6%', icon: 'TrendingUp', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700' },
    { title: 'Total Revenue', value: stats.totalRevenue || '₹12.45 Cr', change: '+14.6%', icon: 'BarChart3', iconBg: 'bg-orange-50', iconColor: 'text-orange-700' },
  ];

  const activities = (activityLog.length ? activityLog : [
    { action: 'New user registered', createdAt: new Date().toISOString() },
    { action: 'Application approved', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { action: 'Partner onboarding completed', createdAt: new Date(Date.now() - 7200000).toISOString() },
  ]).slice(0, 6);

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Home &gt; Dashboard</p>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-lg px-3 py-2 bg-white">
          <Icon name="Calendar" size={16} />
          <span>01 May 2024 – 31 May 2024</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <DashboardKpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-9 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rf-kpi-card lg:col-span-1">
              <h3 className="font-bold text-foreground mb-4">Applications Overview</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" nameKey="name">
                      {donutData.map((entry, i) => (
                        <Cell key={entry.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 mt-2">
                {donutData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      {d.name}
                    </span>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rf-kpi-card lg:col-span-2">
              <h3 className="font-bold text-foreground mb-4">Recent Applications</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="pb-2 font-medium">ID</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApps.length ? recentApps.map((app) => (
                      <tr key={app.id} className="border-b border-border/60 hover:bg-muted/30 cursor-pointer" onClick={() => onViewApplication?.(app)}>
                        <td className="py-2.5 font-mono text-xs">{app.applicationNumber || app.id?.slice(0, 8)}</td>
                        <td className="py-2.5">{app.loanType || '—'}</td>
                        <td className="py-2.5">{app.customerName || '—'}</td>
                        <td className="py-2.5 font-semibold">
                          {app.amount ? `₹${Number(app.amount).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[app.status] || STATUS_STYLES.pending}`}>
                            {formatStatus(app.status)}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">No applications yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rf-kpi-card">
            <h3 className="font-bold text-foreground mb-4">Revenue Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={REVENUE_DEMO}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit=" Cr" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#004d2c" strokeWidth={2} dot={{ r: 4 }} name="Revenue (₹ Cr)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <QuickActionsPanel onActionClick={onQuickAction} />

          <div className="rf-kpi-card">
            <h3 className="font-bold text-foreground mb-4">System Status</h3>
            <ul className="space-y-2">
              {SYSTEM_SERVICES.map((svc) => (
                <li key={svc} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{svc}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Operational
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rf-kpi-card">
            <h3 className="font-bold text-foreground mb-4">Recent Activity</h3>
            <ul className="space-y-3">
              {activities.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-green)] mt-1.5 shrink-0" />
                  <div>
                    <p className="text-foreground">{item.action || item.description || 'Activity'}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : '—'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
