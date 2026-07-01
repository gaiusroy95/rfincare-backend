import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TrainingResources = ({ resources, onStartResource, onOpenResource }) => {
  const getCategoryIcon = (category) => {
    const icons = {
      'Document Verification': 'FileCheck',
      'Fraud Detection': 'Shield',
      Compliance: 'Scale',
      'System Training': 'Monitor',
      'Customer Service': 'Users',
    };
    return icons?.[category] || 'BookOpen';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Document Verification': 'text-blue-600 bg-blue-50',
      'Fraud Detection': 'text-red-600 bg-red-50',
      Compliance: 'text-purple-600 bg-purple-50',
      'System Training': 'text-green-600 bg-green-50',
      'Customer Service': 'text-yellow-600 bg-yellow-50',
    };
    return colors?.[category] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center">
        <Icon name="GraduationCap" size={20} className="mr-2" />
        Training Resources
      </h2>
      {!resources?.length && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No training content published yet. Your admin team will add videos, PDFs, and circulars
          here.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources?.map((resource) => (
          <div
            key={resource?.id}
            className="border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(resource?.category)}`}
              >
                <Icon name={getCategoryIcon(resource?.category)} size={20} />
              </div>
              {resource?.isNew && (
                <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded">
                  NEW
                </span>
              )}
            </div>
            <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
              {resource?.title}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
              {resource?.description}
            </p>
            {resource?.progress > 0 && resource.progress < 100 && (
              <div className="mb-3">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${resource.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{resource.progress}% complete</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Icon name="Clock" size={12} className="mr-1" />
                  {resource?.duration || '—'}
                </span>
                <span className="flex items-center">
                  <Icon name="Users" size={12} className="mr-1" />
                  {resource?.completions ?? '0'}
                </span>
              </div>
              <Button
                variant={resource?.progress >= 100 ? 'outline' : 'default'}
                size="sm"
                onClick={() =>
                  (resource?.progress > 0 ? onOpenResource : onStartResource)?.(resource)
                }
              >
                <Icon name="Play" size={14} className="mr-1" />
                {resource?.progress >= 100 ? 'Review' : resource?.progress > 0 ? 'Continue' : 'Start'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingResources;
