import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const STATUS_META = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  submitted: { label: 'Submitted', className: 'bg-sky-100 text-sky-800' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  under_review: { label: 'Under review', className: 'bg-violet-100 text-violet-800' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
};

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'In progress' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'approved', label: 'Approved' },
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function matchesFilter(app, filter) {
  const status = String(app.rawStatus || '').toLowerCase();
  if (filter === 'all') return true;
  if (filter === 'active') return ['draft', 'pending', 'under_review'].includes(status);
  if (filter === 'submitted') return status === 'submitted';
  if (filter === 'approved') return status === 'approved';
  return true;
}

const AgentApplicationsPanel = ({ applications = [], onOpenApplication, onMessage }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const list = useMemo(
    () => (Array.isArray(applications) ? applications : []).filter((app) => matchesFilter(app, filter)),
    [applications, filter],
  );

  const counts = useMemo(() => {
    const apps = Array.isArray(applications) ? applications : [];
    return {
      all: apps.length,
      active: apps.filter((a) => matchesFilter(a, 'active')).length,
      submitted: apps.filter((a) => matchesFilter(a, 'submitted')).length,
      approved: apps.filter((a) => matchesFilter(a, 'approved')).length,
    };
  }, [applications]);

  const handleNewApplication = () => {
    navigate('/agent/customer-application');
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border border-border p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">My Submitted Applications</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Loan applications you created or submitted on behalf of customers.
            </p>
          </div>
          <Button className="rf-btn-primary shrink-0" iconName="Plus" onClick={handleNewApplication}>
            New Application
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground">{counts.all}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">In progress</p>
            <p className="text-xl font-bold text-foreground">{counts.active}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Submitted</p>
            <p className="text-xl font-bold text-foreground">{counts.submitted}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-xl font-bold text-foreground">{counts.approved}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex flex-wrap gap-2 p-4 border-b border-border">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-[var(--color-brand-green)] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label} ({counts[tab.id] ?? 0})
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="p-10 text-center">
            <Icon name="FileText" size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No applications in this view yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Start a new loan application for your customer to see it here.
            </p>
            <Button className="rf-btn-primary" iconName="Plus" onClick={handleNewApplication}>
              Submit New Application
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Application #</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Loan type</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Submitted</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((app) => {
                  const statusKey = String(app.rawStatus || 'draft').toLowerCase();
                  const statusMeta = STATUS_META[statusKey] || STATUS_META.draft;
                  const isDraft = statusKey === 'draft';
                  return (
                    <tr key={app.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                        {app.applicationNumber || app.id?.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.email || app.phone || '—'}</p>
                      </td>
                      <td className="px-4 py-3 capitalize">{String(app.loanType || '—').replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 font-medium">{app.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                        {app.documentStage && (
                          <p className="text-[10px] text-muted-foreground mt-1 capitalize">
                            Docs: {String(app.documentStage).replace(/_/g, ' ')}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(app.submittedAt || (isDraft ? null : app.updatedAt))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => (onOpenApplication ? onOpenApplication(app) : navigate('/agent/customer-application', {
                              state: {
                                leadMeta: {
                                  fullName: app.name,
                                  email: app.email,
                                  phone: app.phone,
                                  applicationId: app.id,
                                },
                              },
                            }))}
                          >
                            {isDraft ? 'Continue' : 'View'}
                          </Button>
                          {onMessage && (
                            <Button
                              size="sm"
                              variant="ghost"
                              iconName="MessageCircle"
                              onClick={() => onMessage(app)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentApplicationsPanel;
