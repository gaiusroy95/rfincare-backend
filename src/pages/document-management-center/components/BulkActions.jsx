import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActions = ({ selectedCount, onDownloadAll, onDeleteAll, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-4 md:p-6 shadow-lg animate-slide-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Icon name="CheckSquare" size={20} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold">
              {selectedCount} {selectedCount === 1 ? 'document' : 'documents'} selected
            </h3>
            <p className="text-xs md:text-sm opacity-90">
              Choose an action to apply to selected items
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={onDownloadAll}
            className="flex-1 sm:flex-none"
          >
            Download All
          </Button>
          <Button
            variant="destructive"
            size="sm"
            iconName="Trash2"
            iconPosition="left"
            onClick={onDeleteAll}
            className="flex-1 sm:flex-none"
          >
            Delete All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClearSelection}
            className="flex-1 sm:flex-none"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;