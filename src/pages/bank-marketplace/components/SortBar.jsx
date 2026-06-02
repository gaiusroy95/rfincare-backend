import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const SortBar = ({ sortBy, onSortChange, resultCount, viewMode, onViewModeChange }) => {
  const sortOptions = [
    { value: 'probability-desc', label: 'Highest Probability' },
    { value: 'probability-asc', label: 'Lowest Probability' },
    { value: 'interest-asc', label: 'Lowest Interest Rate' },
    { value: 'interest-desc', label: 'Highest Interest Rate' },
    { value: 'rating-desc', label: 'Highest Rating' },
    { value: 'name-asc', label: 'Bank Name (A-Z)' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-3 md:p-4 mb-4 md:mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
        {/* Results Count */}
        <div className="flex items-center space-x-2">
          <Icon name="Building2" size={20} className="text-primary" />
          <span className="text-sm md:text-base text-foreground">
            <span className="font-bold">{resultCount}</span> banks match your profile
          </span>
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center space-x-3 md:space-x-4 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <div className="flex-grow sm:flex-grow-0 sm:w-56">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              placeholder="Sort by..."
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-background'
              }`}
              aria-label="Grid view"
            >
              <Icon name="Grid3x3" size={18} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-background'
              }`}
              aria-label="List view"
            >
              <Icon name="List" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortBar;