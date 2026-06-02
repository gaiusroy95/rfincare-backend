import { getApiBaseUrl } from '../lib/runtimeConfig';

/** Resolve story photo path from API to a full URL for img src. */
export function getStoryPhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl;
  const base = (getApiBaseUrl() || '').replace(/\/$/, '');
  const path = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
  return base ? `${base}${path}` : path;
}

export function formatStoryDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
}
