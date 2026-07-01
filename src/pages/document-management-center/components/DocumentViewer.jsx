import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const DocumentViewer = ({ document, onClose, onDownload }) => {
  const [currentVersion, setCurrentVersion] = useState(0);
  const [zoom, setZoom] = useState(100);

  const versions = document?.versions || [document];
  const currentDoc = versions?.[currentVersion];

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-1 truncate">
              {currentDoc?.name}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {currentDoc?.category} • Uploaded {formatDate(currentDoc?.uploadedAt)}
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              iconName="Download"
              onClick={() => onDownload(currentDoc)}
            />
            <Button
              variant="ghost"
              size="icon"
              iconName="X"
              onClick={onClose}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              iconName="ZoomOut"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="sm"
              iconName="ZoomIn"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            />
            <Button
              variant="outline"
              size="sm"
              iconName="Maximize2"
              onClick={handleResetZoom}
            />
          </div>

          <div className="flex justify-center">
            {currentDoc?.type === 'image' ? (
              <Image
                src={currentDoc?.url}
                alt={currentDoc?.urlAlt}
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            ) : currentDoc?.type === 'pdf' ? (
              <div className="w-full bg-white rounded-lg shadow-lg p-8" style={{ transform: `scale(${zoom / 100})` }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                    <div className="text-center">
                      <Icon name="FileText" size={64} className="text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">PDF Preview</p>
                      <p className="text-xs text-muted-foreground mt-2">{currentDoc?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Icon name="File" size={64} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Preview not available</p>
                    <Button
                      variant="default"
                      size="sm"
                      iconName="Download"
                      iconPosition="left"
                      onClick={() => onDownload(currentDoc)}
                      className="mt-4"
                    >
                      Download to view
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {versions?.length > 1 && (
          <div className="p-4 md:p-6 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Version History ({versions?.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {versions?.map((version, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVersion(index)}
                  className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    currentVersion === index
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>v{versions?.length - index}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{formatDate(version?.uploadedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;