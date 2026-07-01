import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { getLoanProductBySlug } from '../../../constants/loanProducts';
import { CREDIT_SCORE_RANGE_OPTIONS } from '../../../constants/creditScoreRanges';
import { useLoanProducts } from '../../../contexts/LoanProductsContext';
import { openAssessmentOrEligibilityFirst } from '../../../utils/eligibilityGate';

const QuickEligibilityCheck = () => {
  const navigate = useNavigate();
  const { products: loanProducts } = useLoanProducts();
  const [formData, setFormData] = useState({
    loanAmount: '',
    loanType: '',
    monthlyIncome: '',
    totalEmi: '',
    creditScore: ''
  });

  const loanTypes = (Array.isArray(loanProducts) ? loanProducts : [])
    .filter((p) => p?.slug)
    .map((p) => ({ value: p.slug, label: p.label }));

  const creditScoreRanges = CREDIT_SCORE_RANGE_OPTIONS;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (formData.loanType) {
      navigate(`/eligibility-assessment?loanType=${formData.loanType}`, { state: { quickCheck: formData } });
    } else {
      navigate('/eligibility-assessment', { state: { quickCheck: formData } });
    }
  };

  return (
    <section className="bg-muted py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Check Your Eligibility in 60 Seconds
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant insights into your loan approval chances with our intelligent eligibility calculator
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg p-6 md:p-8 lg:p-10 border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Loan Amount Needed"
                type="number"
                placeholder="Enter amount"
                value={formData?.loanAmount}
                onChange={(e) => setFormData({ ...formData, loanAmount: e?.target?.value })}
                required
              />

              <Select
                label="Loan Type"
                placeholder="Select loan type"
                options={loanTypes}
                value={formData?.loanType}
                onChange={(value) => setFormData({ ...formData, loanType: value })}
                required
              />

              <Input
                label="Monthly Income"
                type="number"
                placeholder="Enter monthly income"
                value={formData?.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e?.target?.value })}
                required
              />

              <Input
                label="Total EMI"
                type="number"
                placeholder="Enter total EMI"
                value={formData?.totalEmi}
                onChange={(e) => setFormData({ ...formData, totalEmi: e?.target?.value })}
                required
              />

              <Select
                label="Credit Score Range"
                placeholder="Select credit score"
                options={creditScoreRanges}
                value={formData?.creditScore}
                onChange={(value) => setFormData({ ...formData, creditScore: value })}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="flex-1"
                iconName="Calculator"
                iconPosition="left"
              >
                Check Eligibility
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                iconName="FileText"
                iconPosition="left"
                onClick={() => {
                  const product = formData.loanType ? getLoanProductBySlug(formData.loanType) : null;
                  openAssessmentOrEligibilityFirst(navigate, {
                    loanType: product?.slug || formData.loanType,
                    state: {
                      quickCheck: {
                        ...formData,
                        loanType: product?.apiKey || formData.loanType,
                      },
                    },
                  });
                }}
              >
                Full Application
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs md:text-sm text-muted-foreground pt-2">
              <Icon name="Lock" size={16} />
              <span>Your information is secure and confidential</span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default QuickEligibilityCheck;