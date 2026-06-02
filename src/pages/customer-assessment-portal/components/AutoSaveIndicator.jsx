import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

const AutoSaveIndicator = ({ lastSaved, isSaving }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSaved) / 1000);
      
      if (seconds < 60) {
        setTimeAgo('Just now');
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`);
      } else {
        const hours = Math.floor(seconds / 3600);
        setTimeAgo(`${hours} ${hours === 1 ? 'hour' : 'hours'} ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (!lastSaved && !isSaving) return null;

  return (
    <div className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
      {isSaving ? (
        <>
          <div className="animate-spin">
            <Icon name="Loader2" size={14} className="md:w-4 md:h-4" />
          </div>
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Icon name="Check" size={14} className="text-success md:w-4 md:h-4" />
          <span>Saved {timeAgo}</span>
        </>
      )}
    </div>
  );
};

export default AutoSaveIndicator;