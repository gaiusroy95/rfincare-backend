import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const DocumentViewer = ({ document, onClose, onApprove, onReject }) => {
  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotation, setCurrentAnnotation] = useState('');
  const [qualityChecks, setQualityChecks] = useState({
    imageQuality: false,
    readability: false,
    completeness: false,
    authenticity: false,
    validity: false
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [zoom, setZoom] = useState(100);

  const handleAddAnnotation = () => {
    if (currentAnnotation?.trim()) {
      setAnnotations([...annotations, {
        id: Date.now(),
        text: currentAnnotation,
        timestamp: new Date()
      }]);
      setCurrentAnnotation('');
    }
  };

  const handleCheckChange = (key) => {
    setQualityChecks(prev => ({
      ...prev,
      [key]: !prev?.[key]
    }));
  };

  const allChecksComplete = Object.values(qualityChecks)?.every(check => check);

  const handleApprove = () => {
    if (allChecksComplete) {
      onApprove({
        documentId: document?.id,
        annotations,
        qualityChecks,
        timestamp: new Date()
      });
    }
  };

  const handleReject = () => {
    if (rejectionReason?.trim()) {
      onReject({
        documentId: document?.id,
        reason: rejectionReason,
        annotations,
        timestamp: new Date()
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">{document?.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">Document Type: {document?.type}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium">Zoom: {zoom}%</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    disabled={zoom <= 50}
                  >
                    <Icon name="ZoomOut" size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(100)}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    disabled={zoom >= 200}
                  >
                    <Icon name="ZoomIn" size={16} />
                  </Button>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 overflow-auto">
                <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
                  <Image
                    src={document?.url}
                    alt={document?.alt}
                    className="w-full rounded"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="CheckSquare" size={16} className="mr-2" />
                  Quality Assurance Checklist
                </h3>
                <div className="space-y-3">
                  <Checkbox
                    label="Image Quality (Clear & Legible)"
                    checked={qualityChecks?.imageQuality}
                    onChange={() => handleCheckChange('imageQuality')}
                    size="sm"
                  />
                  <Checkbox
                    label="Document Readability"
                    checked={qualityChecks?.readability}
                    onChange={() => handleCheckChange('readability')}
                    size="sm"
                  />
                  <Checkbox
                    label="Information Completeness"
                    checked={qualityChecks?.completeness}
                    onChange={() => handleCheckChange('completeness')}
                    size="sm"
                  />
                  <Checkbox
                    label="Authenticity Verification"
                    checked={qualityChecks?.authenticity}
                    onChange={() => handleCheckChange('authenticity')}
                    size="sm"
                  />
                  <Checkbox
                    label="Validity Check (Dates/Signatures)"
                    checked={qualityChecks?.validity}
                    onChange={() => handleCheckChange('validity')}
                    size="sm"
                  />
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="MessageSquare" size={16} className="mr-2" />
                  Annotations
                </h3>
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {annotations?.map((annotation) => (
                    <div key={annotation?.id} className="bg-card p-2 rounded text-xs">
                      <p className="text-foreground">{annotation?.text}</p>
                      <p className="text-muted-foreground text-[10px] mt-1">
                        {new Date(annotation.timestamp)?.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add annotation..."
                    value={currentAnnotation}
                    onChange={(e) => setCurrentAnnotation(e?.target?.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddAnnotation}
                    disabled={!currentAnnotation?.trim()}
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Rejection Reason</h3>
                <Input
                  type="text"
                  placeholder="Enter reason if rejecting..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e?.target?.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 md:p-6 border-t border-border">
          <div className="text-xs md:text-sm text-muted-foreground">
            {allChecksComplete ? (
              <span className="text-success flex items-center">
                <Icon name="CheckCircle" size={16} className="mr-1" />
                All quality checks completed
              </span>
            ) : (
              <span className="flex items-center">
                <Icon name="AlertCircle" size={16} className="mr-1" />
                Complete all checks to approve
              </span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason?.trim()}
              className="flex-1 sm:flex-initial"
            >
              <Icon name="XCircle" size={16} className="mr-2" />
              Reject
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={!allChecksComplete}
              className="flex-1 sm:flex-initial"
            >
              <Icon name="CheckCircle" size={16} className="mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;