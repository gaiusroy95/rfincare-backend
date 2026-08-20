import React, { useMemo, useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

/**
 * My Customers — applications submitted/owned by the agent, plus pipeline leads
 * that do not yet have an application.
 */
const AgentCustomersList = ({ applications = [], leads = [], onOpen, onStartApplication }) => {
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const appRows = (Array.isArray(applications) ? applications : []).map((app) => ({
      ...app,
      kind: 'application',
      sortAt: app.updatedAt || app.submittedAt || app.createdAt || null,
    }));
    const appIds = new Set(appRows.map((a) => a.id));
    const leadRows = (Array.isArray(leads) ? leads : [])
      .filter((lead) => !lead.applicationId || !appIds.has(lead.applicationId))
      .map((lead) => ({
        ...lead,
        kind: 'lead',
        sortAt: lead.followUpAt || lead.createdAt || null,
      }));

    const merged = [...appRows, ...leadRows].sort(
      (a, b) => new Date(b.sortAt || 0).getTime() - new Date(a.sortAt || 0).getTime(),
    );

    const q = query.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter((row) => {
      const hay = [row.name, row.email, row.phone, row.loanType, row.applicationNumber, row.rawStatus]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [applications, leads, query]);

  if (!applications?.length && !leads?.length) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Icon name="Users" size={40} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No customers yet.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Submit a customer application or accept an assigned lead to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 md:p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length} client{rows.length === 1 ? '' : 's'}
        </p>
        <div className="relative w-full sm:w-72">
          <Icon
            name="Search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, product…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground p-6 text-center">No matches for “{query}”.</p>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((client) => (
            <div
              key={`${client.kind}-${client.id}`}
              className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30"
            >
              <button
                type="button"
                className="text-left min-w-0 flex-1"
                onClick={() => onOpen?.(client)}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground truncate">{client.name}</p>
                  {client.kind === 'lead' && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                      Lead
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {client.loanType || 'Loan application'}
                  {client.applicationNumber ? ` · ${client.applicationNumber}` : ''}
                </p>
                {(client.email || client.phone) && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {[client.email, client.phone].filter(Boolean).join(' · ')}
                  </p>
                )}
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                  {String(client.rawStatus || client.status || '')
                    .replace(/_/g, ' ')
                    .replace(/-/g, ' ')}
                </span>
                {client.kind === 'lead' && !client.applicationId && onStartApplication && (
                  <Button
                    size="sm"
                    className="rf-btn-primary"
                    iconName="FileText"
                    onClick={() => onStartApplication(client)}
                  >
                    Apply
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onOpen?.(client)}>
                  Open
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentCustomersList;
