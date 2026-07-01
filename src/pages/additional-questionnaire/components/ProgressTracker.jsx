import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressTracker = ({ 
  currentSection, 
  totalSections, 
  completedSections,
  estimatedTime 
}) => {
  const progressPercentage = (completedSections / totalSections) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 mb-4 md:mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm md:text-base font-semibold text-foreground">
              Progress
            </h3>
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              {completedSections} of {totalSections} sections completed
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 md:h-3 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: 'var(--color-success)'
              }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-lg flex-shrink-0">
          <Icon name="Clock" size={16} color="var(--color-muted-foreground)" />
          <span className="text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">
            Est. {estimatedTime} min remaining
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;