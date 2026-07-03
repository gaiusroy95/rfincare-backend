import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ currentStep, totalSteps, steps, onStepClick }) => {
  const safeStep = Math.min(Math.max(0, currentStep), Math.max(0, totalSteps - 1));
  const progressPercentage = ((safeStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full mb-8 md:mb-10 lg:mb-12">
      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden mb-6 md:mb-8">
        <div
          className="absolute top-0 left-0 h-full bg-[var(--color-brand-green)] transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      {/* Step Indicators */}
      <div className="flex justify-between items-start">
        {steps?.map((step, index) => {
          const isCompleted = index < safeStep;
          const isCurrent = index === safeStep;
          const isPending = index > safeStep;
          const canGoBack = isCompleted && typeof onStepClick === 'function';

          return (
            <div
              key={step?.id}
              className={`flex flex-col items-center flex-1 relative ${canGoBack ? 'cursor-pointer' : ''}`}
              role={canGoBack ? 'button' : undefined}
              tabIndex={canGoBack ? 0 : undefined}
              onClick={() => canGoBack && onStepClick(index)}
              onKeyDown={(e) => {
                if (canGoBack && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onStepClick(index);
                }
              }}
            >
              {/* Connector Line */}
              {index < steps?.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 transition-colors duration-300 ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
              {/* Step Circle */}
              <div
                className={`form-step-indicator ${
                  isCompleted ? 'completed' : isCurrent ? 'active' : 'pending'
                } w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mb-2 md:mb-3`}
              >
                {isCompleted ? (
                  <Icon name="Check" size={16} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                ) : (
                  <span className="text-xs md:text-sm lg:text-base font-semibold">{index + 1}</span>
                )}
              </div>
              {/* Step Label */}
              <div className="text-center max-w-[80px] md:max-w-[100px] lg:max-w-[120px]">
                <p
                  className={`text-xs md:text-sm lg:text-base font-medium transition-colors duration-300 ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                  }`}
                >
                  {step?.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Current Step Description */}
      <div className="mt-6 md:mt-8 text-center">
        <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
          {steps?.[safeStep]?.description}
        </p>
      </div>
    </div>
  );
};

export default ProgressIndicator;