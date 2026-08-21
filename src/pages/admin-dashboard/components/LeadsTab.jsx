import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { leadService } from '../../../services/leadService';
import { adminService } from '../../../services/adminService';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import LeadsTable from '../../../components/leads/LeadsTable';
import { copyTextToClipboard } from '../../../utils/copyToClipboard';

const LeadsTab = () => {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigneesLoading, setAssigneesLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigneesError, setAssigneesError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [lastResumeUrl, setLastResumeUrl] = useState('');
  const [resumeBusyId, setResumeBusyId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [monthFilter, setMonthFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState(null);

  const loadAssignees = useCallback(async () => {
    setAssigneesLoading(true);
    setAssigneesError('');
    const { data, error: err } = await adminService.getStaffAssignees();
    if (err) {
      setAssigneesError(err.message);
      setEmployees([]);
      setAgents([]);
    } else {
      setEmployees(data?.employees || []);
      setAgents(data?.agents || []);
    }
    setAssigneesLoading(false);
  }, []);

  const load = useCallback(async ({ keepSelection = false, filters } = {}) => {
    setLoading(true);
    setError('');
    const month = filters && 'month' in filters ? filters.month : monthFilter;
    const from = filters && 'dateFrom' in filters ? filters.dateFrom : dateFrom;
    const to = filters && 'dateTo' in filters ? filters.dateTo : dateTo;
    try {
      const data = await leadService.listLeads({
        month: month || undefined,
        dateFrom: from || undefined,
        dateTo: to || undefined,
      });
      const next = Array.isArray(data) ? data : [];
      setLeads(next);
      setSelectedLeadIds((prev) => {
        if (!keepSelection) return new Set();
        const valid = new Set(next.map((l) => l.id));
        return new Set(Array.from(prev).filter((id) => valid.has(id)));
      });
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [monthFilter, dateFrom, dateTo]);

  useEffect(() => {
    load();
    loadAssignees();
  }, [loadAssignees]);

  const handleRefresh = () => {
    load({ keepSelection: true });
    loadAssignees();
  };

  const handleDownloadCsv = async () => {
    setExporting(true);
    setActionMsg('');
    try {
      const blob = await leadService.downloadLeadsCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rfincare-product-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setActionMsg('CSV downloaded successfully.');
    } catch (err) {
      setActionMsg(err?.response?.data?.error || err?.message || 'Could not download CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleAssign = async (leadId, assignedTo) => {
    if (!assignedTo) return;
    try {
      await leadService.assignLead(leadId, assignedTo);
      setActionMsg('Lead assigned successfully.');
      load({ keepSelection: true });
    } catch (err) {
      setActionMsg(err?.response?.data?.error || 'Assign failed');
    }
  };

  const handleResumeLink = async (lead, { sendNotification = false } = {}) => {
    setResumeBusyId(lead.id);
    setActionMsg('');
    setLastResumeUrl('');
    try {
      const data = await leadService.createLeadResumeLink(lead.id, {
        frontendOrigin: window.location.origin,
        sendNotification,
        channel: 'email',
      });
      const url = data?.url || data?.resumeUrl;
      if (!url) {
        setActionMsg('Resume link was created but no URL was returned. Try again.');
        return;
      }

      setLastResumeUrl(url);
      const copied = await copyTextToClipboard(url);

      if (sendNotification) {
        setActionMsg(
          copied
            ? `Resume link emailed to ${lead.email} and copied to clipboard.`
            : `Resume link emailed to ${lead.email}. Copy it from the box below.`,
        );
      } else if (copied) {
        setActionMsg('Resume link copied to clipboard.');
      } else {
        setActionMsg('Select the link below and copy it (Ctrl+C / Cmd+C).');
      }

      if (!lead.sessionKey) {
        load({ keepSelection: true });
      }
    } catch (err) {
      setActionMsg(err?.response?.data?.error || err?.message || 'Could not create resume link');
    } finally {
      setResumeBusyId(null);
    }
  };

  const staffCount = employees.length + agents.length;
  const selectedCount = selectedLeadIds.size;

  /** KPI cards must use the same list as the table (not loan_applications). */
  const leadStats = useMemo(() => {
    const total = leads.length;
    let unassigned = 0;
    let assigned = 0;
    let inProgress = 0;
    for (const lead of leads) {
      if (lead.assignedTo) assigned += 1;
      else unassigned += 1;
      const status = String(lead.status || '').toLowerCase();
      if (
        status.includes('progress')
        || status === 'contacted'
        || status === 'verified'
        || status === 'profile_complete'
      ) {
        inProgress += 1;
      }
    }
    return { total, unassigned, assigned, inProgress };
  }, [leads]);

  const leadStatCards = [
    {
      title: 'Total leads',
      value: leadStats.total,
      icon: 'Users',
      iconBg: 'bg-[var(--color-brand-green-dark)]',
    },
    {
      title: 'Unassigned',
      value: leadStats.unassigned,
      icon: 'UserMinus',
      iconBg: 'bg-gradient-to-br from-warning to-orange-500',
    },
    {
      title: 'Assigned',
      value: leadStats.assigned,
      icon: 'UserCheck',
      iconBg: 'bg-gradient-to-br from-agent-primary to-pink-600',
    },
    {
      title: 'In progress',
      value: leadStats.inProgress,
      icon: 'Clock',
      iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    },
  ];

  const handleApplyFilters = () => {
    setActionMsg('');
    load({
      filters: { month: monthFilter, dateFrom, dateTo },
    });
  };

  const handleResetFilters = () => {
    setMonthFilter('');
    setDateFrom('');
    setDateTo('');
    setActionMsg('');
    load({ filters: { month: '', dateFrom: '', dateTo: '' } });
  };

  const toggleLeadSelection = (leadId, checked) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(leadId);
      else next.delete(leadId);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedLeadIds((prev) => {
      if (leads.length > 0 && prev.size === leads.length) return new Set();
      return new Set(leads.map((l) => l.id));
    });
  };

  const handleDeleteLead = async (lead) => {
    if (!lead?.id) return;
    const ok = window.confirm(
      `Delete lead "${lead.fullName || lead.email || lead.id}"?\n\nThis will permanently remove it from the system.`,
    );
    if (!ok) return;
    setDeletingLeadId(lead.id);
    setActionMsg('');
    try {
      await leadService.deleteLead(lead.id);
      setActionMsg('Lead deleted successfully.');
      await load({ keepSelection: true });
    } catch (err) {
      setActionMsg(err?.response?.data?.error || err?.message || 'Could not delete lead');
    } finally {
      setDeletingLeadId(null);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedLeadIds);
    if (!ids.length) return;
    const ok = window.confirm(
      `Delete ${ids.length} selected lead(s)?\n\nThis action is permanent.`,
    );
    if (!ok) return;
    setBulkDeleting(true);
    setActionMsg('');
    try {
      const res = await leadService.bulkDeleteLeads(ids);
      const count = Number(res?.deletedCount || 0);
      setActionMsg(`${count} lead(s) deleted successfully.`);
      await load();
    } catch (err) {
      setActionMsg(err?.response?.data?.error || err?.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  if (loading && leads.length === 0) {
    return <p className="text-muted-foreground p-6">Loading leads…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Marketing leads</h2>
          <p className="text-sm text-muted-foreground">
            Eligibility OTP leads, agent portal submissions, and abandoned application drafts
          </p>
          {!assigneesLoading && staffCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {employees.length} employee(s), {agents.length} agent(s) available to assign
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Button
              variant="outline"
              iconName="Trash2"
              className="text-destructive hover:text-destructive"
              loading={bulkDeleting}
              onClick={handleBulkDelete}
            >
              Delete selected ({selectedCount})
            </Button>
          )}
          <Button
            variant="outline"
            iconName="Download"
            loading={exporting}
            onClick={handleDownloadCsv}
          >
            Download CSV
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {leadStatCards.map((stat) => (
          <div key={stat.title} className="rf-kpi-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                <Icon name={stat.icon} size={22} color="white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Month wise</label>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">From date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">To date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={handleApplyFilters}>
            Apply filters
          </Button>
          <Button variant="outline" onClick={handleResetFilters}>
            Reset
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {leads.length} lead(s) found
          {(monthFilter || dateFrom || dateTo) && leads.length === 0
            ? ' — try Reset to clear date filters'
            : ''}
        </span>
        <button type="button" className="underline" onClick={toggleSelectAllVisible}>
          {leads.length > 0 && selectedLeadIds.size === leads.length
            ? 'Clear selection'
            : 'Select all visible'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
      )}
      {assigneesError && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {assigneesError} — redeploy backend and ensure employees/agents are created in Admin.
        </div>
      )}
      {actionMsg && (
        <div className="p-3 bg-primary/10 text-primary rounded-lg text-sm space-y-2">
          <p>{actionMsg}</p>
          {lastResumeUrl && (
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                type="text"
                readOnly
                value={lastResumeUrl}
                className="flex-1 text-xs font-mono bg-background border border-border rounded px-2 py-1.5 text-foreground"
                onFocus={(e) => e.target.select()}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={async () => {
                  const ok = await copyTextToClipboard(lastResumeUrl);
                  setActionMsg(ok ? 'Link copied to clipboard.' : 'Could not copy — select the field and use Ctrl+C.');
                }}
              >
                Copy again
              </Button>
            </div>
          )}
        </div>
      )}

      <LeadsTable
        leads={leads}
        loading={loading}
        showSelection
        selectedLeadIds={selectedLeadIds}
        showAssign
        showActions
        canDeleteLead
        assigneesLoading={assigneesLoading}
        staffCount={staffCount}
        employees={employees}
        agents={agents}
        resumeBusyId={resumeBusyId}
        deletingLeadId={deletingLeadId}
        onToggleLeadSelection={toggleLeadSelection}
        onAssign={handleAssign}
        onResumeLink={handleResumeLink}
        onDeleteLead={handleDeleteLead}
      />
    </div>
  );
};

export default LeadsTab;
