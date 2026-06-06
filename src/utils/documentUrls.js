import { getApiBaseUrl } from '../lib/runtimeConfig';

/** Infer preview type from mime type and/or file name. */
export function inferDocumentMediaType(doc) {
  if (!doc) return 'doc';
  const mime = String(doc.mimeType || doc.mime_type || '').toLowerCase();
  const name = String(
    doc.name || doc.documentName || doc.document_name || doc.filePath || doc.file_path || '',
  ).toLowerCase();
  if (mime.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp)$/i.test(name)) return 'image';
  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  return 'doc';
}

/** Resolve a stored upload path or URL to a full browser URL. */
export function resolveUploadUrl(path) {
  if (!path) return null;
  const trimmed = String(path).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

/** Public static URL for uploaded files (images/PDFs served from /uploads). */
export function getDocumentPreviewUrl(doc) {
  if (!doc) return null;
  const base = getApiBaseUrl().replace(/\/$/, '');
  if (doc.previewUrl || doc.preview_url) {
    const preview = doc.previewUrl || doc.preview_url;
    return preview.startsWith('http') ? preview : `${base}${preview}`;
  }
  if (doc.documentUrl || doc.document_url) {
    const docUrl = doc.documentUrl || doc.document_url;
    if (String(docUrl).startsWith('/documents/')) {
      return `${base}${docUrl}`;
    }
    if (String(docUrl).startsWith('/uploads/')) {
      return `${base}${docUrl}`;
    }
  }
  const filePath = doc.filePath || doc.file_path;
  if (filePath) {
    const name = filePath.split(/[/\\]/).pop();
    if (name && base) return `${base}/uploads/${encodeURIComponent(name)}`;
  }
  return null;
}

function isPreviewableContentType(contentType) {
  const ct = String(contentType || '').toLowerCase();
  if (!ct) return false;
  if (ct.includes('text/html') || ct.includes('application/json')) return false;
  return (
    ct.startsWith('image/') ||
    ct.includes('pdf') ||
    ct.includes('octet-stream')
  );
}

async function probeStaticPreviewUrl(url) {
  if (!url) return false;
  try {
    let res = await fetch(url, { method: 'HEAD', credentials: 'include' });
    let ct = res.headers.get('content-type') || '';
    if (res.ok && isPreviewableContentType(ct)) return true;
    res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Range: 'bytes=0-1023' },
    });
    ct = res.headers.get('content-type') || '';
    return res.ok && isPreviewableContentType(ct);
  } catch {
    return false;
  }
}

/**
 * Load preview via authenticated download (works when /uploads static files are missing).
 * Returns a blob object URL when successful — call revoke() on cleanup when isBlob is true.
 */
export async function loadDocumentPreviewUrl(doc, downloadDocument) {
  if (!doc) {
    return { url: null, error: 'No document', isBlob: false, revoke: () => {} };
  }
  if (doc.localPreviewUrl) {
    return {
      url: doc.localPreviewUrl,
      error: null,
      isBlob: false,
      revoke: () => {},
    };
  }

  let downloadError = null;

  if (doc.id && typeof downloadDocument === 'function') {
    const { data, error } = await downloadDocument(doc.id, { inline: true });
    if (data?.blob) {
      const url = URL.createObjectURL(data.blob);
      return {
        url,
        error: null,
        isBlob: true,
        mimeType: data.mimeType || data.blob.type || doc.mimeType || doc.mime_type || '',
        revoke: () => URL.revokeObjectURL(url),
      };
    }
    downloadError = error?.message || 'Could not load document via download API';
  }

  const staticUrl = getDocumentPreviewUrl(doc);
  if (staticUrl) {
    const reachable = await probeStaticPreviewUrl(staticUrl);
    if (reachable) {
      return { url: staticUrl, error: null, isBlob: false, revoke: () => {} };
    }
  }

  return {
    url: null,
    error:
      downloadError ||
      (staticUrl
        ? 'Document file is missing on the server. Ask the customer to re-upload this document.'
        : 'Document preview is not available'),
    isBlob: false,
    revoke: () => {},
  };
}

export const DOCUMENT_TYPE_LABELS = {
  customer_photo: 'Customer photo',
  pan_card: 'PAN card',
  aadhaar_card: 'Aadhaar card',
  income_proof: 'Income proof',
  identity_proof: 'Identity proof',
  address_proof: 'Address proof',
  bank_statement: 'Bank statement',
};

export function documentTypeLabel(type) {
  if (!type) return 'Document';
  if (type.startsWith('co_applicant_')) {
    const base = type.replace('co_applicant_', '');
    const label = DOCUMENT_TYPE_LABELS[base] || base.replace(/_/g, ' ');
    return `Co-applicant — ${label}`;
  }
  return DOCUMENT_TYPE_LABELS[type] || String(type).replace(/_/g, ' ');
}
