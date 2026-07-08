import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ClientKanbanBoard = ({ clients, onClientClick, onStatusChange, onStartApplication }) => {
  const [draggedClient, setDraggedClient] = useState(null);

  const columns = [
    { id: 'new', title: 'New Leads', color: 'blue', icon: 'UserPlus' },
    { id: 'in-progress', title: 'In Progress', color: 'amber', icon: 'Clock' },
    { id: 'documents', title: 'Documents Pending', color: 'purple', icon: 'FileText' },
    { id: 'submitted', title: 'Submitted', color: 'green', icon: 'CheckCircle' },
  ];

  const getColumnClients = (columnId) => clients?.filter((client) => client?.status === columnId);

  const handleDragStart = (e, client) => {
    if (client?.kind === 'lead') return;
    setDraggedClient(client);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, columnId) => {
    e?.preventDefault();
    if (draggedClient && draggedClient?.status !== columnId) {
      onStatusChange(draggedClient?.id, columnId);
    }
    setDraggedClient(null);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors?.[priority] || colors?.medium;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Client Pipeline</h2>
        <Button variant="outline" size="sm" iconName="Filter">
          Filter
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {columns?.map((column) => {
          const columnClients = getColumnClients(column?.id);
          return (
            <div
              key={column?.id}
              className="bg-muted rounded-lg p-3 md:p-4 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column?.id)}
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg bg-${column?.color}-100 flex items-center justify-center`}>
                    <Icon name={column?.icon} size={16} color={`var(--color-${column?.color}-600)`} />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-foreground">{column?.title}</h3>
                </div>
                <span className="text-xs font-semibold text-muted-foreground bg-background px-2 py-1 rounded-full">
                  {columnClients?.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnClients?.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No items yet</p>
                )}
                {columnClients?.map((client) => (
                  <div
                    key={`${client?.kind || 'item'}-${client?.id}`}
                    draggable={client?.kind !== 'lead'}
                    onDragStart={(e) => handleDragStart(e, client)}
                    className={`bg-card rounded-lg p-3 border border-border transition-all duration-200 ${
                      client?.kind === 'lead' ? 'cursor-pointer hover:shadow-md' : 'cursor-move hover:shadow-md'
                    }`}
                    onClick={() => onClientClick(client)}
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      <Image
                        src={client?.avatar}
                        alt={client?.avatarAlt}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-foreground truncate">{client?.name}</h4>
                          {client?.kind === 'lead' && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                              Lead
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{client?.loanType}</p>
                        {client?.email && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{client.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold text-foreground">{client?.amount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(client?.priority)}`}>
                          {client?.priority?.charAt(0)?.toUpperCase() + client?.priority?.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">{client?.daysActive}</span>
                      </div>
                    </div>

                    {client?.nextAction && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Icon name="AlertCircle" size={12} />
                          <span className="truncate">{client?.nextAction}</span>
                        </div>
                      </div>
                    )}

                    {client?.kind === 'lead' && !client?.applicationId && onStartApplication && (
                      <Button
                        size="sm"
                        className="w-full mt-3 rf-btn-primary"
                        iconName="FileText"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartApplication(client);
                        }}
                      >
                        Submit application
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientKanbanBoard;
