import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { customerJourneyService } from '../../../services/customerJourneyService';
import {
  APPLICANT_DOCUMENTS,
  coApplicantDocType,
  isExistingLoanStatementDocType,
  mergeAssessmentDocumentDefinitions,
  requiresCoApplicant,
} from '../../../constants/assessmentDocuments';
import DocumentPreviewModal from './DocumentPreviewModal';

const DocumentUploadCard = ({
  doc,
  personLabel,
  docType,
  uploaded,
  isUploading,
  error,
  fileInputRef,
  onSelectFile,
  onUploadClick,
  onView,
}) => {
  const imageOnly = docType === 'customer_photo' || docType === coApplicantDocType('customer_photo');
  const allowedShort = (doc.allowedFileTypes || []).map((t) => String(t).toLowerCase());
  const dynamicAccept = allowedShort.length
    ? allowedShort.map((ext) => {
        if (ext === 'jpeg' || ext === 'jpg') return '.jpg,.jpeg,image/jpeg';
        if (ext === 'png') return '.png,image/png';
        if (ext === 'pdf') return '.pdf,application/pdf';
        if (ext === 'webp') return '.webp,image/webp';
        return ext;
      }).join(',')
    : null;

  return (
    <div
      className={`feature-card border-2 transition-colors h-full ${
        uploaded ? 'border-success/40 bg-success/5' : error ? 'border-destructive/40' : 'border-border'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">{personLabel}</p>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name={doc.icon} size={20} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-foreground text-sm">{doc.label}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
            {uploaded && (
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                <Icon name="CheckCircle2" size={14} />
                <span className="truncate">{uploaded.documentName}</span>
              </p>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={dynamicAccept || (
            imageOnly
              ? '.jpg,.jpeg,.png,image/jpeg,image/png,image/webp'
              : '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'
          )}
          className="hidden"
          onChange={onSelectFile}
        />
        <div className="flex gap-2">
          {uploaded && (
            <Button type="button" variant="outline" size="sm" iconName="Eye" onClick={onView} className="flex-1">
              View
            </Button>
          )}
          <Button
            type="button"
            variant={uploaded ? 'outline' : 'default'}
            size="sm"
            loading={isUploading}
            iconName={uploaded ? 'RefreshCw' : 'Upload'}
            onClick={onUploadClick}
            className="flex-1"
          >
            {isUploading ? 'Uploading...' : uploaded ? 'Replace' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const DocumentUploadStep = ({
  applicationId,
  customerId,
  uploadedDocs,
  onUploaded,
  onRequirementsLoaded,
  errors,
  employmentType,
  existingLoans = [],
  hasRunningLoanOrCard,
}) => {
  const fileRefs = useRef({});
  const localPreviewUrls = useRef({});
  const [uploading, setUploading] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [documentDefinitions, setDocumentDefinitions] = useState(APPLICANT_DOCUMENTS);

  const dualUpload = requiresCoApplicant(employmentType);
  const serverDocsSynced = useRef(false);
  const allDocumentDefinitions = mergeAssessmentDocumentDefinitions({
    requirements: documentDefinitions,
    existingLoans,
    hasRunningLoanOrCard,
  });

  useEffect(() => {
    serverDocsSynced.current = false;
  }, [applicationId]);

  useEffect(() => {
    if (!applicationId || serverDocsSynced.current) return;
    let cancelled = false;
    (async () => {
      const { data: docs } = await customerJourneyService.getMyDocuments(applicationId);
      if (cancelled) return;
      serverDocsSynced.current = true;
      if (!docs?.length) return;
      docs.forEach((doc) => {
        const docType = doc.documentType;
        if (!docType) return;
        onUploaded(docType, {
          id: doc.id,
          documentName: doc.documentName,
          documentType: docType,
          mimeType: doc.mimeType,
          previewUrl: doc.previewUrl,
        });
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [applicationId, onUploaded]);

  useEffect(() => {
    let cancelled = false;
    const loadRequirements = async () => {
      try {
        if (!applicationId) {
          setDocumentDefinitions(APPLICANT_DOCUMENTS);
          onRequirementsLoaded?.(APPLICANT_DOCUMENTS);
          return;
        }
        const { data, error } = await customerJourneyService.getDocumentRequirements({ applicationId });
        if (cancelled) return;
        if (error) {
          setDocumentDefinitions(APPLICANT_DOCUMENTS);
          onRequirementsLoaded?.(APPLICANT_DOCUMENTS);
          return;
        }
        const resolved = normalizeDynamicDocumentRequirements(data?.requirements || []);
        setDocumentDefinitions(resolved);
        onRequirementsLoaded?.(resolved);
      } catch {
        if (!cancelled) {
          setDocumentDefinitions(APPLICANT_DOCUMENTS);
          onRequirementsLoaded?.(APPLICANT_DOCUMENTS);
        }
      }
    };
    loadRequirements();
    return () => {
      cancelled = true;
    };
  }, [applicationId, onRequirementsLoaded]);

  useEffect(
    () => () => {
      Object.values(localPreviewUrls.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    },
    [],
  );

  const handleFileSelect = async (docType, event) => {
    const file = event.target.files?.[0];
    if (!file || !applicationId) return;

    const normalizedType = String(docType).replace(/^co_applicant_/, '');
    const docDef = documentDefinitions.find((d) => d.type === normalizedType);
    const allowedShort = (docDef?.allowedFileTypes || []).map((t) => String(t).toLowerCase());
    const imageOnly =
      docType === 'customer_photo' || docType === coApplicantDocType('customer_photo');
    const defaultAllowed = imageOnly
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const allowedMime = allowedShort.length
      ? defaultAllowed.filter((mime) => {
          const lower = mime.toLowerCase();
          if (allowedShort.includes(lower)) return true;
          if (lower.includes('pdf') && allowedShort.includes('pdf')) return true;
          if (lower.includes('png') && allowedShort.includes('png')) return true;
          if ((lower.includes('jpg') || lower.includes('jpeg')) && (allowedShort.includes('jpg') || allowedShort.includes('jpeg'))) return true;
          if (lower.includes('webp') && allowedShort.includes('webp')) return true;
          return false;
        })
      : defaultAllowed;
    if (!allowedMime.includes(file.type)) {
      setUploadError(
        allowedShort.length
          ? `Please upload only: ${allowedShort.join(', ')}`
          : imageOnly
            ? 'Photo must be a JPG or PNG image.'
            : 'Please upload JPG, PNG, or PDF files only.',
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be under 10 MB.');
      return;
    }

    setUploadError('');
    setUploading(docType);
    const { data, error } = await customerJourneyService.uploadDocument(file, {
      applicationId,
      documentType: docType,
      customerId,
    });
    setUploading(null);

    if (error) {
      setUploadError(error?.response?.data?.error || error?.message || 'Upload failed. Please try again.');
      return;
    }

    if (localPreviewUrls.current[docType]) {
      URL.revokeObjectURL(localPreviewUrls.current[docType]);
    }
    const localPreviewUrl = URL.createObjectURL(file);
    localPreviewUrls.current[docType] = localPreviewUrl;

    onUploaded(docType, {
      id: data?.id,
      documentName: data?.documentName || file.name,
      documentType: docType,
      mimeType: data?.mimeType || file.type,
      previewUrl: data?.previewUrl,
      localPreviewUrl,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 md:p-6 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Upload" size={22} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">Upload Required Documents</h3>
            <p className="text-sm text-muted-foreground">
              {dualUpload
                ? 'Upload the same documents for you and your co-applicant side by side. Photos: JPG or PNG only. Other files: JPG, PNG, or PDF (max 10 MB each).'
                : 'Customer photo: JPG or PNG only. Other documents: JPG, PNG, or PDF (max 10 MB each).'}
              {hasRunningLoanOrCard === 'yes' && existingLoans?.length > 0
                ? ' Upload a statement for each existing loan or credit card you listed in the Financial step.'
                : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {allDocumentDefinitions.map((doc) => {
          const applicantType = doc.type;
          const coType = coApplicantDocType(doc.type);
          const loanStatementOnly = isExistingLoanStatementDocType(doc.type);

          return (
            <div key={doc.type} className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name={doc.icon} size={16} className="text-primary" />
                {doc.label}
              </h4>
              <div className={`grid grid-cols-1 ${dualUpload && !loanStatementOnly ? 'md:grid-cols-2' : ''} gap-4`}>
                <DocumentUploadCard
                  doc={doc}
                  personLabel="Applicant (you)"
                  docType={applicantType}
                  uploaded={uploadedDocs?.[applicantType]}
                  isUploading={uploading === applicantType}
                  error={errors?.[applicantType]}
                  fileInputRef={(el) => {
                    fileRefs.current[applicantType] = el;
                  }}
                  onSelectFile={(e) => handleFileSelect(applicantType, e)}
                  onUploadClick={() => fileRefs.current[applicantType]?.click()}
                  onView={() =>
                    setPreviewDoc({ ...uploadedDocs[applicantType], label: `${doc.label} — Applicant` })
                  }
                />
                {dualUpload && !loanStatementOnly && (
                  <DocumentUploadCard
                    doc={doc}
                    personLabel="Co-applicant"
                    docType={coType}
                    uploaded={uploadedDocs?.[coType]}
                    isUploading={uploading === coType}
                    error={errors?.[coType]}
                    fileInputRef={(el) => {
                      fileRefs.current[coType] = el;
                    }}
                    onSelectFile={(e) => handleFileSelect(coType, e)}
                    onUploadClick={() => fileRefs.current[coType]?.click()}
                    onView={() =>
                      setPreviewDoc({ ...uploadedDocs[coType], label: `${doc.label} — Co-applicant` })
                    }
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {uploadError && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          {uploadError}
        </p>
      )}

      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};

export default DocumentUploadStep;
