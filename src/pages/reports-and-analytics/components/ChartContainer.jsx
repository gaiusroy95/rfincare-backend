import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChartContainer = ({ title, subtitle, icon, children, onExport, onFullscreen, exporting = false }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-3 md:space-y-0">
        <div className="flex items-start space-x-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10"
          >
            <Icon name={icon} size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Download"
            disabled={!onExport}
            loading={exporting}
            onClick={() => onExport?.()}
          >
            Export
          </Button>
          {onFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              iconName="Maximize2"
              onClick={onFullscreen}
            >
              Fullscreen
            </Button>
          )}
        </div>
      </div>

      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;