import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VersionHistory = ({ isOpen, onClose, versions, onRestore }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <Icon name="History" size={24} color="var(--color-primary)" />
            Version History
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {versions?.map((version, index) => (
              <div
                key={version?.id}
                className="bg-muted/30 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        index === 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {index === 0 ? 'Current' : `v${versions?.length - index}`}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(version.timestamp)?.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Product</p>
                        <p className="text-sm font-medium text-foreground">{version?.productType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Loan Type</p>
                        <p className="text-sm font-medium text-foreground">{version?.loanType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                        <p className="text-sm font-semibold text-primary">{version?.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Modified By</p>
                        <p className="text-sm font-medium text-foreground">{version?.modifiedBy}</p>
                      </div>
                    </div>

                    {version?.changeNote && (
                      <div className="bg-card rounded p-2 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Change Note:</p>
                        <p className="text-sm text-foreground">{version?.changeNote}</p>
                      </div>
                    )}
                  </div>

                  {index !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestore(version)}
                      iconName="RotateCcw"
                      iconPosition="left"
                    >
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {versions?.length === 0 && (
            <div className="text-center py-12">
              <Icon name="History" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
              <p className="text-muted-foreground text-sm md:text-base">No version history available</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-4 md:px-6 py-4">
          <Button variant="outline" onClick={onClose} fullWidth>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;