import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Select Bank', icon: 'Building2' },
    { id: 2, label: 'Review Consent', icon: 'FileCheck' },
    { id: 3, label: 'Verify Identity', icon: 'ShieldCheck' },
    { id: 4, label: 'Confirmation', icon: 'CheckCircle2' }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10 hidden md:block">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps?.length - 1)) * 100}%` }}
          />
        </div>

        {steps?.map((step, index) => (
          <div key={step?.id} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                step?.id < currentStep
                  ? 'bg-success text-white'
                  : step?.id === currentStep
                  ? 'bg-primary text-white shadow-lg scale-110'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step?.id < currentStep ? (
                <Icon name="Check" size={20} />
              ) : (
                <Icon name={step?.icon} size={20} />
              )}
            </div>
            <span
              className={`mt-2 text-xs md:text-sm font-medium text-center transition-colors ${
                step?.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {step?.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;