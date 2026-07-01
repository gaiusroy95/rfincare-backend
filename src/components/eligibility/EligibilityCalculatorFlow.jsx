import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeLoanApiKey } from '../../constants/loanProducts';
import { CREDIT_SCORE_RANGE_OPTIONS } from '../../constants/creditScoreRanges';
import { useLoanProducts } from '../../contexts/LoanProductsContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import EligibilityLeadGate from '../../pages/eligibility-assessment/components/EligibilityLeadGate';
import { customerJourneyService } from '../../services/customerJourneyService';
import { homepageService } from '../../services/homepageService';
import { leadService, saveEligibilityResults } from '../../services/leadService';
import { apiClient } from '../../lib/apiClient';
import { getApiErrorMessage } from '../../lib/apiErrors';

const EMPLOYMENT_TYPES = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'professional', label: 'Professional' },
];

function resolveUserRole(user, userProfile) {
  return userProfile?.role || user?.role || null;
}

/**
 * Unified eligibility flow: contact verification → loan details → inline result.
 * Used on the homepage widget and the dedicated eligibility page.
 */
export default function EligibilityCalculatorFlow({
  initialQuickCheck = null,
  defaultLoanType = '',
  embedded = false,
  onFullApplication,
}) {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { products: loanProducts } = useLoanProducts();
  const role = resolveUserRole(user, userProfile);
  const isLoggedInCustomer = role === 'customer';
  const needsLeadGate = !isLoggedInCustomer;

  const [leadVerified, setLeadVerified] = useState(!needsLeadGate);
  const [leadMeta, setLeadMeta] = useState(null);
  const [formData, setFormData] = useState({
    loanType: defaultLoanType || '',
    loanAmount: '',
    monthlyIncome: '',
    employmentType: '',
    creditScore: '',
    existingLoans: '',
  });
  const [calculatedResult, setCalculatedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const canShowLoanForm = !needsLeadGate || leadVerified;

  const loanTypes = (Array.isArray(loanProducts) ? loanProducts : [])
    .filter((p) => p?.apiKey)
    .map((p) => ({ value: p.apiKey, label: p.label }));

  useEffect(() => {
    if (!canShowLoanForm || !initialQuickCheck) return;
    setFormData((prev) => ({
      ...prev,
      loanType: normalizeLoanApiKey(initialQuickCheck.loanType) || prev.loanType,
      loanAmount: initialQuickCheck.loanAmount || prev.loanAmount,
      monthlyIncome: initialQuickCheck.monthlyIncome || prev.monthlyIncome,
      creditScore: initialQuickCheck.creditScore || prev.creditScore,
      existingLoans: initialQuickCheck.totalEmi || initialQuickCheck.existingLoans || prev.existingLoans,
    }));
  }, [canShowLoanForm, initialQuickCheck]);

  useEffect(() => {
    if (defaultLoanType && !formData.loanType) {
      setFormData((prev) => ({ ...prev, loanType: defaultLoanType }));
    }
  }, [defaultLoanType, formData.loanType]);

  const handleVerified = (meta) => {
    setLeadMeta(meta);
    setLeadVerified(true);
    setCalculatedResult(null);
    setFormError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const calculateEligibility = async (e) => {
    e?.preventDefault();
    setFormError('');

    if (needsLeadGate && !leadVerified) {
      setFormError('Please verify your mobile number and email above before checking eligibility.');
      return;
    }

    if (!formData.loanType || !formData.loanAmount || !formData.monthlyIncome || !formData.employmentType || !formData.creditScore) {
      setFormError('Please fill in all required loan details.');
      return;
    }

    const loanAmount = parseFloat(formData.loanAmount);
    const monthlyIncome = parseFloat(formData.monthlyIncome);
    const existingLoans = parseFloat(formData.existingLoans) || 0;

    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      setFormError('Please enter a valid loan amount.');
      return;
    }
    if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) {
      setFormError('Please enter a valid monthly income.');
      return;
    }

    setLoading(true);
    setCalculatedResult(null);

    try {
      const apiResult = await homepageService.calculateEligibility({
        loanType: formData.loanType,
        loanAmount,
        monthlyIncome,
        employmentType: formData.employmentType,
        creditScore: formData.creditScore,
        creditScoreRange: formData.creditScore,
        existingLoans,
      });

      const probability = apiResult.overallProbability ?? 0;
      const status = probability >= 80 ? 'high' : probability >= 60 ? 'medium' : 'low';

      const resultPayload = {
        score: probability,
        status,
        message: apiResult.message,
        eligibleAmount: apiResult.eligibleAmount,
        requestedAmount: loanAmount,
        banks: apiResult.banks || [],
        overallProbability: probability,
      };

      setCalculatedResult(resultPayload);
      try {
        saveEligibilityResults(resultPayload, formData);
      } catch {
        /* session storage optional */
      }

      if (leadMeta?.leadId) {
        try {
          await leadService.updateLead(leadMeta.leadId, {
            status: 'eligible_calculated',
            eligibilityScore: probability,
            eligibilityData: { ...resultPayload, formData },
          });
        } catch {
          /* optional */
        }
      }

      const assessmentPayload = {
        loanType: formData.loanType,
        loanAmount,
        monthlyIncome,
        employmentType: formData.employmentType,
        creditScoreRange: formData.creditScore,
        existingLoans,
        eligibilityScore: probability,
        eligibilityStatus: status,
        eligibleAmount: apiResult.eligibleAmount,
        message: apiResult.message,
        leadId: leadMeta?.leadId,
        bankResults: apiResult.banks,
      };

      try {
        if (isLoggedInCustomer) {
          await customerJourneyService?.createEligibilityAssessment(assessmentPayload);
        } else if (leadMeta?.leadId) {
          await apiClient.post('/eligibility-assessments', {
            loan_type: assessmentPayload.loanType,
            loan_amount: assessmentPayload.loanAmount,
            monthly_income: assessmentPayload.monthlyIncome,
            employment_type: assessmentPayload.employmentType,
            credit_score_range: assessmentPayload.creditScoreRange,
            existing_loans: assessmentPayload.existingLoans,
            eligibility_score: assessmentPayload.eligibilityScore,
            eligibility_status: assessmentPayload.eligibilityStatus,
            eligible_amount: assessmentPayload.eligibleAmount,
            lead_id: assessmentPayload.leadId,
            bank_results: assessmentPayload.bankResults,
          });
        }
      } catch {
        /* optional */
      }
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not calculate eligibility. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = () => {
    if (!calculatedResult) return;
    const slug = (Array.isArray(loanProducts) ? loanProducts : []).find(
      (p) => p.apiKey === formData.loanType,
    )?.slug;
    const qs = slug ? `?loanType=${slug}` : '';
    navigate(`/customer-assessment-portal${qs}`, {
      state: {
        quickCheck: {
          loanType: formData.loanType,
          loanAmount: formData.loanAmount,
          monthlyIncome: formData.monthlyIncome,
          employmentType: formData.employmentType,
          creditScore: formData.creditScore,
          creditScoreRange: formData.creditScore,
          existingLoans: formData.existingLoans,
        },
        leadMeta: leadMeta || undefined,
      },
    });
  };

  const stepLoan = needsLeadGate ? 2 : 1;
  const stepResult = needsLeadGate ? 3 : 2;

  return (
    <div className={embedded ? 'space-y-6' : 'space-y-8'}>
      {needsLeadGate && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
            Step 1 — Verify mobile &amp; email
          </p>
          <EligibilityLeadGate loanType={formData.loanType} onVerified={handleVerified} />
        </div>
      )}

      {canShowLoanForm ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
            Step {stepLoan} — Loan details
          </p>
          <form onSubmit={calculateEligibility} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Select
                label="Loan Type"
                placeholder="Select loan type"
                options={loanTypes}
                value={formData.loanType}
                onChange={(value) => setFormData({ ...formData, loanType: value })}
                required
              />
              <Input
                label="Loan Amount Needed (₹)"
                type="number"
                name="loanAmount"
                placeholder="Enter amount"
                value={formData.loanAmount}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Monthly Income (₹)"
                type="number"
                name="monthlyIncome"
                placeholder="Enter monthly income"
                value={formData.monthlyIncome}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Employment Type"
                placeholder="Select employment type"
                options={EMPLOYMENT_TYPES}
                value={formData.employmentType}
                onChange={(value) => setFormData({ ...formData, employmentType: value })}
                required
              />
              <Select
                label="Credit Score Range"
                placeholder="Select credit score"
                options={CREDIT_SCORE_RANGE_OPTIONS}
                value={formData.creditScore}
                onChange={(value) => setFormData({ ...formData, creditScore: value })}
                required
              />
              <Input
                label="Existing Monthly Loan EMI (₹)"
                type="number"
                name="existingLoans"
                placeholder="Enter existing EMI"
                value={formData.existingLoans}
                onChange={handleInputChange}
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                {formError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="flex-1"
                iconName="Calculator"
                iconPosition="left"
                disabled={loading || (needsLeadGate && !leadVerified)}
              >
                {loading ? 'Calculating...' : 'Check Eligibility'}
              </Button>
              {onFullApplication && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  iconName="FileText"
                  iconPosition="left"
                  disabled={needsLeadGate && !leadVerified}
                  onClick={onFullApplication}
                >
                  Full Application
                </Button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
          Complete Step 1 to verify your mobile number and email, then you can enter loan details.
        </p>
      )}

      {calculatedResult && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
            Step {stepResult} — Your result
          </p>
          <div className="p-6 bg-muted rounded-xl border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">Eligibility Result</h3>
              <div
                className={`px-4 py-2 rounded-full font-semibold ${
                  calculatedResult.status === 'high'
                    ? 'bg-green-100 text-green-800'
                    : calculatedResult.status === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {calculatedResult.status === 'high'
                  ? 'High Eligibility'
                  : calculatedResult.status === 'medium'
                    ? 'Medium Eligibility'
                    : 'Low Eligibility'}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Eligibility Score</span>
                <span className="text-2xl font-bold text-primary">{calculatedResult.score}/100</span>
              </div>

              <div className="w-full bg-muted-foreground/20 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    calculatedResult.status === 'high'
                      ? 'bg-green-500'
                      : calculatedResult.status === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, calculatedResult.score)}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-muted-foreground">Eligible Loan Amount</span>
                <span className="text-xl font-bold text-foreground">
                  ₹{calculatedResult.eligibleAmount?.toLocaleString('en-IN') ?? '—'}
                </span>
              </div>

              {calculatedResult.message && (
                <div className="bg-card p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{calculatedResult.message}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  variant="default"
                  size="lg"
                  className="flex-1"
                  iconName="ArrowRight"
                  iconPosition="right"
                  onClick={handleApplyNow}
                >
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  iconName="GitCompare"
                  iconPosition="left"
                  onClick={() => {
                    const slug = loanProducts.find((p) => p.apiKey === formData.loanType)?.slug;
                    navigate(
                      slug
                        ? `/product-comparison?loanType=${slug}#bank-comparison`
                        : '/product-comparison',
                    );
                  }}
                >
                  Compare bank offers
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
