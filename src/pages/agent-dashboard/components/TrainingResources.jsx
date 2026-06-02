import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TrainingResources = ({
  resources,
  onViewAll,
  showViewAll = true,
  onOpenResource,
  onStartResource,
}) => {
  const getResourceTypeIcon = (type) => {
    const icons = {
      course: 'GraduationCap',
      video: 'Video',
      document: 'FileText',
      webinar: 'Monitor',
      certification: 'Award'
    };
    return icons?.[type] || 'BookOpen';
  };

  const getResourceTypeColor = (type) => {
    const colors = {
      course: 'bg-blue-100 text-blue-700',
      video: 'bg-purple-100 text-purple-700',
      document: 'bg-green-100 text-green-700',
      webinar: 'bg-amber-100 text-amber-700',
      certification: 'bg-red-100 text-red-700'
    };
    return colors?.[type] || 'bg-gray-100 text-gray-700';
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-amber-500';
    if (progress >= 25) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="BookOpen" size={20} color="var(--color-primary)" />
          <h2 className="text-lg md:text-xl font-bold text-foreground">Training & Certification</h2>
        </div>
        {showViewAll && (
          <Button variant="outline" size="sm" iconName="ExternalLink" onClick={onViewAll}>
            View All
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {!resources?.length && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No training content yet. Your admin will publish videos, PDFs, and circulars here.
          </p>
        )}
        {resources?.map((resource) => (
          <div
            key={resource?.id}
            className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg ${getResourceTypeColor(resource?.type)} flex items-center justify-center flex-shrink-0`}>
                <Icon name={getResourceTypeIcon(resource?.type)} size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{resource?.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{resource?.description}</p>
                  </div>
                  {resource?.isNew && (
                    <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full flex-shrink-0 ml-2">
                      New
                    </span>
                  )}
                </div>

                {resource?.progress !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{resource?.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(resource?.progress)} transition-all duration-300`}
                        style={{ width: `${resource?.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} />
                      <span>{resource?.duration}</span>
                    </div>
                    {resource?.completedBy && (
                      <div className="flex items-center space-x-1">
                        <Icon name="Users" size={12} />
                        <span>{resource?.completedBy} completed</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant={resource?.progress > 0 ? 'outline' : 'default'}
                    size="xs"
                    iconName={resource?.progress > 0 ? 'Play' : 'ArrowRight'}
                    onClick={() =>
                      (resource?.progress > 0 ? onOpenResource : onStartResource)?.(resource)
                    }
                  >
                    {resource?.progress >= 100 ? 'Review' : resource?.progress > 0 ? 'Continue' : 'Start'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingResources;