import React, { useState, useEffect, useCallback } from 'react';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { reportsService } from '../../services/reportsService';
import { formatReportRangeLabel, rangeFromPreset } from '../../utils/reportDateRange';

import ReportCard from './components/ReportCard';
import MetricCard from './components/MetricCard';
import ChartContainer from './components/ChartContainer';
import FilterPanel from './components/FilterPanel';
import ApplicationVolumeChart from './components/ApplicationVolumeChart';
import AgentPerformanceChart from './components/AgentPerformanceChart';
import AgentPayoutReportTable from './components/AgentPayoutReportTable';
import AgentPerformanceReportTable from './components/AgentPerformanceReportTable';
import RevenueDistributionChart from './components/RevenueDistributionChart';
import FinancialSummaryReportTable from './components/FinancialSummaryReportTable';
import BankPartnershipReportTable from './components/BankPartnershipReportTable';
import MasterReportPanel from './components/MasterReportPanel';
import ScheduleReportModal from './components/ScheduleReportModal';
import ExportModal from './components/ExportModal';

const REPORT_ICONS = {
  application_volume: 'BarChart3',
  agent_performance: 'TrendingUp',
  financial_summary: 'IndianRupee',
  compliance_audit: 'Shield',
  customer_analytics: 'Users',
  bank_partnership: 'Building2',
  master: 'FileArchive',
};

const ReportsAndAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [reports, setReports] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [agentPerformanceRows, setAgentPerformanceRows] = useState([]);
  const [agentPayoutRows, setAgentPayoutRows] = useState([]);
  const [agentPayoutLoading, setAgentPayoutLoading] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [financialSummaryRows, setFinancialSummaryRows] = useState([]);
  const [bankPartnershipRows, setBankPartnershipRows] = useState([]);
  const [masterReport, setMasterReport] = useState(null);
  const [masterDownloading, setMasterDownloading] = useState(false);
  const [filters, setFilters] = useState(() => {
    const { startDate, endDate } = rangeFromPreset('last30days');
    return {
      dateRange: 'last30days',
      reportType: 'all',
      status: 'all',
      startDate,
      endDate,
    };
  });
  const [exportNotice, setExportNotice] = useState('');
  const [exportingKey, setExportingKey] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setAgentPayoutLoading(true);
    setError('');
    try {
      const [
        overview,
        volume,
        agents,
        revenue,
        catalog,
        performanceReport,
        payoutReport,
        financialReport,
        bankPartnershipReport,
        masterData,
      ] = await Promise.all([
        reportsService.getOverview(filters),
        reportsService.getApplicationVolumeChart(),
        reportsService.getAgentPerformanceChart(),
        reportsService.getRevenueDistributionChart(),
        reportsService.getCatalog(),
        reportsService.generateReport('agent_performance', filters).catch(() => ({ rows: [] })),
        reportsService.generateReport('agent_payout_accounts', filters).catch(() => ({ rows: [] })),
        reportsService.generateReport('financial_summary', filters).catch(() => ({ rows: [] })),
        reportsService.generateReport('bank_partnership', filters).catch(() => ({ rows: [] })),
        reportsService.generateMasterReport(filters).catch(() => ({ sections: [] })),
      ]);
      setMetrics(overview?.metrics || []);
      setVolumeData(volume || []);
      setAgentData(agents || []);
      setRevenueData(revenue || []);
      setAgentPerformanceRows(performanceReport?.rows || []);
      setAgentPayoutRows(payoutReport?.rows || []);
      setFinancialSummaryRows(financialReport?.rows || []);
      setBankPartnershipRows(bankPartnershipReport?.rows || []);
      setMasterReport(masterData?.sections?.length ? masterData : null);
      setReports(
        (catalog || []).map((r) => ({
          ...r,
          icon: REPORT_ICONS[r.key] || 'FileText',
          lastGenerated: r.lastGenerated
            ? new Date(r.lastGenerated).toLocaleString()
            : 'Never',
        })),
      );
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
      setAgentPayoutLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'reports', label: 'Reports', icon: 'FileText' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'scheduled', label: 'Scheduled', icon: 'Calendar' },
  ];

  const handleFilterChange = (key, value) => {
    if (key === 'batch' && value && typeof value === 'object') {
      setFilters((prev) => ({ ...prev, ...value }));
      return;
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    if (!filters.startDate || !filters.endDate) {
      alert('Please choose both From and To dates.');
      return;
    }
    if (filters.startDate > filters.endDate) {
      alert('From date must be on or before To date.');
      return;
    }
    loadDashboard();
  };

  const handleResetFilters = () => {
    const { startDate, endDate } = rangeFromPreset('last30days');
    setFilters({
      dateRange: 'last30days',
      reportType: 'all',
      status: 'all',
      startDate,
      endDate,
    });
  };

  const filterPeriodLabel =
    formatReportRangeLabel(filters.startDate, filters.endDate) || filters.dateRange;

  const runReport = async (report) => {
    const key = report?.key || report?.id;
    if (!key) return null;
    return reportsService.generateReport(key, filters);
  };

  const downloadReportCsv = async (
    reportKey,
    { fileName, refreshPayout, refreshPerformance, refreshFinancial, refreshBankPartnership } = {},
  ) => {
    setExportingKey(reportKey);
    setExportNotice('');
    try {
      const data = await reportsService.generateReport(reportKey, filters);
      if (refreshPerformance || reportKey === 'agent_performance') {
        setAgentPerformanceRows(data?.rows || []);
      }
      if (refreshPayout || reportKey === 'agent_payout_accounts') {
        setAgentPayoutRows(data?.rows || []);
      }
      if (refreshFinancial || reportKey === 'financial_summary') {
        setFinancialSummaryRows(data?.rows || []);
      }
      if (refreshBankPartnership || reportKey === 'bank_partnership') {
        setBankPartnershipRows(data?.rows || []);
      }
      reportsService.downloadCsv(fileName || reportKey, data);
      const count = data?.rows?.length ?? 0;
      setExportNotice(`Downloaded ${fileName || reportKey}.csv (${count} row${count === 1 ? '' : 's'}).`);
      return data;
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || err?.message || 'Export failed';
      if (status === 401 || /jwt expired/i.test(String(msg))) {
        alert('Session expired. Please login again, then export.');
        window.location.href = '/authentication-management-center';
        return null;
      }
      setExportNotice(msg);
      alert(msg);
      return null;
    } finally {
      setExportingKey(null);
    }
  };

  const exportLoanTypeDistribution = async () => {
    setExportingKey('loan_type_distribution');
    setExportNotice('');
    try {
      if (revenueData?.length) {
        reportsService.downloadCsv('loan_type_distribution', {
          columns: ['loan_type', 'count'],
          rows: revenueData.map((d) => ({
            loan_type: d.name,
            count: d.value,
          })),
        });
        setExportNotice(`Downloaded loan type distribution (${revenueData.length} types).`);
        return;
      }
      await downloadReportCsv('financial_summary', { fileName: 'loan_type_distribution' });
    } catch (err) {
      const msg = err?.message || 'Export failed';
      setExportNotice(msg);
      alert(msg);
    } finally {
      setExportingKey(null);
    }
  };

  const handleDownloadMaster = async (combinedOnly = false) => {
    setMasterDownloading(true);
    setExportNotice('');
    try {
      const data = masterReport || (await reportsService.generateMasterReport(filters));
      if (!masterReport) setMasterReport(data);
      reportsService.downloadMasterReport(data, { includeIndividualFiles: !combinedOnly });
      const total = data?.summary?.totalRows ?? 0;
      setExportNotice(
        combinedOnly
          ? `Master report downloaded (1 combined CSV, ${total} rows across sections).`
          : `Master report downloaded: 1 combined CSV plus ${data?.sections?.length || 0} section files (${total} rows).`,
      );
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Master report download failed';
      setExportNotice(msg);
      alert(msg);
    } finally {
      setMasterDownloading(false);
    }
  };

  const handleGenerateReport = async (report) => {
    if (report.key === 'master') {
      await handleDownloadMaster(false);
      return;
    }
    const data = await downloadReportCsv(report.key, {
      refreshPayout: report.key === 'agent_payout_accounts',
      refreshPerformance: report.key === 'agent_performance',
      refreshFinancial: report.key === 'financial_summary',
      refreshBankPartnership: report.key === 'bank_partnership',
    });
    if (data) loadDashboard();
  };

  const handleScheduleReport = (report) => {
    setSelectedReport(report);
    setShowScheduleModal(true);
  };

  const handleExportReport = (report) => {
    setSelectedReport(report);
    setShowExportModal(true);
  };

  const handleScheduleSubmit = async (scheduleData) => {
    try {
      await reportsService.createSchedule({
        reportKey: selectedReport.key,
        reportName: selectedReport.name,
        frequency: scheduleData.frequency,
        format: scheduleData.format,
        recipients: scheduleData.recipients,
        filters,
      });
      alert('Report scheduled successfully.');
      setShowScheduleModal(false);
      loadDashboard();
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || 'Schedule failed');
    }
  };

  const handleExportSubmit = async () => {
    if (selectedReport?.key === 'master') {
      await handleDownloadMaster(false);
      setShowExportModal(false);
      return;
    }
    const data = await downloadReportCsv(selectedReport.key, {
      refreshPayout: selectedReport.key === 'agent_payout_accounts',
      refreshPerformance: selectedReport.key === 'agent_performance',
      refreshFinancial: selectedReport.key === 'financial_summary',
      refreshBankPartnership: selectedReport.key === 'bank_partnership',
    });
    if (data) setShowExportModal(false);
  };

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Reports & Analytics
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Live data from your loan platform
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="default"
                iconName="Download"
                loading={masterDownloading}
                onClick={() => handleDownloadMaster(false)}
              >
                Download master report
              </Button>
              <Button variant="outline" iconName="RefreshCw" onClick={loadDashboard} loading={loading}>
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <p className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              {error}
            </p>
          )}
          {exportNotice && (
            <p
              className={`mb-4 text-sm rounded-lg p-3 ${
                exportNotice.toLowerCase().includes('fail') || exportNotice.includes('Insufficient')
                  ? 'text-destructive bg-destructive/10 border border-destructive/20'
                  : 'text-green-800 bg-green-50 border border-green-200'
              }`}
            >
              {exportNotice}
            </p>
          )}

          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide border-b border-border">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                type="button"
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab?.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            <MasterReportPanel
              masterData={masterReport}
              loading={loading}
              downloading={masterDownloading}
              dateLabel={filterPeriodLabel}
              onDownload={() => handleDownloadMaster(false)}
              onDownloadCombinedOnly={() => handleDownloadMaster(true)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {(metrics?.length ? metrics : [{ id: 'load', label: 'Loading…', value: '—' }])?.map((metric) => (
                <MetricCard key={metric?.id} metric={metric} />
              ))}
            </div>

            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <ChartContainer
                title="Application Volume Trends"
                subtitle="Monthly application submissions and outcomes"
                icon="BarChart3"
                exporting={exportingKey === 'application_volume'}
                onExport={() => downloadReportCsv('application_volume')}
              >
                <ApplicationVolumeChart data={volumeData} />
              </ChartContainer>

              <ChartContainer
                title="Agent Performance Metrics"
                subtitle="Applications and approvals by agent"
                icon="TrendingUp"
                exporting={exportingKey === 'agent_performance'}
                onExport={() => downloadReportCsv('agent_performance')}
              >
                <AgentPerformanceChart data={agentData} />
              </ChartContainer>
            </div>

            <ChartContainer
              title="Agent performance detail"
              subtitle="Applications by agent with payout and document stages"
              icon="Table2"
              exporting={exportingKey === 'agent_performance'}
              onExport={() => downloadReportCsv('agent_performance')}
            >
              <AgentPerformanceReportTable
                rows={agentPerformanceRows}
                loading={loading || agentPayoutLoading}
                dateLabel={filterPeriodLabel}
              />
            </ChartContainer>

            <ChartContainer
              title="Applications by loan type"
              subtitle="Distribution"
              icon="PieChart"
              exporting={exportingKey === 'loan_type_distribution'}
              onExport={exportLoanTypeDistribution}
            >
              <RevenueDistributionChart data={revenueData} />
            </ChartContainer>

            <ChartContainer
              title="Financial summary"
              subtitle="By bank and loan type — cases, amounts, commission & ratios"
              icon="IndianRupee"
              exporting={exportingKey === 'financial_summary'}
              onExport={() => downloadReportCsv('financial_summary', { refreshFinancial: true })}
            >
              <FinancialSummaryReportTable
                rows={financialSummaryRows}
                loading={loading || agentPayoutLoading}
                dateLabel={filterPeriodLabel}
              />
            </ChartContainer>

            <ChartContainer
              title="Bank partnership report"
              subtitle="Per-bank submissions, approvals, disbursements & commission"
              icon="Building2"
              exporting={exportingKey === 'bank_partnership'}
              onExport={() => downloadReportCsv('bank_partnership', { refreshBankPartnership: true })}
            >
              <BankPartnershipReportTable
                rows={bankPartnershipRows}
                loading={loading || agentPayoutLoading}
                dateLabel={filterPeriodLabel}
              />
            </ChartContainer>

            <ChartContainer
              title="Agent commission payout accounts"
              subtitle="Bank details updated by agents for commission transfers"
              icon="Landmark"
              exporting={exportingKey === 'agent_payout_accounts'}
              onExport={() =>
                downloadReportCsv('agent_payout_accounts', { refreshPayout: true })
              }
            >
              <AgentPayoutReportTable
                rows={agentPayoutRows}
                loading={loading || agentPayoutLoading}
                dateLabel={filterPeriodLabel}
              />
            </ChartContainer>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />

            <MasterReportPanel
              masterData={masterReport}
              loading={agentPayoutLoading}
              downloading={masterDownloading}
              dateLabel={filterPeriodLabel}
              onDownload={() => handleDownloadMaster(false)}
              onDownloadCombinedOnly={() => handleDownloadMaster(true)}
            />

            <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-8">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Bank partnership report</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Partnership banks with case volumes and commission for the selected period.
                </p>
                <BankPartnershipReportTable
                  rows={bankPartnershipRows}
                  loading={agentPayoutLoading}
                  dateLabel={filterPeriodLabel}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Financial summary</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Bank-wise loan metrics for the selected period (export via Financial Summary
                  report card).
                </p>
                <FinancialSummaryReportTable
                  rows={financialSummaryRows}
                  loading={agentPayoutLoading}
                  dateLabel={filterPeriodLabel}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Agent performance detail</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Per-application rows for the selected date range (export via Agent Performance
                  report card).
                </p>
                <AgentPerformanceReportTable
                  rows={agentPerformanceRows}
                  loading={agentPayoutLoading}
                  dateLabel={filterPeriodLabel}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">
                  Agent commission payout accounts
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Commission bank details from agent profile settings (OTP-verified updates).
                </p>
                <AgentPayoutReportTable
                  rows={agentPayoutRows}
                  loading={agentPayoutLoading}
                  dateLabel={filterPeriodLabel}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {reports?.map((report) => (
                <ReportCard
                  key={report.key}
                  report={report}
                  onGenerate={handleGenerateReport}
                  onSchedule={handleScheduleReport}
                  onExport={handleExportReport}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {metrics?.map((metric) => (
                <MetricCard key={metric?.id} metric={metric} />
              ))}
            </div>
            <ApplicationVolumeChart data={volumeData} />
            <AgentPerformanceChart data={agentData} />
            <RevenueDistributionChart data={revenueData} />
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-card border border-border rounded-lg p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {reports?.filter((r) => r?.isScheduled)?.map((report) => (
                  <ReportCard
                    key={report.key}
                    report={report}
                    onGenerate={handleGenerateReport}
                    onSchedule={handleScheduleReport}
                    onExport={handleExportReport}
                  />
                ))}
              </div>
              {!reports?.some((r) => r.isScheduled) && (
                <p className="text-center text-muted-foreground py-8">
                  No scheduled reports yet. Use Schedule on any report card.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {showScheduleModal && selectedReport && (
        <ScheduleReportModal
          report={selectedReport}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleScheduleSubmit}
        />
      )}
      {showExportModal && selectedReport && (
        <ExportModal
          report={selectedReport}
          onClose={() => setShowExportModal(false)}
          onExport={handleExportSubmit}
        />
      )}
    </div>
  );
};

export default ReportsAndAnalytics;
