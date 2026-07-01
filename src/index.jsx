import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import {
  applyRuntimeToApiClient,
  inferApiBaseFromHost,
  loadRuntimeConfig,
  normalizeApiBaseUrl,
} from './lib/runtimeConfig';
import { apiClient } from './lib/apiClient';
import './styles/tailwind.css';
import './styles/index.css';

const container = document.getElementById('root');
const root = createRoot(container);

function renderApp() {
  root.render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
}

async function bootstrap() {
  const earlyBase = normalizeApiBaseUrl(
    import.meta.env?.VITE_API_BASE_URL?.replace(/\/$/, '') || inferApiBaseFromHost(),
  );
  if (earlyBase) {
    apiClient.defaults.baseURL = earlyBase;
    renderApp();
    loadRuntimeConfig().then(() => applyRuntimeToApiClient(apiClient));
    return;
  }

  await loadRuntimeConfig();
  applyRuntimeToApiClient(apiClient);
  renderApp();
}

bootstrap();
