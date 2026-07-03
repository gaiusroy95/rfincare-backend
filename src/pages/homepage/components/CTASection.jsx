import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { openAssessmentOrEligibilityFirst } from '../../../utils/eligibilityGate';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[var(--color-brand-green-dark)] text-white py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
            Ready to Transform Your Financial Future?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto mb-8 md:mb-10">
            Join thousands of satisfied customers who've achieved their financial goals with Rfincare. Start your journey today with our intelligent loan matching platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 md:mb-12">
            <Button
              variant="default"
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg text-base md:text-lg px-8 py-4"
              iconName="ArrowRight"
              iconPosition="right"
              onClick={() => openAssessmentOrEligibilityFirst(navigate)}
            >
              Start Your Application
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white/10 text-base md:text-lg px-8 py-4"
              iconName="Calculator"
              iconPosition="left"
              onClick={() => navigate('/eligibility-assessment')}
            >
              Calculate Eligibility
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Icon name="Zap" size={24} color="white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold">Fast Approval</h3>
              <p className="text-xs md:text-sm text-white/80">Get decisions in 24-48 hours</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Icon name="Shield" size={24} color="white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold">100% Secure</h3>
              <p className="text-xs md:text-sm text-white/80">Bank-level encryption</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Icon name="IndianRupee" size={24} color="white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold">No Hidden Fees</h3>
              <p className="text-xs md:text-sm text-white/80">Completely free for customers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;