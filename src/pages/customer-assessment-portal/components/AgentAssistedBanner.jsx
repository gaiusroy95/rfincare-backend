import React from 'react';
import Icon from '../../../components/AppIcon';

const AgentAssistedBanner = ({ agentCode, agentName }) => (
  <div className="mb-6 p-4 md:p-5 rounded-lg border-2 border-agent-primary/30 bg-gradient-to-r from-agent-primary/10 to-pink-500/5">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-agent-primary/15 flex items-center justify-center shrink-0">
          <Icon name="UserCheck" size={22} className="text-agent-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Agent-assisted application</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You are submitting on behalf of a customer. This application will be tracked under your agent code
            for commission reporting.
          </p>
        </div>
      </div>
      <div className="sm:text-right shrink-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Your agent code</p>
        <p className="text-lg font-bold text-agent-primary font-mono">{agentCode || '—'}</p>
        {agentName && <p className="text-xs text-muted-foreground">{agentName}</p>}
      </div>
    </div>
  </div>
);

export default AgentAssistedBanner;
