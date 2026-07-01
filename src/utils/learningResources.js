import { apiClient } from '../lib/apiClient';
import { getApiBaseUrl } from '../lib/runtimeConfig';

const PROTECTED_FILE_PREFIXES = [
  '/portal/agent/learning/',
  '/portal/employee/learning/',
];

export function resolveLearningOpenUrl(item) {
  const raw = item?.openUrl || item?.videoUrl || item?.fileUrl;
  if (!raw) return null;
  if (raw.startsWith('http')) return raw;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function isProtectedLearningFileUrl(url) {
  if (!url) return false;
  try {
    const path = url.startsWith('http') ? new URL(url).pathname : url;
    return PROTECTED_FILE_PREFIXES.some((prefix) => path.includes(`${prefix}`) && path.endsWith('/file'));
  } catch {
    return false;
  }
}

function toApiPath(url) {
  const base = getApiBaseUrl().replace(/\/$/, '');
  if (url.startsWith('http')) {
    if (base && url.startsWith(base)) return url.slice(base.length) || '/';
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
}

/** Open PDFs/videos; authenticated portal file routes are fetched as blobs first. */
export async function openLearningResource(item) {
  const url = resolveLearningOpenUrl(item);
  if (!url) return false;

  if (isProtectedLearningFileUrl(url)) {
    const response = await apiClient.get(toApiPath(url), { responseType: 'blob' });
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/pdf',
    });
    const blobUrl = URL.createObjectURL(blob);
    const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');
    if (opened) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    }
    return Boolean(opened);
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
