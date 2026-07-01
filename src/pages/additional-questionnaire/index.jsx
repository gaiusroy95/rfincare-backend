import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import QuestionSection from './components/QuestionSection';
import ProgressTracker from './components/ProgressTracker';
import BankRequirementCard from './components/BankRequirementCard';
import ContextBanner from './components/ContextBanner';
import NavigationButtons from './components/NavigationButtons';

const AdditionalQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const mockApplicationData = {
    loanType: "Home Loan",
    loanAmount: 350000,
    selectedBanks: [
    {
      id: 1,
      name: "Chase Bank",
      logo: "https://img.rocket.new/generatedImages/rocket_gen_img_16dd95acd-1766984880228.png",
      logoAlt: "Chase Bank logo with blue octagonal shape on white background",
      requirement: "Employment verification and asset documentation required"
    },
    {
      id: 2,
      name: "Wells Fargo",
      logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1baf9ebe7-1764637918207.png",
      logoAlt: "Wells Fargo stagecoach logo in red and yellow colors",
      requirement: "Additional income sources and property details needed"
    }]

  };

  const questionSections = [
  {
    id: "employment",
    title: "Employment Verification",
    description: "Detailed information about your current employment status",
    icon: "Briefcase",
    color: "var(--color-primary)",
    questions: [
    {
      id: "employer_name",
      type: "text",
      label: "Current Employer Name",
      description: "Full legal name of your employer",
      placeholder: "e.g., ABC Corporation",
      required: true
    },
    {
      id: "job_title",
      type: "text",
      label: "Job Title/Position",
      description: "Your current role or designation",
      placeholder: "e.g., Senior Software Engineer",
      required: true
    },
    {
      id: "employment_type",
      type: "select",
      label: "Employment Type",
      description: "Select your employment classification",
      placeholder: "Choose employment type",
      required: true,
      options: [
      { value: "full_time", label: "Full-Time Permanent" },
      { value: "part_time", label: "Part-Time" },
      { value: "contract", label: "Contract/Temporary" },
      { value: "self_employed", label: "Self-Employed" },
      { value: "retired", label: "Retired" }]

    },
    {
      id: "years_employed",
      type: "number",
      label: "Years with Current Employer",
      description: "Total years at your current position",
      placeholder: "e.g., 5",
      required: true
    },
    {
      id: "employer_phone",
      type: "tel",
      label: "Employer Contact Number",
      description: "HR or verification department phone number",
      placeholder: "(555) 123-4567",
      required: true
    },
    {
      id: "supervisor_name",
      type: "text",
      label: "Supervisor/Manager Name",
      description: "Direct supervisor for employment verification",
      placeholder: "e.g., John Smith",
      required: false
    }]

  },
  {
    id: "income",
    title: "Income & Assets",
    description: "Additional income sources and asset information",
    icon: "IndianRupee",
    color: "var(--color-success)",
    questions: [
    {
      id: "additional_income",
      type: "checkbox",
      label: "I have additional sources of income",
      description: "Check if you have income beyond your primary employment",
      required: false
    },
    {
      id: "additional_income_sources",
      type: "textarea",
      label: "Additional Income Sources",
      description: "List all additional income sources (rental, investments, etc.)",
      placeholder: "e.g., Rental income from property: ₹2,000/month\nInvestment dividends: ₹500/month",
      required: false
    },
    {
      id: "monthly_additional_income",
      type: "number",
      label: "Total Monthly Additional Income",
      description: "Combined monthly income from all additional sources",
      placeholder: "e.g., 2500",
      required: false
    },
    {
      id: "savings_amount",
      type: "number",
      label: "Total Savings Balance",
      description: "Combined balance across all savings accounts",
      placeholder: "e.g., 50000",
      required: true
    },
    {
      id: "investment_portfolio",
      type: "number",
      label: "Investment Portfolio Value",
      description: "Total value of stocks, bonds, mutual funds, etc.",
      placeholder: "e.g., 75000",
      required: false
    },
    {
      id: "real_estate_owned",
      type: "checkbox",
      label: "I own other real estate properties",
      description: "Check if you own property beyond your primary residence",
      required: false
    }]

  },
  {
    id: "property",
    title: "Property Details",
    description: "Information about the property for your home loan",
    icon: "Home",
    color: "var(--color-secondary)",
    questions: [
    {
      id: "property_type",
      type: "select",
      label: "Property Type",
      description: "Type of property you\'re purchasing",
      placeholder: "Select property type",
      required: true,
      options: [
      { value: "single_family", label: "Single Family Home" },
      { value: "condo", label: "Condominium" },
      { value: "townhouse", label: "Townhouse" },
      { value: "multi_family", label: "Multi-Family (2-4 units)" },
      { value: "land", label: "Land/Lot" }]

    },
    {
      id: "property_address",
      type: "text",
      label: "Property Address",
      description: "Full address of the property",
      placeholder: "e.g., 123 Main Street, City, State, ZIP",
      required: true
    },
    {
      id: "property_value",
      type: "number",
      label: "Estimated Property Value",
      description: "Current market value or purchase price",
      placeholder: "e.g., 450000",
      required: true
    },
    {
      id: "down_payment",
      type: "number",
      label: "Down Payment Amount",
      description: "Amount you plan to pay as down payment",
      placeholder: "e.g., 90000",
      required: true
    },
    {
      id: "property_use",
      type: "select",
      label: "Intended Property Use",
      description: "How you plan to use the property",
      placeholder: "Select intended use",
      required: true,
      options: [
      { value: "primary", label: "Primary Residence" },
      { value: "secondary", label: "Secondary/Vacation Home" },
      { value: "investment", label: "Investment/Rental Property" }]

    },
    {
      id: "occupancy_timeline",
      type: "select",
      label: "When will you occupy the property?",
      description: "Expected move-in timeline",
      placeholder: "Select timeline",
      required: true,
      options: [
      { value: "immediate", label: "Within 30 days" },
      { value: "60_days", label: "Within 60 days" },
      { value: "90_days", label: "Within 90 days" },
      { value: "later", label: "More than 90 days" }]

    }]

  },
  {
    id: "financial",
    title: "Financial Obligations",
    description: "Current debts and financial commitments",
    icon: "CreditCard",
    color: "var(--color-warning)",
    questions: [
    {
      id: "existing_mortgage",
      type: "checkbox",
      label: "I have an existing mortgage",
      description: "Check if you currently have a mortgage on another property",
      required: false
    },
    {
      id: "monthly_mortgage_payment",
      type: "number",
      label: "Current Monthly Mortgage Payment",
      description: "If applicable, your current mortgage payment",
      placeholder: "e.g., 1500",
      required: false
    },
    {
      id: "auto_loans",
      type: "number",
      label: "Monthly Auto Loan Payments",
      description: "Combined monthly payments for all vehicle loans",
      placeholder: "e.g., 450",
      required: false
    },
    {
      id: "student_loans",
      type: "number",
      label: "Monthly Student Loan Payments",
      description: "Total monthly student loan obligations",
      placeholder: "e.g., 300",
      required: false
    },
    {
      id: "credit_card_debt",
      type: "number",
      label: "Total Credit Card Debt",
      description: "Combined balance across all credit cards",
      placeholder: "e.g., 5000",
      required: false
    },
    {
      id: "other_obligations",
      type: "textarea",
      label: "Other Financial Obligations",
      description: "List any other monthly financial commitments",
      placeholder: "e.g., Child support: ₹800/month\nPersonal loan: ₹200/month",
      required: false
    }]

  },
  {
    id: "references",
    title: "References & Authorization",
    description: "Personal references and verification consent",
    icon: "Users",
    color: "var(--color-accent)",
    questions: [
    {
      id: "reference1_name",
      type: "text",
      label: "Reference 1 - Full Name",
      description: "Non-family member who can verify your character",
      placeholder: "e.g., Jane Doe",
      required: true
    },
    {
      id: "reference1_phone",
      type: "tel",
      label: "Reference 1 - Phone Number",
      description: "Contact number for first reference",
      placeholder: "(555) 123-4567",
      required: true
    },
    {
      id: "reference1_relationship",
      type: "text",
      label: "Reference 1 - Relationship",
      description: "How you know this person",
      placeholder: "e.g., Former colleague",
      required: true
    },
    {
      id: "reference2_name",
      type: "text",
      label: "Reference 2 - Full Name",
      description: "Second non-family reference",
      placeholder: "e.g., Robert Johnson",
      required: true
    },
    {
      id: "reference2_phone",
      type: "tel",
      label: "Reference 2 - Phone Number",
      description: "Contact number for second reference",
      placeholder: "(555) 987-6543",
      required: true
    },
    {
      id: "reference2_relationship",
      type: "text",
      label: "Reference 2 - Relationship",
      description: "How you know this person",
      placeholder: "e.g., Long-time friend",
      required: true
    },
    {
      id: "authorization_consent",
      type: "checkbox",
      label: "I authorize the verification of all information provided",
      description: "Required to proceed with loan application processing",
      required: true
    },
    {
      id: "credit_check_consent",
      type: "checkbox",
      label: "I consent to credit report inquiries",
      description: "Banks will perform credit checks as part of the approval process",
      required: true
    }]

  }];


  const currentSection = questionSections?.[currentSectionIndex];
  const completedSections = currentSectionIndex;
  const totalSections = questionSections?.length;
  const estimatedTime = (totalSections - completedSections) * 3;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSectionIndex]);

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value
    }));

    if (errors?.[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors?.[questionId];
        return newErrors;
      });
    }
  };

  const validateSection = () => {
    const newErrors = {};
    const requiredQuestions = currentSection?.questions?.filter((q) => q?.required);

    requiredQuestions?.forEach((question) => {
      const value = responses?.[question?.id];
      if (!value || typeof value === 'string' && value?.trim() === '') {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (!validateSection()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentSectionIndex < questionSections?.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  const handleSaveDraft = () => {
    console.log('Draft saved:', responses);
    alert('Your progress has been saved successfully!');
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/document-management-center');
  };

  const canProceed = currentSection?.questions?.filter((q) => q?.required)?.every((q) => responses?.[q?.id] && responses?.[q?.id] !== '');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => navigate('/bank-selection-and-consent')}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">

            <Icon name="ArrowLeft" size={16} />
            <span>Back to Bank Selection</span>
          </button>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Additional Questionnaire
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Complete the required information for your selected banks
          </p>
        </div>

        <ContextBanner
          loanType={mockApplicationData?.loanType}
          loanAmount={mockApplicationData?.loanAmount} />


        <div className="mb-6 md:mb-8">
          <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
            Selected Banks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {mockApplicationData?.selectedBanks?.map((bank) =>
            <BankRequirementCard key={bank?.id} bank={bank} />
            )}
          </div>
        </div>

        <ProgressTracker
          currentSection={currentSectionIndex + 1}
          totalSections={totalSections}
          completedSections={completedSections}
          estimatedTime={estimatedTime} />


        <QuestionSection
          section={currentSection}
          responses={responses}
          onResponseChange={handleResponseChange}
          errors={errors} />


        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          isFirstSection={currentSectionIndex === 0}
          isLastSection={currentSectionIndex === questionSections?.length - 1}
          isSubmitting={isSubmitting}
          canProceed={canProceed} />

      </main>
      {showSuccessModal &&
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-card rounded-lg p-6 md:p-8 max-w-md w-full animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <Icon name="CheckCircle2" size={40} color="var(--color-success)" />
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                Questionnaire Submitted!
              </h3>
              
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Your additional information has been successfully submitted. You can now proceed to upload the required documents.
              </p>

              <Button
              variant="success"
              onClick={handleSuccessClose}
              iconName="ArrowRight"
              iconPosition="right"
              fullWidth>

                Continue to Document Upload
              </Button>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default AdditionalQuestionnaire;