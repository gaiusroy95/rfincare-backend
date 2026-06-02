import { apiClient } from '../lib/apiClient';
import { buildCsvContent, sectionToCsvBlock, triggerCsvDownload } from '../utils/reportCsv';

function toParams(filters = {}) {
  const p = {};
  if (filters.startDate && filters.endDate) {
    p.startDate = filters.startDate;
    p.endDate = filters.endDate;
  } else if (filters.dateRange) {
    p.dateRange = filters.dateRange;
  }
  if (filters.status && filters.status !== 'all') p.status = filters.status;
  return p;
}

export const reportsService = {
  async getOverview(filters) {
    const res = await apiClient.get('/reports/overview', { params: toParams(filters) });
    return res.data;
  },

  async getApplicationVolumeChart() {
    const res = await apiClient.get('/reports/charts/application-volume');
    return res.data;
  },

  async getAgentPerformanceChart() {
    const res = await apiClient.get('/reports/charts/agent-performance');
    return res.data;
  },

  async getRevenueDistributionChart() {
    const res = await apiClient.get('/reports/charts/revenue-distribution');
    return res.data;
  },

  async getCatalog() {
    const res = await apiClient.get('/reports/catalog');
    return res.data;
  },

  async generateReport(reportKey, filters) {
    const res = await apiClient.get(`/reports/generate/${reportKey}`, { params: toParams(filters) });
    return res.data;
  },

  async generateMasterReport(filters) {
    const res = await apiClient.get('/reports/generate/master', { params: toParams(filters) });
    return res.data;
  },

  async getSchedules() {
    const res = await apiClient.get('/reports/schedules');
    return res.data;
  },

  async createSchedule(payload) {
    const res = await apiClient.post('/reports/schedules', payload);
    return res.data;
  },

  downloadCsv(reportKey, data) {
    const columns = data?.columns;
    const rows = Array.isArray(data?.rows) ? data.rows : [];
    if (!columns?.length) {
      throw new Error('Report has no columns to export');
    }
    triggerCsvDownload(`${reportKey}-${Date.now()}.csv`, buildCsvContent(columns, rows));
  },

  /** Combined CSV with all sections + optional per-section files. */
  downloadMasterReport(masterData, { includeIndividualFiles = true } = {}) {
    const sections = masterData?.sections || [];
    if (!sections.length) {
      throw new Error('Master report has no sections');
    }

    const stamp = Date.now();
    const summary = masterData?.summary || {};
    const intro = [
      'Rfincare Master Report',
      `Generated: ${masterData.generatedAt || new Date().toISOString()}`,
      `Period: ${summary.periodStart || ''} to ${summary.periodEnd || ''}`,
      `Sections: ${summary.sectionCount || sections.length}`,
      `Total data rows: ${summary.totalRows ?? sections.reduce((n, s) => n + (s.rowCount || 0), 0)}`,
      '',
    ].join('\r\n');

    const body = sections.map(sectionToCsvBlock).join('\r\n\r\n');
    triggerCsvDownload(`master-report-${stamp}.csv`, `\uFEFF${intro}\r\n${body}`);

    if (includeIndividualFiles) {
      sections.forEach((section, i) => {
        window.setTimeout(() => {
          triggerCsvDownload(
            `${section.key || `section-${i + 1}`}-${stamp}.csv`,
            buildCsvContent(section.columns, section.rows),
          );
        }, 300 * (i + 1));
      });
    }
  },
};
