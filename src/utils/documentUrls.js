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

/** Public static URL for uploaded files (images/PDFs served from /uploads). */
export function getDocumentPreviewUrl(doc) {
  if (!doc) return null;
  const base = getApiBaseUrl().replace(/\/$/, '');
  if (doc.previewUrl) {
    return doc.previewUrl.startsWith('http') ? doc.previewUrl : `${base}${doc.previewUrl}`;
  }
  const filePath = doc.filePath || doc.file_path;
  if (filePath) {
    const name = filePath.split(/[/\\]/).pop();
    if (name && base) return `${base}/uploads/${encodeURIComponent(name)}`;
  }
  return null;
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
    return {
      url: null,
      error: error?.message || 'Could not load document',
      isBlob: false,
      revoke: () => {},
    };
  }
  const staticUrl = getDocumentPreviewUrl(doc);
  if (staticUrl) {
    return { url: staticUrl, error: null, isBlob: false, revoke: () => {} };
  }
  return {
    url: null,
    error: 'Document preview is not available',
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
