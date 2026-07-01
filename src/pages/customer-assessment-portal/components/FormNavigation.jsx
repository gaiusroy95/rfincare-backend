import React from 'react';
import Button from '../../../components/ui/Button';

const FormNavigation = ({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext, 
  onSave,
  isValid,
  isSaving,
  nextLabel,
  submitLabel,
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const primaryLabel = isLastStep
    ? (submitLabel || 'Submit Application')
    : (nextLabel || 'Next Step');

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 md:mt-10 lg:mt-12 pt-6 md:pt-8 border-t border-border">
      {/* Previous Button */}
      <div className="w-full sm:w-auto order-2 sm:order-1">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onPrevious}
            iconName="ChevronLeft"
            iconPosition="left"
            fullWidth
            className="sm:w-auto"
          >
            Previous Step
          </Button>
        )}
      </div>

      {/* Save Progress Button */}
      <div className="w-full sm:w-auto order-1 sm:order-2">
        <Button
          variant="ghost"
          onClick={onSave}
          loading={isSaving}
          iconName="Save"
          iconPosition="left"
          fullWidth
          className="sm:w-auto"
        >
          {isSaving ? 'Saving...' : 'Save Progress'}
        </Button>
      </div>

      {/* Next/Submit Button */}
      <div className="w-full sm:w-auto order-3">
        <Button
          variant="default"
          onClick={onNext}
          disabled={!isValid}
          iconName={isLastStep ? 'Check' : 'ChevronRight'}
          iconPosition="right"
          fullWidth
          className="sm:w-auto"
        >
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
};

export default FormNavigation;