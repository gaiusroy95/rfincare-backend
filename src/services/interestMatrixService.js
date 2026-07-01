import { apiClient } from '../lib/apiClient';

export const interestMatrixService = {
  async list() {
    const res = await apiClient.get('/interest-matrix');
    return res.data;
  },

  async downloadCsv() {
    const res = await apiClient.get('/interest-matrix/export.csv', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interest-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  },

  async importCsv(csvText, replaceAll = true) {
    const res = await apiClient.post('/interest-matrix/import.csv', { csv: csvText, replaceAll });
    return res.data;
  },

  async create(row) {
    const res = await apiClient.post('/interest-matrix', row);
    return res.data;
  },

  async update(id, row) {
    const res = await apiClient.patch(`/interest-matrix/${id}`, row);
    return res.data;
  },

  async remove(id) {
    const res = await apiClient.delete(`/interest-matrix/${id}`);
    return res.data;
  },
};
