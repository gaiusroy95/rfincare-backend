import React, { useCallback, useEffect, useState } from 'react';
import { leadService } from '../../../services/leadService';
import Button from '../../../components/ui/Button';
import LeadsTable from '../../../components/leads/LeadsTable';

const EmployeeLeadsTab = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await leadService.listLeads({ assignedTo: 'me' });
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (leadId, status) => {
    setActionMsg('');
    try {
      await leadService.updateLeadStatus(leadId, status);
      setActionMsg('Lead status updated.');
      load();
    } catch (err) {
      setActionMsg(err?.response?.data?.error || 'Could not update status');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">My assigned leads</h2>
          <p className="text-sm text-muted-foreground">
            Product enquiries and eligibility leads assigned to you
          </p>
        </div>
        <Button variant="outline" onClick={load}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
      )}
      {actionMsg && (
        <div className="p-3 bg-primary/10 text-primary rounded-lg text-sm">{actionMsg}</div>
      )}

      <LeadsTable
        leads={leads}
        loading={loading}
        showStatusUpdate
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default EmployeeLeadsTab;
