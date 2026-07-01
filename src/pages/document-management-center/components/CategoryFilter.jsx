import React from 'react';
import Icon from '../../../components/AppIcon';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory, documentCounts }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
        Document Categories
      </h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory('all')}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
            selectedCategory === 'all' ?'bg-primary text-primary-foreground' :'bg-muted/50 text-foreground hover:bg-muted'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Icon name="Folder" size={20} />
            <span className="text-sm md:text-base font-medium">All Documents</span>
          </div>
          <span className="text-xs md:text-sm font-semibold">
            {documentCounts?.all}
          </span>
        </button>

        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => onSelectCategory(category?.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
              selectedCategory === category?.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-foreground hover:bg-muted'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon name={category?.icon} size={20} />
              <span className="text-sm md:text-base font-medium">{category?.name}</span>
            </div>
            <span className="text-xs md:text-sm font-semibold">
              {documentCounts?.[category?.id] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;