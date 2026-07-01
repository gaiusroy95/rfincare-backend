import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AgentPerformanceChart = ({ data = [] }) => {
  const chartData = data?.length
    ? data.map((d) => ({
        name: d.name?.split(' ')?.[0] || d.name,
        conversions: d.conversions,
        clients: d.clients,
      }))
    : [{ name: '—', conversions: 0, clients: 0 }];

  return (
    <div className="w-full h-80" aria-label="Agent Performance Chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
          <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend />
          <Bar dataKey="conversions" fill="var(--color-agent-primary)" name="Approvals" />
          <Bar dataKey="clients" fill="var(--color-customer-primary)" name="Applications" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgentPerformanceChart;
