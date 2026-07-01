import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { getLoanProductBySlug } from '../../constants/loanProducts';
import Header from '../../components/ui/Header';
import SEO from '../../components/SEO';
import Footer from '../homepage/components/Footer';
import EligibilityCalculatorFlow from '../../components/eligibility/EligibilityCalculatorFlow';

const EligibilityAssessment = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const prefillProduct = getLoanProductBySlug(searchParams.get('loanType'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Check Your Loan Eligibility" description="Verify your contact and check loan eligibility with Rfincare." />
      <Header />
      <main>
        <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Check Your Loan Eligibility</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Verify your contact details, enter your loan information, then see your eligibility result on this page
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
              <EligibilityCalculatorFlow
                defaultLoanType={prefillProduct?.apiKey || ''}
                initialQuickCheck={location.state?.quickCheck || null}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EligibilityAssessment;
