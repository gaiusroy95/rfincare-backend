import axios from 'axios';

import { getApiBaseUrl } from './runtimeConfig';

const API_BASE_URL = getApiBaseUrl();
const API_TIMEOUT_MS = Number(import.meta.env?.VITE_API_TIMEOUT_MS || 90000);

const ACCESS_TOKEN_STORAGE_KEY = 'rfincare_access_token';

let accessToken = null;
let refreshingPromise = null;

function redirectToLoginByPath() {
  if (typeof window === 'undefined') return;
  const p = window.location.pathname || '';
  if (p.startsWith('/admin') || p.startsWith('/interest-matrix') || p.startsWith('/approval-matrix')) {
    window.location.assign('/admin-login');
    return;
  }
  if (p.startsWith('/employee')) {
    window.location.assign('/employee-login');
    return;
  }
  if (p.startsWith('/reports-and-analytics')) {
    window.location.assign('/login-page');
    return;
  }
  if (p.startsWith('/agent')) {
    window.location.assign('/agent-login');
    return;
  }
  window.location.assign('/customer-login');
}

try {
  if (typeof window !== 'undefined') {
    accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || null;
  }
} catch {
  accessToken = null;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // allow refresh cookie
  timeout: API_TIMEOUT_MS,
});

export function setAccessToken(token) {
  accessToken = token || null;
  try {
    if (typeof window !== 'undefined') {
      if (accessToken) {
        window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
      } else {
        window.sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      }
    }
  } catch {
    /* ignore storage errors */
  }
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    if (!original || original.__isRetry) throw error;
    if (status !== 401) throw error;
    if (original.skipAuthRefresh) throw error;

    if (original.url?.startsWith('/auth/')) throw error;

    if (!refreshingPromise) {
      refreshingPromise = apiClient
        .post('/auth/refresh')
        .then((r) => {
          setAccessToken(r?.data?.accessToken);
          return r?.data?.accessToken;
        })
        .finally(() => {
          refreshingPromise = null;
        });
    }

    try {
      await refreshingPromise;
    } catch (refreshErr) {
      setAccessToken(null);
      redirectToLoginByPath();
      throw refreshErr;
    }
    original.__isRetry = true;
    return apiClient.request(original);
  },
);

