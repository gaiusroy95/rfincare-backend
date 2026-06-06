import { apiClient } from '../lib/apiClient';

const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

export function mapCatalogRow(row) {
  const r = toCamelCase(row);
  return {
    id: r.id,
    slug: r.slug,
    apiKey: r.apiKey,
    label: r.label,
    shortLabel: r.shortLabel || r.label?.split(' ')?.[0],
    icon: r.icon || 'Wallet',
    description: r.description || '',
    interestRateMin: r.interestRateMin,
    interestRateMax: r.interestRateMax,
    interestRange:
      r.interestRange ||
      (r.interestRateMin != null && r.interestRateMax != null
        ? `${r.interestRateMin}% - ${r.interestRateMax}%`
        : ''),
    features: Array.isArray(r.features) ? r.features : [],
    color: r.color || 'var(--color-primary)',
    sortOrder: r.sortOrder ?? 0,
    isActive: r.isActive !== false,
    categoryId: r.categoryId || null,
    categoryLabel: r.categoryLabel || null,
    categorySlug: r.categorySlug || null,
    bankId: r.bankId || null,
    bankName: r.bankName || null,
    bankProductId: r.bankProductId || null,
  };
}

export function mapCategoryRow(row) {
  const r = toCamelCase(row);
  return {
    id: r.id,
    slug: r.slug,
    label: r.label,
    parentLoanType: r.parentLoanType,
    sortOrder: r.sortOrder ?? 0,
    isActive: r.isActive !== false,
  };
}

export const loanProductCatalogService = {
  async listPublic() {
    try {
      const res = await apiClient.get('/loan-products');
      const list = Array.isArray(res.data) ? res.data.map(mapCatalogRow) : [];
      return { data: list, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error?.response?.data?.error || 'Failed to load products' },
      };
    }
  },

  async listAll() {
    try {
      const res = await apiClient.get('/loan-products/all');
      const list = Array.isArray(res.data) ? res.data.map(mapCatalogRow) : [];
      return { data: list, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error?.response?.data?.error || 'Failed to load products' },
      };
    }
  },

  async create(payload) {
    try {
      const res = await apiClient.post('/loan-products', payload);
      return { data: mapCatalogRow(res.data), error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error?.response?.data?.error || 'Failed to create product' },
      };
    }
  },

  async update(id, payload) {
    try {
      const res = await apiClient.patch(`/loan-products/${id}`, payload);
      return { data: mapCatalogRow(res.data), error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error?.response?.data?.error || 'Failed to update product' },
      };
    }
  },

  async listCategories() {
    try {
      const res = await apiClient.get('/loan-products/categories');
      const list = Array.isArray(res.data) ? res.data.map(mapCategoryRow) : [];
      return { data: list, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error?.response?.data?.error || 'Failed to load categories' },
      };
    }
  },

  async createCategory(payload) {
    try {
      const res = await apiClient.post('/loan-products/categories', payload);
      return { data: mapCategoryRow(res.data), error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error?.response?.data?.error || 'Failed to create category' },
      };
    }
  },

  async remove(id) {
    try {
      await apiClient.delete(`/loan-products/${id}`);
      return { error: null };
    } catch (error) {
      return {
        error: { message: error?.response?.data?.error || 'Failed to delete product' },
      };
    }
  },
};
