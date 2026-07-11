import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import DashboardKpiCard from '../../../components/dashboard/DashboardKpiCard';
import { openAssessmentOrEligibilityFirst } from '../../../utils/eligibilityGate';
import { marketService } from '../../../services/marketService';
import FinancialGoalsPlanner from './FinancialGoalsPlanner';

const DEFAULT_ALLOCATION = [
  { name: 'Equity Funds', value: 45, color: '#1e3a5f' },
  { name: 'Debt Funds', value: 25, color: '#3b82f6' },
  { name: 'Gold & ETFs', value: 12, color: '#ca8a04' },
  { name: 'Fixed Deposits', value: 10, color: '#94a3b8' },
  { name: 'Others', value: 8, color: '#cbd5e1' },
];

const FALLBACK_MARKET_INDICES = [
  { name: 'NIFTY 50', value: '—', change: '—', up: true, spark: [1, 1, 1, 1, 1, 1, 1] },
  { name: 'SENSEX', value: '—', change: '—', up: true, spark: [1, 1, 1, 1, 1, 1, 1] },
  { name: 'GOLD (24K)', value: '—', change: '—', up: true, spark: [1, 1, 1, 1, 1, 1, 1] },
  { name: 'USD/INR', value: '—', change: '—', up: true, spark: [1, 1, 1, 1, 1, 1, 1] },
];

const MARKET_REFRESH_MS = 60_000;

const DEFAULT_RECOMMENDATIONS = [
  {
    id: 'sip',
    title: 'SIP in Top Equity Funds',
    description: 'Start a monthly SIP from ₹500 and build long-term wealth.',
    cta: 'Invest Now',
    path: '/mutual-fund-marketplace',
    icon: 'TrendingUp',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'cibil',
    title: 'Increase Your Credit Score',
    description: 'Get personalized tips to improve your CIBIL score.',
    cta: 'Check Now',
    path: '/customer-dashboard?tab=portfolio',
    icon: 'Gauge',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    id: 'term',
    title: 'Term Life Insurance',
    description: 'Protect your family with affordable term cover.',
    cta: 'Buy Now',
    path: '/insurance-marketplace',
    icon: 'Shield',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
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

function statusMeta(status) {
  const s = String(status || 'pending').toLowerCase();
  if (['approved', 'disbursed'].includes(s)) {
    return { label: 'Approved', className: 'bg-emerald-100 text-emerald-800' };
  }
  if (['under_review', 'submitted'].includes(s)) {
    return { label: 'In Review', className: 'bg-orange-100 text-orange-800' };
  }
  if (['documents_pending', 'documents_required', 'processing'].includes(s)) {
    return { label: 'In Process', className: 'bg-sky-100 text-sky-800' };
  }
  if (s === 'rejected') {
    return { label: 'Rejected', className: 'bg-red-100 text-red-800' };
  }
  return { label: 'Pending', className: 'bg-amber-100 text-amber-800' };
}

function appIcon(loanType) {
  const t = String(loanType || '').toLowerCase();
  if (t.includes('home')) return 'Home';
  if (t.includes('health') || t.includes('insurance')) return 'Shield';
  if (t.includes('credit')) return 'CreditCard';
  if (t.includes('personal')) return 'Wallet';
  return 'FileText';
}

function Sparkline({ points, up }) {
  const raw = (points || []).map(Number).filter(Number.isFinite);
  const series = raw.length >= 2 ? raw : raw.length === 1 ? [raw[0] * 0.995, raw[0]] : [1, 1, 1];
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const w = 56;
  const h = 24;
  const coords = series
    .map((p, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        fill="none"
        stroke={up ? '#059669' : '#dc2626'}
        strokeWidth="2"
        points={coords}
      />
    </svg>
  );
}

function OverviewPanel({ title, onViewAll, headerRight, children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-xl shadow-sm flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="font-bold text-foreground">{title}</h3>
        {headerRight || (onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </button>
        ) : null)}
      </div>
      <div className="px-5 pb-5 flex-1">{children}</div>
    </div>
  );
}

const CustomerDashboardOverview = ({
  profileName,
  financialSnapshot,
  snapshotLoading,
  applications = [],
  onViewApplication,
  onTabChange,
  onPullCreditScore,
  creditPulling,
  onRefreshSnapshot,
}) => {
  const navigate = useNavigate();
  const firstName = profileName?.split(' ')?.[0] || 'there';
  const [marketIndices, setMarketIndices] = useState(FALLBACK_MARKET_INDICES);
  const [marketMeta, setMarketMeta] = useState({ live: false, updatedAt: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    let retryTimer;

    const loadMarket = async () => {
      try {
        const data = await marketService.getMarketOverview();
        if (cancelled) return;
        if (Array.isArray(data?.indices) && data.indices.length > 0) {
          setMarketIndices(data.indices);
          setMarketMeta({
            live: Boolean(data.live) && !data.stale,
            updatedAt: data.updatedAt || null,
            loading: false,
            stale: Boolean(data.stale),
          });
          // Background refresh may still be running — poll once more shortly.
          if (data.refreshing || data.stale) {
            clearTimeout(retryTimer);
            retryTimer = setTimeout(() => {
              if (!cancelled) loadMarket();
            }, 8_000);
          }
        } else {
          setMarketMeta((prev) => ({ ...prev, loading: false }));
        }
      } catch {
        if (!cancelled) {
          setMarketMeta((prev) => ({ ...prev, loading: false, live: false }));
        }
      }
    };

    loadMarket();
    const timer = setInterval(loadMarket, MARKET_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
      clearTimeout(retryTimer);
    };
  }, []);

  const summary = financialSnapshot?.summary || {};
  const allocation = useMemo(() => {
    const raw = financialSnapshot?.portfolioAllocation || [];
    if (raw.length > 0) return raw;
    return DEFAULT_ALLOCATION;
  }, [financialSnapshot?.portfolioAllocation]);

  const totalPortfolioValue = useMemo(() => {
    if (summary.totalInvestments > 0) return summary.totalInvestments;
    return allocation.reduce((s, a) => s + (a.value || 0), 0);
  }, [summary.totalInvestments, allocation]);

  const recommendations = useMemo(() => {
    const fromApi = (financialSnapshot?.recommendations || []).slice(0, 3).map((r, i) => ({
      id: r.type || i,
      title: r.title,
      description: r.description,
      cta: 'Learn more',
      path: r.path || '/homepage',
      icon: 'Sparkles',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    }));
    return fromApi.length >= 2 ? fromApi : DEFAULT_RECOMMENDATIONS;
  }, [financialSnapshot?.recommendations]);

  const goals = financialSnapshot?.financialGoals || [];

  const payments = financialSnapshot?.upcomingPayments?.length
    ? financialSnapshot.upcomingPayments
    : [
        { id: 'demo-sip', label: 'SIP Installment', amount: 10000, dueDate: '5 Jul 2026' },
        { id: 'demo-emi', label: 'Home Loan EMI', amount: 28500, dueDate: '7 Jul 2026' },
        { id: 'demo-ins', label: 'Health Insurance Premium', amount: 12500, dueDate: '15 Jul 2026' },
      ];

  const creditBand = summary.creditScoreBand || 'Good';
  const creditSubtitle =
    summary.creditScore >= 750
      ? 'Excellent'
      : summary.creditScore >= 650
        ? creditBand
        : creditBand || 'Pull score to update';

  return (
    <div className="space-y-6">
      {/* Welcome + action buttons */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Here&apos;s your financial overview for today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Compass"
            onClick={() => navigate('/homepage')}
          >
            Explore Products
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="GitCompare"
            onClick={() => navigate('/product-comparison')}
          >
            Compare &amp; Save
          </Button>
          <Button
            className="rf-btn-primary"
            size="sm"
            iconName="Plus"
            onClick={() => openAssessmentOrEligibilityFirst(navigate)}
          >
            Apply for Loan
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <DashboardKpiCard
          title="Total Investments"
          value={formatInr(summary.totalInvestments || totalPortfolioValue)}
          change={
            summary.investmentReturnsPct
              ? `▲ ${summary.investmentReturnsPct}% (1Y Returns)`
              : undefined
          }
          icon="TrendingUp"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <DashboardKpiCard
          title="Total Loans"
          value={formatInr(summary.totalLoansOutstanding)}
          subtitle="Outstanding Amount"
          icon="Landmark"
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
        />
        <DashboardKpiCard
          title="Active Insurance"
          value={formatInr(summary.totalInsuranceCover)}
          subtitle="Total Sum Assured"
          icon="Shield"
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
        <DashboardKpiCard
          title="Monthly Savings"
          value={formatInr(summary.monthlySavings)}
          subtitle="Your SIP & RD Amount"
          icon="PiggyBank"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <DashboardKpiCard
          title="Credit Score"
          value={`${summary.creditScore ?? '—'} / 900`}
          subtitle={creditSubtitle}
          icon="Gauge"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {snapshotLoading ? (
        <div className="flex items-center justify-center py-16">
          <Icon name="Loader" size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Row 1: Portfolio | Applications | Recommended */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <OverviewPanel title="Portfolio Overview" onViewAll={() => onTabChange?.('portfolio')}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-[180px] h-[180px] relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {allocation.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatInr(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-muted-foreground">Total Value</span>
                    <span className="text-sm font-bold text-foreground">{formatInr(totalPortfolioValue)}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {allocation.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm gap-2">
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate text-muted-foreground">{item.name}</span>
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between text-sm border-t border-border">
                    <span className="text-emerald-600 font-semibold">
                      Overall Returns ▲ {summary.investmentReturnsPct || 12.45}%
                    </span>
                    <span className="text-xs text-muted-foreground">1Y Returns</span>
                  </div>
                </div>
              </div>
            </OverviewPanel>

            <OverviewPanel title="Recent Applications" onViewAll={() => onTabChange?.('applications')}>
              <div className="space-y-3">
                {applications.slice(0, 4).map((app) => {
                  const meta = statusMeta(app.status);
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => onViewApplication?.(app)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon name={appIcon(app.loanType)} size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {app.loanType || 'Application'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {app.bankName} · {app.applicationNumber || app.id?.slice(0, 8)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.className}`}>
                          {meta.label}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1">{app.appliedDate}</p>
                      </div>
                    </button>
                  );
                })}
                {applications.length === 0 && (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No applications yet.{' '}
                    <button
                      type="button"
                      className="text-primary font-medium"
                      onClick={() => openAssessmentOrEligibilityFirst(navigate)}
                    >
                      Apply now
                    </button>
                  </div>
                )}
              </div>
            </OverviewPanel>

            <OverviewPanel title="Recommended for You">
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${rec.iconBg}`}
                    >
                      <Icon name={rec.icon} size={18} className={rec.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.description}</p>
                      <Button
                        variant="outline"
                        size="xs"
                        className="mt-2"
                        onClick={() => navigate(rec.path)}
                      >
                        {rec.cta}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </OverviewPanel>
          </div>

          {/* Row 2: Goals | Market | Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <OverviewPanel title="Financial Goals">
              <FinancialGoalsPlanner goals={goals} onChanged={onRefreshSnapshot} />
            </OverviewPanel>

            <OverviewPanel
              title="Market Overview"
              headerRight={
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    marketMeta.live ? 'text-emerald-600' : 'text-muted-foreground'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      marketMeta.live ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'
                    }`}
                  />
                  {marketMeta.loading ? 'Updating…' : marketMeta.live ? 'Live' : marketMeta.stale ? 'Cached' : 'Offline'}
                </span>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {marketIndices.map((row) => (
                      <tr key={row.id || row.name} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-2 font-medium text-foreground whitespace-nowrap">
                          {row.name}
                        </td>
                        <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">{row.value}</td>
                        <td
                          className={`py-2.5 px-2 font-semibold whitespace-nowrap ${
                            row.up ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {row.change}
                        </td>
                        <td className="py-2.5 pl-2">
                          <Sparkline points={row.spark?.length ? row.spark : [1, 1, 1]} up={row.up} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </OverviewPanel>

            <OverviewPanel title="Upcoming Payments">
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{payment.label}</p>
                      <p className="text-xs text-muted-foreground">{payment.dueDate}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground shrink-0">{formatInr(payment.amount)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-900 mb-2">Enable AutoPay</p>
                <p className="text-xs text-emerald-800 mb-3">Never miss an EMI or SIP payment again.</p>
                <Button size="xs" className="rf-btn-primary w-full" onClick={() => onTabChange?.('settings')}>
                  Setup AutoPay
                </Button>
              </div>
            </OverviewPanel>
          </div>
        </>
      )}

      {/* Expert help banner */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="Shield" size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                Need help with your finances? Talk to our experts and get personalized financial advice.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-primary/20 border-2 border-emerald-50 flex items-center justify-center text-xs font-bold text-primary"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">+20 Financial Experts ready to assist you</span>
              </div>
            </div>
          </div>
          <Button
            className="rf-btn-primary shrink-0"
            iconName="MessageCircle"
            onClick={() => navigate('/book-appointment')}
          >
            Talk to Expert
          </Button>
        </div>
      </div>

      {!summary.creditScore && onPullCreditScore ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Pull your latest CIBIL score to update your dashboard metrics.
          </p>
          <Button
            variant="outline"
            size="sm"
            loading={creditPulling}
            onClick={onPullCreditScore}
          >
            Check CIBIL Score
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default CustomerDashboardOverview;
