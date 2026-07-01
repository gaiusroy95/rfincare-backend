import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UploadZone = ({ onUpload, acceptedFormats, maxSize, category }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files?.filter(file => {
      const isValidFormat = acceptedFormats?.some(format => 
        file?.type?.includes(format) || file?.name?.endsWith(format)
      );
      const isValidSize = file?.size <= maxSize;
      return isValidFormat && isValidSize;
    });

    if (validFiles?.length > 0) {
      simulateUpload(validFiles);
    }
  };

  const simulateUpload = (files) => {
    const newProgress = files?.map((file, index) => ({
      id: Date.now() + index,
      name: file?.name,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...newProgress]);

    newProgress?.forEach((item, index) => {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const updated = prev?.map(p => {
            if (p?.id === item?.id) {
              const newProgress = Math.min(p?.progress + 10, 100);
              return {
                ...p,
                progress: newProgress,
                status: newProgress === 100 ? 'completed' : 'uploading'
              };
            }
            return p;
          });
          return updated;
        });
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        onUpload(files?.[index], category);
        setTimeout(() => {
          setUploadProgress(prev => prev?.filter(p => p?.id !== item?.id));
        }, 1000);
      }, 2000);
    });
  };

  const formatMaxSize = (bytes) => {
    return (bytes / 1048576)?.toFixed(0) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 md:p-8 lg:p-12 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/5' :'border-border bg-muted/30 hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats?.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Upload" size={32} className="text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base md:text-lg font-semibold text-foreground">
              Drop files here or click to upload
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Supported formats: {acceptedFormats?.join(', ')}
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {formatMaxSize(maxSize)}
            </p>
          </div>

          <Button
            variant="default"
            size="lg"
            iconName="FolderOpen"
            iconPosition="left"
            onClick={() => fileInputRef?.current?.click()}
          >
            Browse Files
          </Button>
        </div>
      </div>
      {uploadProgress?.length > 0 && (
        <div className="space-y-3">
          {uploadProgress?.map((item) => (
            <div key={item?.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Icon 
                    name={item?.status === 'completed' ? 'CheckCircle2' : 'Loader'} 
                    size={20} 
                    className={item?.status === 'completed' ? 'text-success' : 'text-primary animate-spin'}
                  />
                  <span className="text-sm font-medium text-foreground truncate">
                    {item?.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                  {item?.progress}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item?.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadZone;