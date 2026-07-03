import React from 'react';
import Button from '../ui/Button';

export const formatProductType = (value) =>
  value
    ? String(value)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
    : '—';

const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

const LeadsTable = ({
  leads = [],
  loading = false,
  showAssign = false,
  showActions = false,
  showStatusUpdate = false,
  assigneesLoading = false,
  staffCount = 0,
  employees = [],
  agents = [],
  resumeBusyId = null,
  onAssign,
  onResumeLink,
  onStatusChange,
  renderAssignSelect,
}) => {
  if (loading && leads.length === 0) {
    return <p className="text-muted-foreground p-6">Loading leads…</p>;
  }

  const colSpan = 5 + (showAssign ? 1 : 0) + (showActions ? 1 : 0) + (showStatusUpdate ? 1 : 0);

  const defaultAssignSelect = (lead) => (
    <select
      className="w-full border border-border rounded-md px-2 py-1.5 text-sm bg-background min-w-[220px]"
      value={lead.assignedTo || ''}
      disabled={assigneesLoading || staffCount === 0}
      onChange={(e) => onAssign?.(lead.id, e.target.value)}
    >
      <option value="">
        {assigneesLoading
          ? 'Loading staff…'
          : staffCount === 0
            ? 'No employees/agents — create staff first'
            : 'Assign to…'}
      </option>
      {employees.length > 0 && (
        <optgroup label="Employees">
          {employees.map((person) => (
            <option key={person.id} value={person.id}>
              {person.label}
            </option>
          ))}
        </optgroup>
      )}
      {agents.length > 0 && (
        <optgroup label="Agents">
          {agents.map((person) => (
            <option key={person.id} value={person.id}>
              {person.label}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Contact</th>
            <th className="text-left p-3">Product type</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Score</th>
            {showAssign ? <th className="text-left p-3">Assign</th> : null}
            {showStatusUpdate ? <th className="text-left p-3">Update status</th> : null}
            {showActions ? <th className="text-left p-3">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="p-8 text-center text-muted-foreground">
                No leads yet.
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead.id} className="border-t border-border align-top">
                <td className="p-3">{lead.fullName || '—'}</td>
                <td className="p-3">
                  <div>{lead.email}</div>
                  <div className="text-muted-foreground">{lead.phone}</div>
                  {lead.sourcedAgentCode ? (
                    <div className="text-xs text-muted-foreground mt-1">Agent: {lead.sourcedAgentCode}</div>
                  ) : null}
                </td>
                <td className="p-3">{formatProductType(lead.loanType)}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                    {lead.status}
                  </span>
                </td>
                <td className="p-3">{lead.eligibilityScore ?? '—'}</td>
                {showAssign ? (
                  <td className="p-3 min-w-[240px]">
                    {(renderAssignSelect || defaultAssignSelect)(lead)}
                    {lead.assignedTo && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Assigned:{' '}
                        <span className="font-medium text-foreground">
                          {lead.assignedToCode && lead.assignedToName
                            ? `${lead.assignedToCode} — ${lead.assignedToName}`
                            : lead.assignedToName || lead.assignedToCode || 'Staff member'}
                        </span>
                        {lead.assignedToRole && (
                          <span className="text-muted-foreground"> ({lead.assignedToRole})</span>
                        )}
                      </p>
                    )}
                  </td>
                ) : null}
                {showStatusUpdate ? (
                  <td className="p-3 min-w-[160px]">
                    <select
                      className="w-full border border-border rounded-md px-2 py-1.5 text-sm bg-background"
                      value={lead.status || ''}
                      onChange={(e) => onStatusChange?.(lead.id, e.target.value)}
                    >
                      <option value={lead.status}>{lead.status}</option>
                      {EMPLOYEE_STATUS_OPTIONS.filter((o) => o.value !== lead.status).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                ) : null}
                {showActions ? (
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        loading={resumeBusyId === lead.id}
                        onClick={() => onResumeLink?.(lead, { sendNotification: false })}
                      >
                        Copy resume link
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={resumeBusyId === lead.id}
                        disabled={!lead.email}
                        onClick={() => onResumeLink?.(lead, { sendNotification: true })}
                      >
                        Email resume link
                      </Button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;
