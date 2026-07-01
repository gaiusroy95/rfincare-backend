import React, { useEffect, useRef, useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { bankService } from '../../services/apiServices';
import { resolveBankLogoUrl } from '../../utils/bankBranding';

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml';

/**
 * Logo URL field plus optional direct file upload (requires bankId for immediate upload).
 * @param {{ logoUrl: string, logoAlt: string, bankId?: string, onLogoUrlChange: (url: string) => void, onLogoAltChange: (alt: string) => void, onPendingFile?: (file: File | null) => void, onError?: (msg: string) => void }} props
 */
const BankLogoFields = ({
  logoUrl,
  logoAlt,
  bankId,
  onLogoUrlChange,
  onLogoAltChange,
  onPendingFile,
  onError,
}) => {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const previewSrc = localPreview || resolveBankLogoUrl(logoUrl);

  const clearPendingPreview = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onError?.('');

    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(file));

    if (!bankId) {
      onPendingFile?.(file);
      return;
    }

    try {
      setUploading(true);
      const updated = await bankService.uploadBankLogo(bankId, file);
      onLogoUrlChange(updated?.logoUrl || '');
      onPendingFile?.(null);
      clearPendingPreview();
    } catch (err) {
      onError?.(err?.response?.data?.error || err?.message || 'Logo upload failed');
      clearPendingPreview();
      onPendingFile?.(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (value) => {
    onLogoUrlChange(value);
    onPendingFile?.(null);
    clearPendingPreview();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearLogo = () => {
    handleUrlChange('');
    onPendingFile?.(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Logo URL</label>
        <Input
          value={logoUrl || ''}
          onChange={(e) => handleUrlChange(e?.target?.value)}
          placeholder="https://example.com/logo.png"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Paste an external image URL, or upload a file below
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Upload logo</label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            disabled={uploading}
            onChange={handleFileChange}
            className="block text-sm text-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-border file:bg-muted file:text-sm file:font-medium hover:file:bg-muted/80"
          />
          {(logoUrl || localPreview) && (
            <Button type="button" variant="outline" size="sm" onClick={handleClearLogo} disabled={uploading}>
              Clear logo
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          JPEG, PNG, GIF, WebP, or SVG (max 2 MB).
          {!bankId && ' Logo file will upload when you save a new bank.'}
        </p>
        {uploading && <p className="text-xs text-primary mt-1">Uploading…</p>}
      </div>

      {previewSrc && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
          <img
            src={previewSrc}
            alt={logoAlt || 'Bank logo preview'}
            className="h-12 w-auto max-w-[140px] object-contain"
            onError={(ev) => {
              ev.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-xs text-muted-foreground">Preview</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Logo Alt Text</label>
        <Input
          value={logoAlt || ''}
          onChange={(e) => onLogoAltChange(e?.target?.value)}
          placeholder="Bank logo description"
        />
      </div>
    </div>
  );
};

export default BankLogoFields;
