import { apiClient } from '../lib/apiClient';
import { inferDocumentMediaType } from '../utils/documentUrls';
import { customerJourneyService } from './customerJourneyService';

const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

export const documentManagementService = {
  async getApplicationsWithDocuments(filters = {}) {
    const res = await apiClient.get('/documents/applications', { params: filters });
    return toCamelCase(res.data);
  },

  async getDocumentsByApplication(applicationId) {
    const res = await apiClient.get('/documents', { params: { applicationId } });
    return toCamelCase(res.data);
  },

  async verifyDocument(documentId, { status, verificationNotes }) {
    const res = await apiClient.patch(`/documents/${documentId}/verification`, {
      status,
      verification_notes: verificationNotes || null,
    });
    return toCamelCase(res.data);
  },

  downloadDocument: (documentId, options) =>
    customerJourneyService.downloadDocument(documentId, options),

  async uploadDocument(file, { applicationId, customerId, documentType }) {
    const form = new FormData();
    form.append('file', file);
    if (applicationId) form.append('applicationId', applicationId);
    if (customerId) form.append('customerId', customerId);
    if (documentType) form.append('documentType', documentType);
    const res = await apiClient.post('/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toCamelCase(res.data);
  },
};

export const DOC_SUMMARY_LABELS = {
  no_documents: 'No documents',
  pending_review: 'Pending review',
  has_rejected: 'Has rejected',
  all_approved: 'All approved',
  in_review: 'In review',
};

export const DOC_STATUS_LABELS = {
  pending: 'Pending',
  uploaded: 'Uploaded',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
};

export function mapApiDocumentToCard(doc) {
  const mime = doc.mimeType || doc.mime_type || '';
  const mediaType = inferDocumentMediaType({
    mimeType: mime,
    documentName: doc.documentName || doc.document_name,
    filePath: doc.filePath || doc.file_path,
  });
  const uploadedAt = doc.uploadedAt || doc.uploaded_at || doc.createdAt || doc.created_at;
  const status = doc.verificationStatus || doc.verification_status || doc.status || 'pending';

  return {
    id: doc.id,
    name: doc.documentName || doc.document_name || 'Document',
    documentType: doc.documentType || doc.document_type,
    category: doc.documentType || doc.document_type,
    type: mediaType,
    size: doc.fileSize || doc.file_size || 0,
    uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date(),
    status,
    verificationNote: doc.verificationNotes || doc.verification_notes || '',
    mimeType: mime,
    previewUrl: doc.previewUrl || doc.preview_url,
    filePath: doc.filePath || doc.file_path,
    raw: doc,
  };
}
