import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import DashboardKpiCard from '../../../components/dashboard/DashboardKpiCard';

const DEFAULT_EARNINGS_PRODUCT = [
  { name: 'Loans', value: 32400, pct: 41.3, color: '#1e3a5f' },
  { name: 'Insurance', value: 20150, pct: 25.7, color: '#059669' },
  { name: 'Credit Cards', value: 10750, pct: 13.7, color: '#2563eb' },
  { name: 'Investments', value: 8240, pct: 10.5, color: '#7c3aed' },
  { name: 'Others', value: 6910, pct: 8.8, color: '#94a3b8' },
];

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateRange(start, end) {
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${start.toLocaleDateString('en-IN', opts)} - ${end.toLocaleDateString('en-IN', opts)}`;
}

function leadStatusBadge(status) {
  const s = String(status || 'new').toLowerCase();
  if (['new', 'verified'].includes(s)) {
    return { label: 'New', className: 'bg-emerald-100 text-emerald-800' };
  }
  if (['contacted', 'assigned'].includes(s)) {
    return { label: 'Contacted', className: 'bg-sky-100 text-sky-800' };
  }
  if (['in_progress', 'in-progress', 'interested'].includes(s)) {
    return { label: 'Interested', className: 'bg-orange-100 text-orange-800' };
  }
  if (['converted', 'submitted', 'application'].includes(s)) {
    return { label: 'Application', className: 'bg-violet-100 text-violet-800' };
  }
  return { label: 'New', className: 'bg-emerald-100 text-emerald-800' };
}

function OverviewPanel({ title, onViewAll, children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-xl shadow-sm flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="font-bold text-foreground">{title}</h3>
        {onViewAll ? (
          <button type="button" onClick={onViewAll} className="text-sm font-medium text-primary hover:underline">
            View Details
          </button>
        ) : null}
      </div>
      <div className="px-5 pb-5 flex-1">{children}</div>
    </div>
  );
}

const AgentDashboardOverview = ({
  agentName,
  overview,
  dashboard,
  loading,
  onDownloadReport,
  onNavSelect,
  onQuickAction,
  onLeadClick,
}) => {
  const [dateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return formatDateRange(start, end);
  });

  const ov = overview || {};
  const trends = ov.trends || {};

  const kpis = [
    {
      title: 'Total Leads',
      value: String(ov.totalLeads ?? dashboard?.pipelineLeads?.length ?? 0),
      change: `${trends.leads || '+18.4%'} vs last 7 days`,
      icon: 'UserPlus',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Total Applications',
      value: String(ov.totalApplications ?? dashboard?.clients?.length ?? 0),
      change: `${trends.applications || '+15.2%'} vs last 7 days`,
      icon: 'FileText',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
    },
    {
      title: 'Approved Applications',
      value: String(ov.approvedApplications ?? 0),
      change: `${trends.approved || '+16.7%'} vs last 7 days`,
      icon: 'CheckCircle2',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Total Earnings',
      value: formatInr(ov.totalEarnings ?? dashboard?.totalEarnings ?? 0),
      change: `${trends.earnings || '+22.6%'} vs last 7 days`,
      icon: 'IndianRupee',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      title: 'Pending Payout',
      value: formatInr(ov.pendingPayout ?? dashboard?.pendingPayout ?? 0),
      subtitle: ov.payoutSummary?.nextPayoutDate
        ? `Next Payout: ${new Date(ov.payoutSummary.nextPayoutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : 'Next Payout: 25 May 2026',
      icon: 'Wallet',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
  ];

  const leadsChart = ov.leadsChart?.length
    ? ov.leadsChart
    : [
        { name: 'Mon', leads: 12, applications: 8, conversions: 3 },
        { name: 'Tue', leads: 15, applications: 10, conversions: 4 },
        { name: 'Wed', leads: 18, applications: 12, conversions: 5 },
        { name: 'Thu', leads: 14, applications: 9, conversions: 4 },
        { name: 'Fri', leads: 20, applications: 14, conversions: 6 },
        { name: 'Sat', leads: 10, applications: 6, conversions: 2 },
        { name: 'Sun', leads: 8, applications: 5, conversions: 2 },
      ];

  const earningsChart = ov.earningsChart?.length
    ? ov.earningsChart
    : leadsChart.map((row, i) => ({
        name: row.name,
        earnings: [8200, 12400, 9800, 15200, 11400, 6800, 5400][i] || 8000,
      }));

  const earningsByProduct = useMemo(() => {
    const items = ov.earningsByProduct?.length ? ov.earningsByProduct : DEFAULT_EARNINGS_PRODUCT;
    return items;
  }, [ov.earningsByProduct]);

  const totalEarningsDonut = earningsByProduct.reduce((s, item) => s + (item.value || 0), 0)
    || ov.totalEarnings
    || 78450;

  const recentLeads = ov.recentLeads?.length
    ? ov.recentLeads
    : (dashboard?.pipelineLeads || []).slice(0, 5).map((lead) => ({
        id: lead.id,
        name: lead.name,
        mobile: lead.phone || '—',
        product: lead.loanType || '—',
        source: lead.source || 'Website',
        status: lead.rawStatus || lead.status,
        followUp: lead.followUpAt || lead.createdAt,
      }));

  const topProducts = ov.topProducts?.length
    ? ov.topProducts
    : [
        { product: 'Home Loan', applications: 18, conversions: 8, earnings: 32400 },
        { product: 'Personal Loan', applications: 14, conversions: 6, earnings: 18200 },
        { product: 'Health Insurance', applications: 9, conversions: 5, earnings: 12400 },
      ];

  const achievement = ov.achievement || {
    target: 150000,
    current: ov.totalEarnings || 78450,
    progress: 52,
    tier: 'Silver Partner',
  };

  const payoutSummary = ov.payoutSummary || {
    lastPayout: Math.round((ov.totalEarnings || 78450) * 0.75),
    lastPayoutDate: null,
    nextPayout: ov.pendingPayout || 18750,
    nextPayoutDate: null,
  };

  const quickActions = [
    { id: 'add-lead', label: 'Add Lead', icon: 'UserPlus' },
    { id: 'view-leads', label: 'View Leads', icon: 'Users' },
    { id: 'track-application', label: 'Track Application', icon: 'FileSearch' },
    { id: 'marketing-tools', label: 'Marketing Tools', icon: 'Megaphone' },
    { id: 'training', label: 'Training', icon: 'GraduationCap' },
  ];

  const firstName = agentName?.split(' ')?.[0] || 'Agent';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here&apos;s your business overview for today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-card text-sm text-muted-foreground">
            <Icon name="Calendar" size={16} />
            {dateRange}
          </div>
          <Button className="rf-btn-primary" size="sm" iconName="Download" onClick={onDownloadReport}>
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <DashboardKpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <OverviewPanel title="Leads Overview" onViewAll={() => onNavSelect?.({ id: 'leads' })}>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="leads" name="Total Leads" stroke="#059669" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="applications" name="Applications" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="conversions" name="Conversions" stroke="#ea580c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </OverviewPanel>

        <OverviewPanel title="Earnings Overview" onViewAll={() => onNavSelect?.({ id: 'reports' })}>
          <div className="mb-2">
            <p className="text-lg font-bold text-foreground">{formatInr(ov.totalEarnings ?? totalEarningsDonut)}</p>
            <p className="text-xs text-emerald-600 font-semibold">{trends.earnings || '+22.6%'} vs last 7 days</p>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v) => formatInr(v)} />
                <Bar dataKey="earnings" name="Earnings" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </OverviewPanel>

        <OverviewPanel title="Earnings By Product" onViewAll={() => onNavSelect?.({ id: 'earnings' })}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-[160px] h-[160px] relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={earningsByProduct}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {earningsByProduct.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatInr(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted-foreground">Total</span>
                <span className="text-sm font-bold">{formatInr(totalEarningsDonut)}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2 w-full text-sm">
              {earningsByProduct.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-muted-foreground">{item.name}</span>
                  </span>
                  <span className="font-medium shrink-0">{item.pct ?? 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </OverviewPanel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <OverviewPanel title="Recent Leads" onViewAll={() => onNavSelect?.({ id: 'leads' })}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium hidden sm:table-cell">Mobile</th>
                  <th className="pb-2 font-medium hidden md:table-cell">Product</th>
                  <th className="pb-2 font-medium hidden lg:table-cell">Source</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium hidden md:table-cell">Follow Up</th>
                  <th className="pb-2 w-8" />
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => {
                  const badge = leadStatusBadge(lead.status);
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                      onClick={() => onLeadClick?.(lead)}
                    >
                      <td className="py-2.5 font-medium text-foreground">{lead.name}</td>
                      <td className="py-2.5 text-muted-foreground hidden sm:table-cell">{lead.mobile}</td>
                      <td className="py-2.5 text-muted-foreground hidden md:table-cell">{lead.product}</td>
                      <td className="py-2.5 text-muted-foreground hidden lg:table-cell">{lead.source}</td>
                      <td className="py-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-2.5 text-muted-foreground hidden md:table-cell text-xs">
                        {lead.followUp
                          ? new Date(lead.followUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                          : '—'}
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        <Icon name="MoreVertical" size={16} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {recentLeads.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No leads yet. Add your first lead to get started.</p>
            )}
          </div>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-primary hover:underline"
            onClick={() => onNavSelect?.({ id: 'leads' })}
          >
            View All Leads
          </button>
        </OverviewPanel>

        <OverviewPanel title="Top Performing Products" onViewAll={() => onNavSelect?.({ id: 'reports' })}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium text-right">Applications</th>
                  <th className="pb-2 font-medium text-right">Conversions</th>
                  <th className="pb-2 font-medium text-right">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((row) => (
                  <tr key={row.product} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-medium text-foreground">{row.product}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{row.applications}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{row.conversions}</td>
                    <td className="py-2.5 text-right font-semibold text-foreground">{formatInr(row.earnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-primary hover:underline"
            onClick={() => onNavSelect?.({ id: 'reports' })}
          >
            View Product Performance
          </button>
        </OverviewPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">My Achievements</h3>
          <p className="text-sm text-muted-foreground mb-1">May Target Progress</p>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-bold text-foreground">
              {formatInr(achievement.current)} / {formatInr(achievement.target)}
            </span>
            <span className="font-semibold text-primary">{achievement.progress}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary rounded-full" style={{ width: `${achievement.progress}%` }} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            <Icon name="Award" size={14} />
            {achievement.tier}
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Payout Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Last Payout</p>
                <p className="font-bold text-foreground">{formatInr(payoutSummary.lastPayout)}</p>
                <p className="text-xs text-muted-foreground">
                  {payoutSummary.lastPayoutDate
                    ? new Date(payoutSummary.lastPayoutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '05 May 2026'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <Icon name="Wallet" size={20} className="text-teal-600" />
              </div>
            </div>
            <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Next Payout</p>
                <p className="font-bold text-foreground">{formatInr(payoutSummary.nextPayout)}</p>
                <p className="text-xs text-muted-foreground">
                  {payoutSummary.nextPayoutDate
                    ? new Date(payoutSummary.nextPayoutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '25 May 2026'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onQuickAction?.(action.id)}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name={action.icon} size={20} className="text-primary" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-center text-muted-foreground leading-tight">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboardOverview;
