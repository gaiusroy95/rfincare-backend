import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { openAssessmentOrEligibilityFirst } from '../../../utils/eligibilityGate';
import EligibilityCalculatorFlow from '../../../components/eligibility/EligibilityCalculatorFlow';

const QuickEligibilityCheck = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-muted py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Check Your Eligibility in 60 Seconds
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Verify your contact details, enter your loan information, and see your eligibility result — all on this page
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg p-6 md:p-8 lg:p-10 border border-border">
          <EligibilityCalculatorFlow
            embedded
            onFullApplication={() => {
              openAssessmentOrEligibilityFirst(navigate, {
                state: { fromApply: true },
              });
            }}
          />

          <div className="flex items-center justify-center space-x-2 text-xs md:text-sm text-muted-foreground pt-6 mt-2 border-t border-border">
            <Icon name="Lock" size={16} />
            <span>Your information is secure and confidential</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickEligibilityCheck;
