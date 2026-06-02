import axios from 'axios';
import { getApiBaseUrl } from '../lib/runtimeConfig';

const DEV_SESSION_KEY = 'dev_panel_session_token';

function devClient() {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
  });
  client.interceptors.request.use((config) => {
    const token = sessionStorage.getItem(DEV_SESSION_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return client;
}

export async function checkDevSession() {
  const { data } = await devClient().get('/development-panel/session');
  return data?.authenticated === true;
}

export async function devLogin(password) {
  const { data } = await devClient().post('/development-panel/login', { password });
  if (data?.sessionToken) {
    sessionStorage.setItem(DEV_SESSION_KEY, data.sessionToken);
  }
  return data;
}

export async function devLogout() {
  try {
    const { data } = await devClient().post('/development-panel/logout');
    return data;
  } finally {
    sessionStorage.removeItem(DEV_SESSION_KEY);
  }
}

export async function fetchEnvFiles() {
  const { data } = await devClient().get('/development-panel/env');
  return data;
}

export async function saveEnvFile(target, content) {
  const { data } = await devClient().put('/development-panel/env', { target, content });
  return data;
}

export async function refreshRuntimeConfig() {
  const base = getApiBaseUrl()?.replace(/\/$/, '') || '';
  const url = base ? `${base}/public/runtime-config` : '/public/runtime-config';
  const res = await fetch(url);
  return res.ok ? res.json() : null;
}
