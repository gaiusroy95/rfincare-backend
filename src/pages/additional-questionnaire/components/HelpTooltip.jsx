import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const HelpTooltip = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
      >
        <Icon name="HelpCircle" size={14} color="var(--color-muted-foreground)" />
      </button>

      {isVisible && (
        <div className="absolute z-50 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 animate-fade-in">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-popover border-r border-b border-border" />
          <p className="text-xs text-popover-foreground leading-relaxed">
            {content}
          </p>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;