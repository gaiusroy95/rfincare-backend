import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

const UnifiedFinancialOverview = ({ snapshot, loading, onRefresh }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <p className="text-muted-foreground mb-4">Unable to load your financial overview.</p>
        <Button variant="outline" onClick={onRefresh}>Retry</Button>
      </div>
    );
  }

  const { summary = {}, recommendations = [], renewalAlerts = [] } = snapshot;

  const statCards = [
    { label: 'Active Loans', value: summary.activeLoans ?? 0, icon: 'Landmark', color: 'text-blue-600' },
    { label: 'Insurance Policies', value: summary.insurancePolicies ?? 0, icon: 'Shield', color: 'text-emerald-600' },
    { label: 'SIP Interests', value: summary.sipInterests ?? 0, icon: 'TrendingUp', color: 'text-violet-600' },
    { label: 'Fixed Deposits', value: summary.fixedDeposits ?? 0, icon: 'PiggyBank', color: 'text-amber-600' },
    { label: 'Credit Cards', value: summary.creditCards ?? 0, icon: 'CreditCard', color: 'text-rose-600' },
    { label: 'Financial Health', value: `${summary.financialHealthScore ?? 0}/100`, icon: 'HeartPulse', color: 'text-primary' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4">
            <Icon name={card.icon} size={20} className={`${card.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Icon name="Calendar" size={20} /> Monthly EMI Calendar
          </h3>
          {(snapshot.emiCalendar || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No active EMIs tracked yet.</p>
          ) : (
            <div className="space-y-3">
              {snapshot.emiCalendar.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium capitalize">{String(item.label || '').replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">Due day {item.dueDay} of month</p>
                  </div>
                  <p className="font-bold text-primary">{item.emi ? formatInr(item.emi) : '—'}</p>
                </div>
              ))}
              {summary.monthlyEmiEstimate > 0 && (
                <p className="text-sm font-semibold pt-2 border-t border-border">
                  Total estimated EMI: {formatInr(summary.monthlyEmiEstimate)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-2">Financial Health Score</h3>
          <p className="text-4xl font-bold text-primary mb-2">{summary.financialHealthScore ?? 0}</p>
          <p className="text-sm text-muted-foreground">
            Based on your loans, documents, insurance and investment activity on Rfincare.
          </p>
          {summary.pendingDocuments > 0 && (
            <p className="text-sm text-amber-700 mt-3">{summary.pendingDocuments} document(s) pending verification.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionList
          title="Active Loans"
          icon="FileText"
          items={snapshot.activeLoans}
          emptyText="No active loan applications."
          renderItem={(item) => (
            <div className="flex justify-between gap-2">
              <span className="capitalize">{String(item.loanType || 'loan').replace(/_/g, ' ')}</span>
              <span className="text-xs text-muted-foreground">{item.status}</span>
            </div>
          )}
        />
        <SectionList
          title="Insurance Policies"
          icon="Shield"
          items={snapshot.insurancePolicies}
          emptyText="No insurance policies yet."
          renderItem={(item) => (
            <div className="flex justify-between gap-2">
              <span>{item.name || 'Policy'}</span>
              <span className="text-xs text-muted-foreground">{item.status}</span>
            </div>
          )}
        />
        <SectionList
          title="SIP Portfolio"
          icon="TrendingUp"
          items={snapshot.sipPortfolio}
          emptyText="Explore mutual funds to start a SIP."
          renderItem={(item) => item.productLabel || 'Mutual fund interest'}
          onExplore={() => navigate('/mutual-fund-marketplace')}
        />
        <SectionList
          title="Investment Portfolio"
          icon="PieChart"
          items={snapshot.investmentPortfolio}
          emptyText="No investment interests yet."
          renderItem={(item) => item.label || item.type}
        />
        <SectionList
          title="Fixed Deposits"
          icon="Landmark"
          items={snapshot.fixedDeposits}
          emptyText="Explore fixed income and post office schemes."
          renderItem={(item) => item.productLabel || item.marketplaceType}
          onExplore={() => navigate('/fixed-income-marketplace')}
        />
        <SectionList
          title="Credit Cards"
          icon="CreditCard"
          items={snapshot.creditCards}
          emptyText="Browse credit card offers."
          renderItem={(item) => item.productLabel || 'Credit card interest'}
          onExplore={() => navigate('/credit-cards')}
        />
      </div>

      {renewalAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Icon name="Bell" size={18} /> Renewal Alerts
          </h3>
          <ul className="space-y-2">
            {renewalAlerts.map((alert) => (
              <li key={alert.id} className="text-sm text-amber-800">{alert.title}</li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">Personalized Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <button
                key={rec.title}
                type="button"
                onClick={() => navigate(rec.path)}
                className="text-left bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors"
              >
                <span className="text-[10px] uppercase font-bold text-primary">{rec.priority}</span>
                <h4 className="font-bold mt-1">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => navigate('/resources/calculators')}>
          Financial Calculators
        </Button>
        <Button variant="outline" onClick={() => navigate('/retirement-planning')}>
          Retirement Planning
        </Button>
        <Button variant="outline" onClick={() => navigate('/tax-saving')}>
          Tax Saving
        </Button>
        <Button variant="outline" onClick={() => navigate('/document-management-center')}>
          Document Vault
        </Button>
      </div>
    </div>
  );
};

function SectionList({ title, icon, items = [], emptyText, renderItem, onExplore }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <Icon name={icon} size={18} /> {title}
      </h3>
      {items.length === 0 ? (
        <div>
          <p className="text-sm text-muted-foreground">{emptyText}</p>
          {onExplore && (
            <button type="button" className="text-sm text-primary font-semibold mt-2" onClick={onExplore}>
              Explore →
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.slice(0, 5).map((item, i) => (
            <li key={item.id || i} className="py-2 border-b border-border last:border-0">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UnifiedFinancialOverview;
