import { apiClient } from '../lib/apiClient';
import { getApiBaseUrl } from '../lib/runtimeConfig';
import { extractYoutubeId } from './youtube';

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

export function isYoutubeLearningUrl(url) {
  if (!url) return false;
  return Boolean(extractYoutubeId(url)) || /youtube\.com|youtu\.be/i.test(String(url));
}

export function getLearningVideoUrl(item) {
  if (!item) return null;
  const candidates = [item.videoUrl, item.openUrl].filter(Boolean);
  for (const url of candidates) {
    if (isYoutubeLearningUrl(url)) return url;
  }
  if (String(item.contentType || item.type || '').toLowerCase() === 'video') {
    return item.videoUrl || item.openUrl || null;
  }
  return null;
}

function toApiPath(url) {
  const base = getApiBaseUrl().replace(/\/$/, '');
  if (url.startsWith('http')) {
    if (base && url.startsWith(base)) return url.slice(base.length) || '/';
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
}

function normalizeProtectedLearningPath(path) {
  if (!path) return null;
  const normalized = path.startsWith('http') ? new URL(path).pathname : path;
  const isPortalContent = PROTECTED_FILE_PREFIXES.some((prefix) => normalized.includes(`${prefix}content/`));
  if (!isPortalContent) return normalized;
  if (normalized.endsWith('/file')) return normalized;
  return `${normalized.replace(/\/$/, '')}/file`;
}

export function isProtectedLearningFileUrl(url) {
  const path = normalizeProtectedLearningPath(url);
  if (!path) return false;
  return PROTECTED_FILE_PREFIXES.some((prefix) => path.includes(prefix) && path.endsWith('/file'));
}

export function buildProtectedLearningFilePath(item, portal = 'employee') {
  const openUrl = item?.openUrl || item?.downloadPath || item?.fileUrl;
  if (openUrl) {
    const normalized = normalizeProtectedLearningPath(toApiPath(resolveLearningOpenUrl({ openUrl })));
    if (normalized && isProtectedLearningFileUrl(normalized)) return normalized;
  }
  if (!item?.id) return null;
  const prefix =
    portal === 'employee'
      ? `/portal/employee/learning/content/${encodeURIComponent(item.id)}/file`
      : `/portal/agent/learning/content/${encodeURIComponent(item.id)}/file`;
  return prefix;
}

/** Fetch authenticated PDF/file content for in-app viewing. */
export async function fetchProtectedLearningBlobUrl(item, portal = 'employee') {
  if (getLearningVideoUrl(item) && isYoutubeLearningUrl(getLearningVideoUrl(item))) {
    return null;
  }

  const apiPath = buildProtectedLearningFilePath(item, portal);
  if (apiPath && isProtectedLearningFileUrl(apiPath)) {
    const response = await apiClient.get(apiPath, { responseType: 'blob' });
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || item?.mimeType || 'application/pdf',
    });
    return URL.createObjectURL(blob);
  }

  const uploadUrl = resolveLearningOpenUrl(item);
  if (uploadUrl && (uploadUrl.includes('/uploads/') || uploadUrl.includes('/portal/'))) {
    const response = await apiClient.get(toApiPath(uploadUrl), { responseType: 'blob' });
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || item?.mimeType || 'application/pdf',
    });
    return URL.createObjectURL(blob);
  }

  return null;
}

/** @deprecated Prefer LearningResourceModal for in-portal viewing. */
export async function openLearningResource(item, portal = 'employee') {
  const videoUrl = getLearningVideoUrl(item);
  if (videoUrl && isYoutubeLearningUrl(videoUrl)) {
    return false;
  }

  const blobUrl = await fetchProtectedLearningBlobUrl(item, portal);
  if (blobUrl) {
    const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');
    if (opened) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    }
    return Boolean(opened);
  }

  const url = resolveLearningOpenUrl(item);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
