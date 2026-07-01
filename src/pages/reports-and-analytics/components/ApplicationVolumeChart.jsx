import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ApplicationVolumeChart = ({ data = [] }) => {
  const chartData = data?.length
    ? data
    : [{ month: '—', submitted: 0, approved: 0, rejected: 0, pending: 0 }];

  return (
    <div className="w-full h-80" aria-label="Application Volume Bar Chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
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
          <Bar dataKey="submitted" fill="var(--color-primary)" name="Submitted" />
          <Bar dataKey="approved" fill="var(--color-conversion)" name="Approved" />
          <Bar dataKey="rejected" fill="var(--color-destructive)" name="Rejected" />
          <Bar dataKey="pending" fill="var(--color-warning)" name="Pending" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ApplicationVolumeChart;
