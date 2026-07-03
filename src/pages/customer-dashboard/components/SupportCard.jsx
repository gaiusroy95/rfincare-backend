import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SupportCard = () => {
  const supportOptions = [
    {
      id: 1,
      icon: 'MessageSquare',
      title: 'Live Chat',
      description: 'Chat with our support team',
      availability: 'Available 24/7',
      color: 'from-emerald-600 to-[var(--color-brand-green-dark)]'
    },
    {
      id: 2,
      icon: 'Phone',
      title: 'Call Support',
      description: 'Speak with an expert',
      availability: 'Mon-Fri, 9AM-6PM',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      icon: 'Mail',
      title: 'Email Support',
      description: 'Send us your query',
      availability: 'Response within 24hrs',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 4,
      icon: 'HelpCircle',
      title: 'FAQ Center',
      description: 'Find quick answers',
      availability: 'Self-service',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Icon name="Headphones" size={24} color="var(--color-primary)" />
        Need Help?
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {supportOptions?.map((option) => (
          <button
            key={option?.id}
            className="group bg-muted/50 hover:bg-muted rounded-lg p-4 text-left transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${option?.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <Icon name={option?.icon} size={20} color="white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm md:text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {option?.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-1">
                  {option?.description}
                </p>
                <span className="text-xs text-primary font-medium">
                  {option?.availability}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground mb-2">
              <span className="font-semibold">Quick Tip:</span> Most queries are resolved within 2 hours during business hours.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              iconName="ExternalLink"
              iconPosition="right"
            >
              View Support Hours
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCard;