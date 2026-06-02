import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '../../../components/AppIcon';

const PerformanceChart = ({ performanceAnalytics, data, fallbackData }) => {
  const analytics = performanceAnalytics || null;
  const legacyData = data || fallbackData || [];
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('month');

  const chartData = useMemo(() => {
    if (analytics?.[timeRange]?.length) return analytics[timeRange];
    if (timeRange === 'month' && legacyData?.length) return legacyData;
    return analytics?.month || legacyData || [];
  }, [analytics, timeRange, legacyData]);

  const hasData = chartData.some(
    (row) => (row?.clients || 0) > 0 || (row?.conversions || 0) > 0 || (row?.earnings || 0) > 0,
  );

  const yMax = useMemo(() => {
    const peak = Math.max(
      0,
      ...chartData.map((row) =>
        Math.max(row?.clients || 0, row?.conversions || 0, row?.earnings || 0),
      ),
    );
    return Math.max(4, Math.ceil(peak * 1.15));
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <span className="text-xs text-muted-foreground">{entry?.name}:</span>
              <span className="text-sm font-bold" style={{ color: entry?.color }}>
                {entry?.name === 'Earnings'
                  ? `₹${Number(entry?.value || 0).toLocaleString('en-IN')}`
                  : entry?.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 space-y-3 md:space-y-0">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Performance Analytics</h2>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="TrendingUp" size={14} />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="BarChart3" size={14} />
            </button>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {!hasData ? (
        <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-lg bg-muted/30">
          <Icon name="BarChart3" size={32} className="text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">No performance data yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Add clients or submit applications — analytics update from your assigned and sourced
            applications.
          </p>
        </div>
      ) : (
        <div className="w-full h-64 md:h-80" aria-label="Performance Analytics Chart">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-muted-foreground)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  style={{ fontSize: '12px' }}
                  domain={[0, yMax]}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  name="Clients"
                  dot={{ fill: 'var(--color-primary)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  name="Conversions"
                  dot={{ fill: 'var(--color-success)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="var(--color-secondary)"
                  strokeWidth={2}
                  name="Earnings"
                  dot={{ fill: 'var(--color-secondary)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-muted-foreground)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  style={{ fontSize: '12px' }}
                  domain={[0, yMax]}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
                <Bar
                  dataKey="clients"
                  fill="var(--color-primary)"
                  name="Clients"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="conversions"
                  fill="var(--color-success)"
                  name="Conversions"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="earnings"
                  fill="var(--color-secondary)"
                  name="Earnings"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;
