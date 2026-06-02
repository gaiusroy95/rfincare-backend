import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { customerJourneyService } from '../../../services/customerJourneyService';

const DocumentUploadModal = ({ isOpen, onClose, onUploadSuccess, applicationId }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const documentTypes = [
    { value: 'identity_proof', label: 'Identity Proof (Aadhaar/PAN/Passport)' },
    { value: 'address_proof', label: 'Address Proof' },
    { value: 'income_proof', label: 'Income Proof (Salary Slip/ITR)' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'tax_return', label: 'Tax Return' },
    { value: 'employment_letter', label: 'Employment Letter' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e?.target?.files?.[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile?.size > 10485760) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes?.includes(selectedFile?.type)) {
        setError('Invalid file type. Please upload JPG, PNG, PDF, or DOC files');
        return;
      }

      setFile(selectedFile);
      setError('');
      if (!documentName) {
        setDocumentName(selectedFile?.name);
      }
    }
  };

  const handleUpload = async (e) => {
    e?.preventDefault();
    if (!file || !documentType) {
      setError('Please select a file and document type');
      return;
    }

    setUploading(true);
    setError('');

    const { data, error: uploadError } = await customerJourneyService?.uploadDocument(file, {
      documentType,
      documentName,
      applicationId,
      status: 'pending'
    });

    setUploading(false);

    if (uploadError) {
      setError(uploadError?.message || 'Failed to upload document');
      return;
    }

    onUploadSuccess?.(data);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setDocumentType('');
    setDocumentName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Upload Document</h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          <Select
            label="Document Type"
            placeholder="Select document type"
            options={documentTypes}
            value={documentType}
            onChange={(value) => setDocumentType(value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Document Name
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e?.target?.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter document name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef?.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <Icon name="File" size={20} color="var(--color-primary)" />
                  <span className="text-sm text-foreground">{file?.name}</span>
                </div>
              ) : (
                <div>
                  <Icon name="Upload" size={32} color="var(--color-muted-foreground)" className="mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOC (max 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="flex-1"
              iconName="Upload"
              iconPosition="left"
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;