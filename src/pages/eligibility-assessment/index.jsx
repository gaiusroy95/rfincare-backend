import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { getLoanProductBySlug } from '../../constants/loanProducts';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
import SEO from '../../components/SEO';
import EligibilityCalculatorFlow from '../../components/eligibility/EligibilityCalculatorFlow';

const EligibilityAssessment = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const prefillProduct = getLoanProductBySlug(searchParams.get('loanType'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MarketingPageShell
      title="Check Your Loan Eligibility"
      subtitle="Verify your contact details, enter your loan information, then see your eligibility result on this page."
    >
      <SEO title="Check Your Loan Eligibility" description="Verify your contact and check loan eligibility with Rfincare." />
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rf-filter-card">
            <EligibilityCalculatorFlow
              defaultLoanType={prefillProduct?.apiKey || ''}
              initialQuickCheck={location.state?.quickCheck || null}
            />
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
};

export default EligibilityAssessment;
