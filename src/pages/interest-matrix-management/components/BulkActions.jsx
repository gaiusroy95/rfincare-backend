import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActions = ({ selectedCount, onBulkEdit, onBulkDelete, onBulkExport, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-slide-in">
      <div className="bg-card rounded-lg shadow-lg border border-border px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{selectedCount}</span>
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:inline">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </div>

        <div className="h-6 w-px bg-border"></div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkEdit}
            iconName="Edit2"
            iconPosition="left"
            className="hidden sm:flex"
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onBulkEdit}
            className="sm:hidden h-8 w-8"
          >
            <Icon name="Edit2" size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkExport}
            iconName="Download"
            iconPosition="left"
            className="hidden sm:flex"
          >
            Export
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onBulkExport}
            className="sm:hidden h-8 w-8"
          >
            <Icon name="Download" size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkDelete}
            iconName="Trash2"
            iconPosition="left"
            className="hidden sm:flex text-destructive hover:text-destructive"
          >
            Delete
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onBulkDelete}
            className="sm:hidden h-8 w-8 text-destructive hover:text-destructive"
          >
            <Icon name="Trash2" size={16} />
          </Button>

          <div className="h-6 w-px bg-border"></div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="h-8 w-8"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;