import React from 'react';
import Button from '../../../components/ui/Button';

const NavigationButtons = ({ 
  onBack, 
  onNext, 
  onSaveDraft,
  isFirstSection,
  isLastSection,
  isSubmitting,
  canProceed
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 md:mt-8">
      <div className="flex items-center space-x-3">
        {!isFirstSection && (
          <Button
            variant="outline"
            onClick={onBack}
            iconName="ChevronLeft"
            iconPosition="left"
            disabled={isSubmitting}
          >
            Previous
          </Button>
        )}
        
        <Button
          variant="ghost"
          onClick={onSaveDraft}
          iconName="Save"
          iconPosition="left"
          disabled={isSubmitting}
        >
          Save Draft
        </Button>
      </div>

      <Button
        variant={isLastSection ? "success" : "default"}
        onClick={onNext}
        iconName={isLastSection ? "Check" : "ChevronRight"}
        iconPosition="right"
        disabled={!canProceed || isSubmitting}
        loading={isSubmitting}
      >
        {isLastSection ? "Submit Questionnaire" : "Continue"}
      </Button>
    </div>
  );
};

export default NavigationButtons;