import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickActionCard = ({ action, onClick }) => {
  const getActionColor = (type) => {
    const colors = {
      'apply': 'from-blue-500 to-blue-600',
      'upload': 'from-orange-500 to-orange-600',
      'track': 'from-purple-500 to-purple-600',
      'support': 'from-green-500 to-green-600',
      'profile': 'from-pink-500 to-pink-600',
      'marketplace': 'from-indigo-500 to-indigo-600'
    };
    return colors?.[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <button
      onClick={onClick}
      className="group bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-lg transition-all duration-300 text-left w-full"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${getActionColor(action?.type)} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <Icon name={action?.icon} size={24} color="white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {action?.title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
            {action?.description}
          </p>
          
          {action?.badge && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {action?.badge}
            </span>
          )}
        </div>
        
        <Icon 
          name="ChevronRight" 
          size={20} 
          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" 
        />
      </div>
    </button>
  );
};

export default QuickActionCard;