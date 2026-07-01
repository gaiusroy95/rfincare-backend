import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const DocumentCard = ({ 
  document, 
  onView, 
  onDownload, 
  onDelete, 
  onReupload,
  isSelectable,
  isSelected,
  onSelect 
}) => {
  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-success text-success-foreground',
      pending: 'bg-warning text-warning-foreground',
      rejected: 'bg-destructive text-destructive-foreground',
      expired: 'bg-muted text-muted-foreground'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status) => {
    const icons = {
      approved: 'CheckCircle2',
      pending: 'Clock',
      rejected: 'XCircle',
      expired: 'AlertCircle'
    };
    return icons?.[status] || 'FileText';
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: 'FileText',
      image: 'Image',
      doc: 'FileText',
      excel: 'FileSpreadsheet'
    };
    return icons?.[type] || 'File';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024)?.toFixed(1) + ' KB';
    return (bytes / 1048576)?.toFixed(1) + ' MB';
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 md:p-6 transition-all hover:shadow-md ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
          {isSelectable && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(document?.id, e?.target?.checked)}
              className="mt-1 w-4 h-4 md:w-5 md:h-5 rounded border-border text-primary focus:ring-primary"
            />
          )}
          
          <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
            {document?.thumbnail ? (
              <Image
                src={document?.thumbnail}
                alt={document?.thumbnailAlt}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Icon name={getFileIcon(document?.type)} size={24} className="text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-foreground mb-1 truncate">
              {document?.name}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-2">
              {document?.category}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="whitespace-nowrap">{formatFileSize(document?.size)}</span>
              <span>•</span>
              <span className="whitespace-nowrap">Uploaded {formatDate(document?.uploadedAt)}</span>
            </div>
          </div>
        </div>

        <div className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold flex items-center space-x-1 flex-shrink-0 ml-2 ${getStatusColor(document?.status)}`}>
          <Icon name={getStatusIcon(document?.status)} size={12} />
          <span className="hidden sm:inline">{document?.status?.charAt(0)?.toUpperCase() + document?.status?.slice(1)}</span>
        </div>
      </div>
      {document?.verificationNote && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-xs md:text-sm text-muted-foreground">
            <span className="font-semibold">Note:</span> {document?.verificationNote}
          </p>
        </div>
      )}
      {document?.expiryDate && (
        <div className="mb-4 flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
          <Icon name="Calendar" size={14} />
          <span>Expires: {formatDate(document?.expiryDate)}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Eye"
          iconPosition="left"
          onClick={() => onView(document)}
          className="flex-1 sm:flex-none"
        >
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
          onClick={() => onDownload(document)}
          className="flex-1 sm:flex-none"
        >
          Download
        </Button>
        {document?.status === 'rejected' && (
          <Button
            variant="default"
            size="sm"
            iconName="Upload"
            iconPosition="left"
            onClick={() => onReupload(document)}
            className="flex-1 sm:flex-none"
          >
            Reupload
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          iconName="Trash2"
          iconPosition="left"
          onClick={() => onDelete(document)}
          className="flex-1 sm:flex-none text-destructive hover:text-destructive"
        >
          Delete
        </Button>
      </div>
      {document?.versions && document?.versions?.length > 1 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            className="text-xs md:text-sm text-primary hover:underline flex items-center space-x-1"
            onClick={() => onView(document)}
          >
            <Icon name="History" size={14} />
            <span>View {document?.versions?.length} versions</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;