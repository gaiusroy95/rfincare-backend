import React, { useEffect, useState, useCallback } from 'react';
import { leadService } from '../../../services/leadService';
import { adminService } from '../../../services/adminService';
import Button from '../../../components/ui/Button';
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

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await leadService.listLeads();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadAssignees();
  }, [loadAssignees]);

  const handleRefresh = () => {
    load();
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
      load();
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
        load();
      }
    } catch (err) {
      setActionMsg(err?.response?.data?.error || err?.message || 'Could not create resume link');
    } finally {
      setResumeBusyId(null);
    }
  };

  const staffCount = employees.length + agents.length;

  if (loading && leads.length === 0) {
    return <p className="text-muted-foreground p-6">Loading leads…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Marketing leads</h2>
          <p className="text-sm text-muted-foreground">
            Eligibility OTP leads and abandoned application drafts
          </p>
          {!assigneesLoading && staffCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {employees.length} employee(s), {agents.length} agent(s) available to assign
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
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
        showAssign
        showActions
        assigneesLoading={assigneesLoading}
        staffCount={staffCount}
        employees={employees}
        agents={agents}
        resumeBusyId={resumeBusyId}
        onAssign={handleAssign}
        onResumeLink={handleResumeLink}
      />
    </div>
  );
};

export default LeadsTab;
