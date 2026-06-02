import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const DEFAULT_COLORS = [
  'var(--color-customer-primary)',
  'var(--color-agent-primary)',
  'var(--color-conversion)',
  'var(--color-admin-primary)',
  'var(--color-warning)',
];

const RevenueDistributionChart = ({ data = [] }) => {
  const chartData = data?.length
    ? data.map((d, i) => ({
        name: d.name,
        value: d.value,
        color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      }))
    : [{ name: 'No data', value: 1, color: 'var(--color-muted)' }];

  return (
    <div className="w-full h-80" aria-label="Revenue Distribution Pie Chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueDistributionChart;
