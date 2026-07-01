import React, { useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { APPLICANT_DOCUMENTS } from '../../../constants/assessmentDocuments';
import { documentManagementService } from '../../../services/documentManagementService';

const DOC_TYPE_OPTIONS = APPLICANT_DOCUMENTS.map((d) => ({
  value: d.type,
  label: d.label,
}));

const AgentDocumentUploadPanel = ({ application, onUploaded }) => {
  const fileRef = useRef(null);
  const [documentType, setDocumentType] = useState('pan_card');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !application?.applicationId) return;

    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await documentManagementService.uploadDocument(file, {
        applicationId: application.applicationId,
        customerId: application.customerId,
        documentType,
      });
      setSuccess(`${file.name} uploaded successfully.`);
      onUploaded?.();
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-card border-2 border-primary/20 rounded-lg p-4 md:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon name="Upload" size={22} className="text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Upload customer document</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Files are linked to application {application?.applicationNumber || application?.applicationId}.
            Supported: JPG, PNG, PDF, WebP (max 10 MB).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <Select
          label="Document type"
          options={DOC_TYPE_OPTIONS}
          value={documentType}
          onChange={setDocumentType}
        />
        <div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.webp,image/*,application/pdf"
            onChange={handleUpload}
          />
          <Button
            type="button"
            variant="default"
            className="w-full"
            loading={uploading}
            iconName="Upload"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Choose file & upload'}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-success bg-success/10 border border-success/30 rounded-lg p-3">
          {success}
        </p>
      )}
    </div>
  );
};

export default AgentDocumentUploadPanel;
