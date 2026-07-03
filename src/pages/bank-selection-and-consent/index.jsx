import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import MarketingPageShell from '../../components/layout/MarketingPageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BankSelectionCard from './components/BankSelectionCard';
import ConsentSection from './components/ConsentSection';
import OTPVerification from './components/OTPVerification';
import ProgressSteps from './components/ProgressSteps';
import ConfirmationScreen from './components/ConfirmationScreen';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService } from '../../services/applicationService';
import { bankService } from '../../services/apiServices';
import { getBankLogoAlt, getBankLogoUrl } from '../../utils/bankBranding';

const BankSelectionAndConsent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [consents, setConsents] = useState({});
  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    loadBanks();
    initializeApplication();
  }, []);

  useEffect(() => {
    const preSelectedBank = location?.state?.selectedBank;
    if (preSelectedBank) {
      setSelectedBankId(preSelectedBank?.id);
      setSelectedBank(preSelectedBank);
    }
  }, [location?.state]);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const data = await bankService?.getAllBanks();
      
      const transformedBanks = data?.map(bank => {
        const products = bank?.bankProducts || [];
        const primaryProduct = products?.[0] || {};
        
        return {
          id: bank?.id,
          name: bank?.name,
          logo: getBankLogoUrl(bank),
          logoAlt: getBankLogoAlt(bank),
          description: `Trusted financial institution offering competitive loan products.`,
          interestRate: primaryProduct?.interestRateMin || 8.0,
          processingTime: '3-5 business days',
          approvalProbability: 85
        };
      });
      
      setBanks(transformedBanks);
    } catch (err) {
      console.error('Failed to load banks:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeApplication = async () => {
    try {
      // Create draft application
      const { data, error } = await applicationService?.createApplication({
        firstName: user?.user_metadata?.full_name?.split(' ')?.[0] || 'Customer',
        lastName: user?.user_metadata?.full_name?.split(' ')?.slice(1)?.join(' ') || '',
        email: user?.email || '',
        phone: user?.user_metadata?.phone || '+91 0000000000',
        dateOfBirth: new Date('1990-01-01'),
        addressLine1: 'Address',
        city: 'City',
        state: 'State',
        pinCode: '000000',
        employmentType: 'salaried',
        annualIncome: 500000,
        monthlyIncome: 41667,
        loanPurpose: 'home_loan',
        requestedLoanAmount: 2500000
      });

      if (error) throw error;
      setApplicationId(data?.id);
      setApplicationData(data);
    } catch (err) {
      console.error('Failed to create application:', err);
    }
  };

  const validateConsents = () => {
    const newErrors = {};
    const requiredConsents = ['dataSharing', 'creditCheck', 'termsConditions', 'privacyPolicy'];

    requiredConsents?.forEach((consentId) => {
      if (!consents?.[consentId]) {
        newErrors[consentId] = 'This consent is required to proceed';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleConsentChange = (consentId, checked) => {
    setConsents((prev) => ({ ...prev, [consentId]: checked }));
    if (errors?.[consentId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors?.[consentId];
        return newErrors;
      });
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!selectedBankId) {
        alert('Please select a bank to continue');
        return;
      }
      
      // Find and set selected bank
      const bank = banks?.find(b => b?.id === selectedBankId);
      setSelectedBank(bank);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateConsents()) {
        // Save consents to database
        const { error } = await applicationService?.saveConsents(applicationId, consents);
        if (error) {
          console.error('Failed to save consents:', error);
          alert('Failed to save consents. Please try again.');
          return;
        }
        
        // Send OTP
        const { error: otpError } = await applicationService?.sendOTP(
          applicationData?.phone || user?.user_metadata?.phone || '+91 0000000000',
          applicationData?.email || user?.email,
          applicationId
        );
        
        if (otpError) {
          console.error('Failed to send OTP:', otpError);
        }
        
        setCurrentStep(3);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOTPVerify = async (otpValue) => {
    setIsVerifying(true);

    try {
      const { success, error } = await applicationService?.verifyOTP(applicationId, otpValue);
      
      if (!success) {
        alert(error?.message || 'Invalid OTP. Please try again.');
        setIsVerifying(false);
        return;
      }

      // Submit application
      const { data, error: submitError } = await applicationService?.submitApplication(
        applicationId,
        selectedBankId
      );

      if (submitError) {
        alert('Failed to submit application. Please try again.');
        setIsVerifying(false);
        return;
      }

      setApplicationData(data);
      setCurrentStep(4);
    } catch (err) {
      alert('Verification failed. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    const { error } = await applicationService?.sendOTP(
      applicationData?.phone || user?.user_metadata?.phone || '+91 0000000000',
      applicationData?.email || user?.email,
      applicationId
    );
    
    if (error) {
      console.error('Failed to resend OTP:', error);
      alert('Failed to resend OTP. Please try again.');
    } else {
      alert('OTP sent successfully!');
    }
  };

  const handleDownloadConfirmation = () => {
    console.log('Downloading confirmation for application:', applicationData?.applicationNumber);
    alert('Confirmation PDF downloaded successfully!');
  };

  const handleContinueToQuestionnaire = () => {
    navigate('/additional-questionnaire', {
      state: {
        applicationId: applicationData?.id,
        selectedBank,
        customerData: applicationData
      }
    });
  };

  const handleBackToMarketplace = () => {
    navigate('/bank-marketplace');
  };

  if (loading) {
    return (
      <MarketingPageShell title="Bank Selection & Consent" subtitle="Loading your application…">
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      </MarketingPageShell>
    );
  }

  return (
    <MarketingPageShell
      title="Bank Selection & Consent"
      subtitle="Complete your loan application by selecting a bank and providing necessary consents"
    >
      <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page actions */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={handleBackToMarketplace}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">

            <Icon name="ArrowLeft" size={16} />
            Back to Bank Marketplace
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
            <div className="flex items-center gap-3 p-3 md:p-4 rf-sidebar-widget">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Applicant</p>
                <p className="text-sm md:text-base font-semibold text-foreground">
                  {user?.user_metadata?.full_name || 'Customer'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 md:mb-8 bg-card border border-border rounded-xl p-4 md:p-6">
          <ProgressSteps currentStep={currentStep} />
        </div>

        {/* Application Summary */}
        {currentStep < 4 && applicationData &&
        <div className="mb-6 md:mb-8 bg-emerald-50 border border-emerald-200 rounded-xl p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="FileText" size={20} className="text-primary" />
              Application Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Loan Type</p>
                <p className="text-sm md:text-base font-semibold text-foreground">
                  {applicationData?.loanPurpose?.replace('_', ' ')?.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Loan Amount</p>
                <p className="text-sm md:text-base font-semibold text-foreground">
                  ₹{applicationData?.requestedLoanAmount?.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
                <p className="text-sm md:text-base font-semibold text-foreground">
                  ₹{applicationData?.monthlyIncome?.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Contact</p>
                <p className="text-sm md:text-base font-semibold text-foreground">
                  {applicationData?.email}
                </p>
              </div>
            </div>
          </div>
        }

        {/* Step Content */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8">
          {currentStep === 1 &&
          <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Select Your Preferred Bank
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Choose the bank that best matches your requirements. You can review their terms and interest rates below.
                </p>
              </div>

              <div className="space-y-4">
                {banks?.map((bank) =>
              <BankSelectionCard
                key={bank?.id}
                bank={bank}
                isSelected={selectedBankId === bank?.id}
                onSelect={() => setSelectedBankId(bank?.id)} />

              )}
              </div>

              {selectedBankId &&
            <div className="flex items-start gap-3 p-4 bg-success/5 border border-success/20 rounded-lg animate-fade-in">
                  <Icon name="CheckCircle2" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm md:text-base font-medium text-foreground mb-1">
                      Bank Selected Successfully
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      You've selected {selectedBank?.name}. Click continue to review and provide necessary consents.
                    </p>
                  </div>
                </div>
            }
            </div>
          }

          {currentStep === 2 &&
          <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Review and Provide Consents
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Please review and accept the following terms to proceed with your loan application to {selectedBank?.name}.
                </p>
              </div>

              <ConsentSection
              consents={consents}
              onConsentChange={handleConsentChange}
              errors={errors} />

            </div>
          }

          {currentStep === 3 &&
          <div>
              <OTPVerification
              phoneNumber={applicationData?.phone || user?.user_metadata?.phone || '+91 0000000000'}
              email={applicationData?.email || user?.email}
              onVerify={handleOTPVerify}
              onResend={handleResendOTP}
              isVerifying={isVerifying} />

            </div>
          }

          {currentStep === 4 &&
          <ConfirmationScreen
            selectedBank={selectedBank}
            applicationId={applicationId}
            onContinue={handleContinueToQuestionnaire}
            onDownload={handleDownloadConfirmation} />

          }

          {/* Navigation Buttons */}
          {currentStep < 4 &&
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-6 md:mt-8 pt-6 border-t border-border">
              {currentStep > 1 &&
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={handlePreviousStep}
              iconName="ArrowLeft"
              iconPosition="left">

                  Previous Step
                </Button>
            }
              {currentStep < 3 &&
            <Button
              variant="default"
              size="lg"
              fullWidth
              onClick={handleNextStep}
              iconName="ArrowRight"
              iconPosition="right">

                  {currentStep === 1 ? 'Continue to Consent' : 'Proceed to Verification'}
                </Button>
            }
            </div>
          }
        </div>

        {/* Help Section */}
        {currentStep < 4 &&
        <div className="mt-6 md:mt-8 bg-muted/50 border border-border rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="HelpCircle" size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If you have any questions about the consent process or need assistance, our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" size="sm" iconName="Phone" iconPosition="left">
                    Call Support
                  </Button>
                  <Button variant="outline" size="sm" iconName="MessageCircle" iconPosition="left">
                    Live Chat
                  </Button>
                  <Button variant="outline" size="sm" iconName="Mail" iconPosition="left">
                    Email Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
      </section>
    </MarketingPageShell>
  );

};

export default BankSelectionAndConsent;