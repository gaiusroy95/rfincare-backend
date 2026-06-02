import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      id: 1,
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Description'),
      icon: 'FileText',
      color: 'var(--color-primary)',
      duration: t('howItWorks.step1Duration')
    },
    {
      id: 2,
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Description'),
      icon: 'Building2',
      color: 'var(--color-secondary)',
      duration: t('howItWorks.step2Duration')
    },
    {
      id: 3,
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Description'),
      icon: 'Send',
      color: 'var(--color-accent)',
      duration: t('howItWorks.step3Duration')
    },
    {
      id: 4,
      title: t('howItWorks.step4Title'),
      description: t('howItWorks.step4Description'),
      icon: 'CheckCircle',
      color: 'var(--color-success)',
      duration: t('howItWorks.step4Duration')
    }
  ];

  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-success transform -translate-y-1/2 opacity-20"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative">
            {steps?.map((step, index) => (
              <div key={step?.id} className="relative">
                <div className="feature-card text-center h-full flex flex-col">
                  <div className="relative inline-flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center relative z-10"
                      style={{ backgroundColor: step?.color }}
                    >
                      <Icon name={step?.icon} size={32} color="white" />
                    </div>
                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm md:text-base"
                      style={{ backgroundColor: step?.color }}
                    >
                      {step?.id}
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3">
                    {step?.title}
                  </h3>

                  <p className="text-sm md:text-base text-muted-foreground mb-4 flex-grow">
                    {step?.description}
                  </p>

                  <div className="inline-flex items-center justify-center space-x-2 text-xs md:text-sm font-medium px-4 py-2 rounded-full bg-muted">
                    <Icon name="Clock" size={14} color={step?.color} />
                    <span style={{ color: step?.color }}>{step?.duration}</span>
                  </div>
                </div>

                {index < steps?.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <Icon name="ArrowRight" size={24} color={step?.color} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 md:mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm md:text-base text-muted-foreground bg-muted px-6 py-3 rounded-full">
            <Icon name="Info" size={20} color="var(--color-primary)" />
            <span>{t('howItWorks.averageTime')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;