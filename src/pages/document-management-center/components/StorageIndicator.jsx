import React from 'react';
import Icon from '../../../components/AppIcon';

const StorageIndicator = ({ usedStorage, totalStorage }) => {
  const usedPercentage = (usedStorage / totalStorage) * 100;
  
  const formatStorage = (bytes) => {
    return (bytes / 1073741824)?.toFixed(2) + ' GB';
  };

  const getStorageColor = () => {
    if (usedPercentage >= 90) return 'bg-destructive';
    if (usedPercentage >= 75) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm md:text-base font-semibold text-foreground">Storage Usage</h3>
        <Icon name="HardDrive" size={20} className="text-muted-foreground" />
      </div>

      <div className="space-y-3">
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getStorageColor()}`}
            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs md:text-sm">
          <span className="text-muted-foreground">
            {formatStorage(usedStorage)} used
          </span>
          <span className="text-muted-foreground">
            {formatStorage(totalStorage)} total
          </span>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-muted-foreground">Available</span>
            <span className="font-semibold text-foreground">
              {formatStorage(totalStorage - usedStorage)}
            </span>
          </div>
        </div>

        {usedPercentage >= 75 && (
          <div className="flex items-start space-x-2 p-3 bg-warning/10 rounded-lg">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5 flex-shrink-0" />
            <p className="text-xs text-warning">
              {usedPercentage >= 90 
                ? 'Storage almost full. Please delete unnecessary documents.'
                : 'Storage usage is high. Consider removing old documents.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageIndicator;