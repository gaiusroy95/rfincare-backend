import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { apiClient, setAccessToken } from '../../lib/apiClient';
import { applicationService } from '../../services/apiServices';
import { applicationService as appService } from '../../services/applicationService';
import { useAuth } from '../../contexts/AuthContext';

import Header from '../../components/ui/Header';
import ProgressIndicator from './components/ProgressIndicator';
import FormNavigation from './components/FormNavigation';
import PersonalInfoForm from './components/PersonalInfoForm';
import AddressInfoForm from './components/AddressInfoForm';
import EmploymentInfoForm from './components/EmploymentInfoForm';
import FinancialInfoForm from './components/FinancialInfoForm';
import ReviewSubmitForm from './components/ReviewSubmitForm';
import DocumentUploadStep from './components/DocumentUploadStep';
import ConsentSignatureForm from './components/ConsentSignatureForm';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import BankPreferencesStep from './components/BankPreferencesStep';
import { getLoanPriorities, serializeLoanPriorities } from '../../utils/loanPriorities';
import Icon from '../../components/AppIcon';
import { leadService, loadEligibilityResults } from '../../services/leadService';
import { homepageService } from '../../services/homepageService';
import { buildEligibilityInputFromAssessment } from '../../utils/assessmentEligibility';
import {
  getAssessmentDocumentTypes,
  requiresCoApplicant,
} from '../../constants/assessmentDocuments';
import {
  createEmptyLoanRow,
  getCompleteExistingLoans,
  normalizeExistingLoans,
  serializeExistingLoansForPayload,
} from '../../utils/existingLoans';
import {
  FINANCIAL_HISTORY_INITIAL,
  FINANCIAL_HISTORY_QUESTIONS,
  isFinancialHistoryYes,
} from '../../constants/assessmentFinancialHistory';
import { agentApplicationService } from '../../services/agentApplicationService';
import AgentAssistedBanner from './components/AgentAssistedBanner';
import ApplicationConfirmation from './components/ApplicationConfirmation';
import {
  buildAssessmentEntryState,
  stripUnsafeFormFields,
} from '../../utils/assessmentFormData';
import { hasCompletedEligibilityCheck } from '../../utils/eligibilityGate';
import { calculateTotalMonthlyEmi, EMI_FORM_FIELDS } from '../../utils/calculateTotalMonthlyEmi';

const SESSION_KEY = 'loan_assessment_session';

const INITIAL_CO_APPLICANT = {
  firstName: '',
  lastName: '',
  relationship: '',
  phone: '',
  email: '',
  pan: '',
  aadhaar: '',
  employmentType: '',
  employerName: '',
  jobTitle: '',
  industry: '',
  yearsEmployed: '',
  annualIncome: '',
  monthlyIncome: '',
  employerPhone: '',
};
const CREDENTIALS_KEY = 'loan_assessment_credentials';

const INITIAL_FORM_DATA = {
  title: '', firstName: '', middleName: '', lastName: '',
  dateOfBirth: '', gender: '', maritalStatus: '',
  email: '', phone: '', aadhaar: '', pan: '',
  addressLine1: '', addressLine2: '', city: '', district: '',
  state: '', pinCode: '', residenceType: '', yearsAtAddress: '', monthlyRent: '',
  employmentType: '', employerName: '', jobTitle: '', industry: '',
  yearsEmployed: '', annualIncome: '', monthlyIncome: '', employerPhone: '', retirementIncome: '',
  coApplicant: { ...INITIAL_CO_APPLICANT },
  loanPurpose: '', loanAmount: '', creditScoreRange: '',
  monthlyDebtPayments: '',
  hasRunningLoanOrCard: '',
  existingLoans: [],
  personalLoanEmi1: '',
  personalLoanEmi2: '',
  housingLoanEmi1: '',
  housingLoanEmi2: '',
  carLoanEmi: '',
  twoWheelerLoanEmi: '',
  otherLoanEmi1: '',
  otherLoanEmi2: '',
  creditCardOutstanding1: '',
  creditCardOutstanding2: '',
  creditCardOutstanding3: '',
  creditCardOutstanding4: '',
  hasAnyOverdue: '',
  overdueAmount: '',
  overdueLoanType: '',
  ...FINANCIAL_HISTORY_INITIAL,
  certifyAccuracy: false, authorizeCredit: false, agreeTerms: false, consentCommunications: false,
  consentSignatureAgreed: false, customerSignature: '',
  submitAuthMethod: 'signature',
  signatureMode: 'draw',
  otpVerified: false,
  preferredBankId: '', preferredBankName: '', loanPriorities: [], loanPriority: '',
};

const clampStep = (step, totalSteps) => {
  const n = Number.parseInt(String(step), 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(0, n), Math.max(0, totalSteps - 1));
};

/** Older 7-step builds used index 4=review; 8-step uses 4=preferences. */
const migrateLegacyStep = (step, formData) => {
  const n = Number.parseInt(String(step), 10);
  if (Number.isNaN(n)) return 0;
  if (n >= 4 && getLoanPriorities(formData).length === 0) {
    return n + 1;
  }
  return n;
};

const createNewSessionKey = () => {
  const key = `session_${Date.now()}_${Math.random()?.toString(36)?.substring(2, 9)}`;
  localStorage.setItem(SESSION_KEY, key);
  return key;
};

const getOrCreateSessionKey = () => {
  return localStorage.getItem(SESSION_KEY) || createNewSessionKey();
};

const clearAssessmentDraft = () => {
  localStorage.removeItem('loan_assessment_form_data');
  localStorage.removeItem('loan_assessment_step');
  localStorage.removeItem('loan_assessment_application_id');
  localStorage.removeItem(SESSION_KEY);
};

/** Stable credentials per applicant so re-submit can log in after 409. */
const generateCredentials = (formData) => {
  const firstName = (formData?.firstName || 'user')?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || 'user';
  const phone = (formData?.phone || '')?.replace(/[^0-9]/g, '')?.slice(-4) || '0000';
  const username = `${firstName}${phone}`;
  const password = `RFC${phone}${firstName.slice(0, 4).toUpperCase()}!`;
  return { password, username };
};

const getStoredCredentials = (formData) => {
  try {
    const stored = JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || 'null');
    if (stored?.phone === formData?.phone) return stored;
  } catch { /* ignore */ }
  return null;
};

const coerceYesNo = (value) => {
  if (value === 'yes' || value === 'no') return value;
  if (value === true || value === 'true' || value === 1 || value === '1') return 'yes';
  if (value === false || value === 'false' || value === 0 || value === '0') return 'no';
  return typeof value === 'string' ? value : '';
};

const FORM_SCALAR_KEYS = Object.keys(INITIAL_FORM_DATA);

/** Normalize saved/server draft shapes so step renders never throw. */
const normalizeAssessmentFormData = (raw = {}) => {
  const safe = stripUnsafeFormFields(raw, FORM_SCALAR_KEYS);
  const merged = { ...INITIAL_FORM_DATA, ...safe };
  const coRaw = raw?.coApplicant ?? merged.coApplicant;
  merged.coApplicant = {
    ...INITIAL_CO_APPLICANT,
    ...(coRaw && typeof coRaw === 'object' && !Array.isArray(coRaw) ? coRaw : {}),
  };

  FINANCIAL_HISTORY_QUESTIONS.forEach((q) => {
    const direct = coerceYesNo(merged[q.field]);
    if (direct) {
      merged[q.field] = direct;
      return;
    }
    if (q.legacyBooleanKey && merged[q.legacyBooleanKey] != null) {
      merged[q.field] = coerceYesNo(merged[q.legacyBooleanKey]);
    }
  });

  merged.hasRunningLoanOrCard = coerceYesNo(merged.hasRunningLoanOrCard);
  merged.existingLoans = normalizeExistingLoans(raw, merged);
  merged.hasAnyOverdue = coerceYesNo(merged.hasAnyOverdue);
  const emiTotal = calculateTotalMonthlyEmi(merged);
  merged.monthlyDebtPayments = emiTotal > 0 ? String(emiTotal) : '';
  if (!merged.hasAnyOverdue) {
    const legacyOverdue =
      coerceYesNo(merged.creditBureauOverdue)
      || coerceYesNo(merged.credit_bureau_overdue)
      || coerceYesNo(merged.has_tax_liens);
    if (legacyOverdue) merged.hasAnyOverdue = legacyOverdue;
  }

  const priorities = getLoanPriorities(merged);
  merged.loanPriorities = priorities;
  merged.loanPriority = serializeLoanPriorities(priorities);

  // Legacy drafts may still store boolean bankruptcy flags
  if (!merged.hasRunningLoanOrCard && merged.hasBankruptcy != null) {
    merged.hasRunningLoanOrCard = coerceYesNo(merged.hasBankruptcy);
  }

  return merged;
};

const CustomerAssessmentPortal = ({ assistedByAgent = false } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [agentMeta, setAgentMeta] = useState(null);
  const [provisionedCustomerId, setProvisionedCustomerId] = useState(null);
  const sessionKey = useRef(getOrCreateSessionKey());
  const draftHydrated = useRef(false);
  const shouldResume =
    searchParams.get('resume') === '1' || location.state?.resumeDraft === true;
  const [gateReady, setGateReady] = useState(Boolean(assistedByAgent || shouldResume));
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionConfirmation, setSubmissionConfirmation] = useState(null);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingAccount, setIsPreparingAccount] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [applicationId, setApplicationId] = useState(null);
  const [otpAuthenticatedUserId, setOtpAuthenticatedUserId] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [documentRequirements, setDocumentRequirements] = useState([]);
  const autoSaveTimer = useRef(null);

  const steps = [
    { id: 'personal', label: 'Personal', description: 'Tell us about yourself' },
    { id: 'address', label: 'Address', description: 'Where do you live?' },
    { id: 'employment', label: 'Employment', description: 'Your work and income details' },
    { id: 'financial', label: 'Financial', description: 'Your loan requirements' },
    { id: 'preferences', label: 'Bank & priority', description: 'Preferred lender & goals' },
    { id: 'review', label: 'Review', description: 'Verify your information' },
    { id: 'documents', label: 'Documents', description: 'Upload required documents' },
    { id: 'signature', label: 'Submit', description: 'Sign and submit your application' },
  ];

  const [formData, setFormData] = useState({ ...INITIAL_FORM_DATA });

  const [errors, setErrors] = useState({});

  const applyEntryPrefill = useCallback(
    (base) =>
      buildAssessmentEntryState({
        initialFormData: base,
        financialHistoryInitial: FINANCIAL_HISTORY_INITIAL,
        financialHistoryQuestions: FINANCIAL_HISTORY_QUESTIONS,
        locationState: location.state,
        searchParams,
        sessionFormData: loadEligibilityResults()?.formData,
      }),
    [location.state, searchParams],
  );

  useEffect(() => {
    if (!assistedByAgent) return;
    agentApplicationService
      .getProfile()
      .then((profile) => setAgentMeta(profile))
      .catch(() => setAgentMeta(null));
  }, [assistedByAgent]);

  useEffect(() => {
    if (assistedByAgent || shouldResume) {
      setGateReady(true);
      return;
    }
    if (!hasCompletedEligibilityCheck()) {
      const loanType = searchParams.get('loanType');
      const qs = loanType ? `?loanType=${encodeURIComponent(loanType)}` : '';
      navigate(`/eligibility-assessment${qs}`, {
        replace: true,
        state: location.state,
      });
      return;
    }
    setGateReady(true);
  }, [assistedByAgent, shouldResume, searchParams, navigate, location.state]);

  useEffect(() => {
    if (!gateReady) return;
    const init = async () => {
      if (assistedByAgent) {
        clearAssessmentDraft();
        sessionKey.current = createNewSessionKey();
        setFormData(normalizeAssessmentFormData(applyEntryPrefill({ ...INITIAL_FORM_DATA })));
        setCurrentStep(0);
        setApplicationId(null);
        setUploadedDocs({});
        setProvisionedCustomerId(null);
        draftHydrated.current = true;
        return;
      }

      if (!shouldResume) {
        clearAssessmentDraft();
        sessionKey.current = createNewSessionKey();
        setFormData(normalizeAssessmentFormData(applyEntryPrefill({ ...INITIAL_FORM_DATA })));
        setCurrentStep(0);
        setApplicationId(null);
        setUploadedDocs({});
        setErrors({});
        draftHydrated.current = true;
        return;
      }

      sessionKey.current = getOrCreateSessionKey();
      try {
        let merged = { ...INITIAL_FORM_DATA };
        let step = 0;
        let appId = null;

        const localData = localStorage.getItem('loan_assessment_form_data');
        const localStep = localStorage.getItem('loan_assessment_step');
        const savedAppId = localStorage.getItem('loan_assessment_application_id');
        if (localData) {
          merged = normalizeAssessmentFormData(JSON.parse(localData));
        }
        if (localStep != null) {
          step = migrateLegacyStep(localStep, merged);
        }
        if (savedAppId) {
          appId = savedAppId;
        }
        try {
          const serverDraft = await leadService.getDraft(sessionKey.current);
          if (serverDraft?.formData) {
            merged = normalizeAssessmentFormData({ ...merged, ...serverDraft.formData });
          }
          if (serverDraft?.currentStep != null) {
            step = migrateLegacyStep(serverDraft.currentStep, merged);
          }
          if (serverDraft?.applicationId) {
            appId = serverDraft.applicationId;
          }
        } catch {
          /* server draft optional */
        }

        setFormData(normalizeAssessmentFormData(merged));
        setCurrentStep(clampStep(step, steps.length));
        if (appId) setApplicationId(appId);

        const storedCreds = getStoredCredentials(merged);
        if (storedCreds) setGeneratedCredentials(storedCreds);
      } catch {
        setFormData({ ...INITIAL_FORM_DATA });
        setCurrentStep(0);
      } finally {
        draftHydrated.current = true;
      }
    };
    init();
  }, [gateReady, shouldResume, applyEntryPrefill, assistedByAgent]);

  const saveProgress = useCallback(async (data, step) => {
    setIsSaving(true);
    try {
      // Always save to localStorage
      localStorage.setItem('loan_assessment_form_data', JSON.stringify(data));
      localStorage.setItem('loan_assessment_step', String(step));
      setLastSaved(new Date());
      leadService
        .saveDraft({
          sessionKey: sessionKey.current,
          formData: data,
          currentStep: step,
          loanType: data.loanPurpose,
          preferredBankId: data.preferredBankId,
          loanPriority: serializeLoanPriorities(getLoanPriorities(data)),
          applicationId: applicationId || undefined,
        })
        .catch(() => {});

    } catch (err) {
      // localStorage save still succeeded
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, [applicationId]);

  // Auto-save on form data change (debounced 3 seconds) — after initial load
  useEffect(() => {
    if (!draftHydrated.current) return undefined;
    if (autoSaveTimer?.current) clearTimeout(autoSaveTimer?.current);
    autoSaveTimer.current = setTimeout(() => {
      saveProgress(formData, currentStep);
    }, 3000);
    return () => clearTimeout(autoSaveTimer?.current);
  }, [formData, currentStep, saveProgress]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'employmentType' && prev.employmentType === 'retired' && value !== 'retired') {
        next.coApplicant = { ...INITIAL_CO_APPLICANT };
      }
      if (field === 'hasRunningLoanOrCard') {
        if (value === 'yes' && (!next.existingLoans || next.existingLoans.length === 0)) {
          next.existingLoans = [createEmptyLoanRow()];
        }
        if (value === 'no') {
          next.existingLoans = [];
        }
      }
      if (field === 'existingLoans' || field === 'hasRunningLoanOrCard' || EMI_FORM_FIELDS.includes(field)) {
        const total = calculateTotalMonthlyEmi(next);
        next.monthlyDebtPayments = total > 0 ? String(total) : '';
      }
      return next;
    });
    if (field === 'employmentType' && value !== 'retired') {
      setUploadedDocs((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (key.startsWith('co_applicant_')) delete next[key];
        });
        return next;
      });
    }
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if ((field === 'loanPriorities' || field === 'loanPriority') && errors?.loanPriority) {
      setErrors((prev) => ({ ...prev, loanPriority: '' }));
    }
  };

  const handleCoApplicantChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      coApplicant: { ...(prev.coApplicant || INITIAL_CO_APPLICANT), [field]: value },
    }));
    const errKey = `coApplicant_${field}`;
    if (errors?.[errKey]) {
      setErrors((prev) => ({ ...prev, [errKey]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData?.title) newErrors.title = 'Title is required';
        if (!formData?.firstName) newErrors.firstName = 'First name is required';
        if (!formData?.lastName) newErrors.lastName = 'Last name is required';
        if (!formData?.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData?.gender) newErrors.gender = 'Gender is required';
        if (!formData?.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
        if (!formData?.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/?.test(formData?.email)) newErrors.email = 'Invalid email format';
        if (!formData?.phone) newErrors.phone = 'Phone number is required';
        else if (!/^[6-9]\d{9}$/?.test(formData?.phone)) newErrors.phone = 'Enter valid 10-digit mobile number';
        if (!formData?.aadhaar) newErrors.aadhaar = 'Aadhaar (last 4 digits) is required';
        else if (!/^\d{4}$/?.test(formData?.aadhaar?.replace(/[-\s]/g, ''))) newErrors.aadhaar = 'Enter the last 4 digits of your Aadhaar';
        if (!formData?.pan) newErrors.pan = 'PAN number is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/?.test(formData?.pan)) newErrors.pan = 'Enter valid PAN (e.g. ABCDE1234F)';
        break;

      case 1:
        if (!formData?.addressLine1) newErrors.addressLine1 = 'Address is required';
        if (!formData?.city) newErrors.city = 'City is required';
        if (!formData?.state) newErrors.state = 'State is required';
        if (!formData?.pinCode) newErrors.pinCode = 'PIN code is required';
        else if (!/^\d{6}$/?.test(formData?.pinCode)) newErrors.pinCode = 'Enter valid 6-digit PIN code';
        if (!formData?.residenceType) newErrors.residenceType = 'Residence type is required';
        if (!formData?.yearsAtAddress && formData?.yearsAtAddress !== 0) newErrors.yearsAtAddress = 'Years at address is required';
        if (formData?.residenceType === 'rented' && !formData?.monthlyRent) {
          newErrors.monthlyRent = 'Monthly rent is required';
        }
        break;

      case 2:
        if (!formData?.employmentType) newErrors.employmentType = 'Employment status is required';
        if (['salaried', 'business_owner', 'professional', 'self_employed']?.includes(formData?.employmentType)) {
          if (!formData?.employerName) newErrors.employerName = 'Employer/Business name is required';
          if (!formData?.jobTitle) newErrors.jobTitle = 'Job title is required';
          if (!formData?.industry) newErrors.industry = 'Industry is required';
          if (!formData?.yearsEmployed && formData?.yearsEmployed !== 0) newErrors.yearsEmployed = 'Years employed is required';
          if (!formData?.annualIncome) newErrors.annualIncome = 'Annual income is required';
          if (!formData?.monthlyIncome) newErrors.monthlyIncome = 'Monthly income is required';
          if (['salaried', 'business_owner', 'professional'].includes(formData?.employmentType)) {
            if (!formData?.employerPhone) {
              newErrors.employerPhone = 'Employer phone is required';
            } else if (!/^[6-9]\d{9}$/.test(formData.employerPhone)) {
              newErrors.employerPhone = 'Enter valid 10-digit mobile number';
            }
          }
        }
        if (formData?.employmentType === 'retired' && !formData?.retirementIncome) {
          newErrors.retirementIncome = 'Retirement income is required';
        }
        if (requiresCoApplicant(formData?.employmentType)) {
          const ca = formData?.coApplicant || {};
          if (!ca.firstName) newErrors.coApplicant_firstName = 'Co-applicant first name is required';
          if (!ca.lastName) newErrors.coApplicant_lastName = 'Co-applicant last name is required';
          if (!ca.relationship) newErrors.coApplicant_relationship = 'Relationship is required';
          if (!ca.phone) newErrors.coApplicant_phone = 'Co-applicant phone is required';
          else if (!/^[6-9]\d{9}$/.test(ca.phone)) {
            newErrors.coApplicant_phone = 'Enter valid 10-digit mobile number';
          }
          if (ca.email && !/\S+@\S+\.\S+/.test(ca.email)) {
            newErrors.coApplicant_email = 'Invalid email format';
          }
          if (!ca.pan) newErrors.coApplicant_pan = 'Co-applicant PAN is required';
          else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(ca.pan)) {
            newErrors.coApplicant_pan = 'Enter valid PAN (e.g. ABCDE1234F)';
          }
          if (!ca.aadhaar) newErrors.coApplicant_aadhaar = 'Co-applicant Aadhaar (last 4 digits) is required';
          else if (!/^\d{4}$/.test(String(ca.aadhaar).replace(/[-\s]/g, ''))) {
            newErrors.coApplicant_aadhaar = 'Enter the last 4 digits of co-applicant Aadhaar';
          }
          if (!ca.employmentType) {
            newErrors.coApplicant_employmentType = 'Co-applicant employment status is required';
          }
          if (['salaried', 'business_owner', 'professional', 'self_employed'].includes(ca.employmentType)) {
            if (!ca.employerName) newErrors.coApplicant_employerName = 'Employer/Business name is required';
            if (!ca.jobTitle) newErrors.coApplicant_jobTitle = 'Job title is required';
            if (!ca.industry) newErrors.coApplicant_industry = 'Industry is required';
            if (!ca.yearsEmployed && ca.yearsEmployed !== 0) {
              newErrors.coApplicant_yearsEmployed = 'Years employed is required';
            }
            if (!ca.annualIncome) newErrors.coApplicant_annualIncome = 'Annual income is required';
            if (!ca.monthlyIncome) newErrors.coApplicant_monthlyIncome = 'Monthly income is required';
            if (['salaried', 'business_owner', 'professional'].includes(ca.employmentType)) {
              if (!ca.employerPhone) {
                newErrors.coApplicant_employerPhone = 'Employer phone is required';
              } else if (!/^[6-9]\d{9}$/.test(ca.employerPhone)) {
                newErrors.coApplicant_employerPhone = 'Enter valid 10-digit mobile number';
              }
            }
          }
        }
        break;

      case 3:
        if (!formData?.loanPurpose) newErrors.loanPurpose = 'Loan purpose is required';
        if (!formData?.loanAmount) newErrors.loanAmount = 'Loan amount is required';
        if (!formData?.creditScoreRange) newErrors.creditScoreRange = 'Credit score range is required';
        if (!formData?.hasRunningLoanOrCard) {
          newErrors.hasRunningLoanOrCard = 'Please select Yes or No';
        }
        if (formData?.hasRunningLoanOrCard === 'yes') {
          const completeLoans = getCompleteExistingLoans(formData?.existingLoans);
          if (!completeLoans.length) {
            newErrors.existingLoans = 'Add at least one loan with type and EMI amount';
          }
          (formData?.existingLoans || []).forEach((row) => {
            if (!row?.loanType) {
              newErrors[`existingLoan_${row.id}_type`] = 'Select loan type';
            }
            const emi = Number.parseFloat(row?.emiAmount);
            if (!Number.isFinite(emi) || emi <= 0) {
              newErrors[`existingLoan_${row.id}_emi`] = 'Enter EMI amount';
            }
          });
        }
        if (!formData?.hasAnyOverdue) {
          newErrors.hasAnyOverdue = 'Please select Yes or No';
        }
        if (formData?.hasAnyOverdue === 'yes') {
          if (!formData?.overdueAmount && formData?.overdueAmount !== 0) {
            newErrors.overdueAmount = 'Overdue amount is required';
          }
          if (!formData?.overdueLoanType) {
            newErrors.overdueLoanType = 'Please select loan type';
          }
        }
        FINANCIAL_HISTORY_QUESTIONS.forEach((question) => {
          if (!formData?.[question.field]) {
            newErrors[question.field] = 'Please select Yes or No';
          }
        });
        break;

      case 4: {
        const priorities = getLoanPriorities(formData);
        if (priorities.length < 1) {
          newErrors.loanPriority = 'Please select at least one priority (up to 2)';
        } else if (priorities.length > 2) {
          newErrors.loanPriority = 'You can select at most 2 priorities';
        }
        break;
      }

      case 5:
        if (!formData?.certifyAccuracy) newErrors.certifyAccuracy = 'You must certify the accuracy of information';
        if (!formData?.authorizeCredit) newErrors.authorizeCredit = 'Credit authorization is required';
        if (!formData?.agreeTerms) newErrors.agreeTerms = 'You must agree to terms and conditions';
        break;

      case 6: {
        getAssessmentDocumentTypes({
          employmentType: formData?.employmentType,
          requirements: documentRequirements,
          existingLoans: formData?.existingLoans,
          hasRunningLoanOrCard: formData?.hasRunningLoanOrCard,
        }).forEach((type) => {
          if (!uploadedDocs?.[type]) {
            newErrors[type] = 'This document is required';
          }
        });
        break;
      }

      case 7:
        if (!formData?.consentSignatureAgreed) {
          newErrors.consentSignatureAgreed = 'You must agree to submit your application';
        }
        if (formData?.submitAuthMethod === 'otp') {
          if (!formData?.otpVerified) {
            newErrors.otpVerified = 'Please verify OTP before submitting';
          }
        } else if (!formData?.customerSignature) {
          newErrors.customerSignature =
            formData?.signatureMode === 'upload'
              ? 'Please upload your signature image'
              : 'Please draw your signature in the box above';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const fetchEligibility = async (data = formData) => {
    try {
      const result = await homepageService.calculateEligibility(buildEligibilityInputFromAssessment(data));
      setEligibilityResult(result);
      return result;
    } catch {
      return null;
    }
  };

  const buildApplicationPayload = (customerId, status = 'draft') => ({
    title: formData?.title || null,
    first_name: formData?.firstName,
    middle_name: formData?.middleName || null,
    last_name: formData?.lastName,
    date_of_birth: formData?.dateOfBirth,
    gender: formData?.gender || null,
    marital_status: formData?.maritalStatus || null,
    email: formData?.email,
    phone: formData?.phone,
    aadhaar_number: formData?.aadhaar || null,
    pan_number: formData?.pan || null,
    address_line1: formData?.addressLine1,
    address_line2: formData?.addressLine2 || null,
    city: formData?.city,
    district: formData?.district || null,
    state: formData?.state,
    pin_code: formData?.pinCode,
    residence_type: formData?.residenceType || null,
    years_at_address: formData?.yearsAtAddress ? parseInt(formData?.yearsAtAddress, 10) : null,
    monthly_rent: formData?.monthlyRent ? parseFloat(formData?.monthlyRent) : null,
    employment_type: formData?.employmentType,
    employer_name: formData?.employerName || null,
    job_title: formData?.jobTitle || null,
    industry: formData?.industry || null,
    years_employed: formData?.yearsEmployed ? parseInt(formData?.yearsEmployed, 10) : null,
    annual_income: formData?.annualIncome ? parseFloat(formData?.annualIncome) : 0,
    monthly_income: formData?.monthlyIncome ? parseFloat(formData?.monthlyIncome) : 0,
    employer_phone: formData?.employerPhone || null,
    retirement_income: formData?.retirementIncome ? parseFloat(formData?.retirementIncome) : null,
    co_applicant: requiresCoApplicant(formData?.employmentType)
      ? {
          first_name: formData?.coApplicant?.firstName,
          last_name: formData?.coApplicant?.lastName,
          relationship: formData?.coApplicant?.relationship,
          phone: formData?.coApplicant?.phone,
          email: formData?.coApplicant?.email || null,
          pan_number: formData?.coApplicant?.pan,
          aadhaar_number: formData?.coApplicant?.aadhaar,
          employment_type: formData?.coApplicant?.employmentType,
          employer_name: formData?.coApplicant?.employerName || null,
          job_title: formData?.coApplicant?.jobTitle || null,
          industry: formData?.coApplicant?.industry || null,
          years_employed: formData?.coApplicant?.yearsEmployed
            ? parseInt(formData?.coApplicant?.yearsEmployed, 10)
            : null,
          annual_income: formData?.coApplicant?.annualIncome
            ? parseFloat(formData?.coApplicant?.annualIncome)
            : null,
          monthly_income: formData?.coApplicant?.monthlyIncome
            ? parseFloat(formData?.coApplicant?.monthlyIncome)
            : null,
          employer_phone: formData?.coApplicant?.employerPhone || null,
        }
      : null,
    loan_purpose: formData?.loanPurpose,
    requested_loan_amount: formData?.loanAmount ? parseFloat(formData?.loanAmount) : 0,
    credit_score_range: formData?.creditScoreRange || null,
    monthly_debt_payments: (() => {
      const total = calculateTotalMonthlyEmi(formData);
      return total > 0 ? total : null;
    })(),
    total_assets: null,
    has_running_loan_or_card: formData?.hasRunningLoanOrCard || null,
    existing_loans: serializeExistingLoansForPayload(formData?.existingLoans),
    personal_loan_emi_1: formData?.personalLoanEmi1 ? parseFloat(formData?.personalLoanEmi1) : null,
    personal_loan_emi_2: formData?.personalLoanEmi2 ? parseFloat(formData?.personalLoanEmi2) : null,
    housing_loan_emi_1: formData?.housingLoanEmi1 ? parseFloat(formData?.housingLoanEmi1) : null,
    housing_loan_emi_2: formData?.housingLoanEmi2 ? parseFloat(formData?.housingLoanEmi2) : null,
    car_loan_emi: formData?.carLoanEmi ? parseFloat(formData?.carLoanEmi) : null,
    two_wheeler_loan_emi: formData?.twoWheelerLoanEmi ? parseFloat(formData?.twoWheelerLoanEmi) : null,
    other_loan_emi_1: formData?.otherLoanEmi1 ? parseFloat(formData?.otherLoanEmi1) : null,
    other_loan_emi_2: formData?.otherLoanEmi2 ? parseFloat(formData?.otherLoanEmi2) : null,
    credit_card_outstanding_1: formData?.creditCardOutstanding1 ? parseFloat(formData?.creditCardOutstanding1) : null,
    credit_card_outstanding_2: formData?.creditCardOutstanding2 ? parseFloat(formData?.creditCardOutstanding2) : null,
    credit_card_outstanding_3: formData?.creditCardOutstanding3 ? parseFloat(formData?.creditCardOutstanding3) : null,
    credit_card_outstanding_4: formData?.creditCardOutstanding4 ? parseFloat(formData?.creditCardOutstanding4) : null,
    has_any_overdue: formData?.hasAnyOverdue || null,
    overdue_amount: formData?.overdueAmount ? parseFloat(formData?.overdueAmount) : null,
    overdue_loan_type: formData?.overdueLoanType || null,
    ...Object.fromEntries(
      FINANCIAL_HISTORY_QUESTIONS.map((q) => [
        q.payloadKey,
        formData?.[q.field] || null,
      ]),
    ),
    has_bankruptcy: isFinancialHistoryYes(formData?.loanDefaultPast36Months),
    has_foreclosure: isFinancialHistoryYes(formData?.accountNpaWrittenOff),
    has_tax_liens: isFinancialHistoryYes(formData?.hasAnyOverdue),
    credit_bureau_overdue: formData?.hasAnyOverdue || null,
    has_co_signed_loans: isFinancialHistoryYes(formData?.coApplicantOrGuarantor),
    preferred_bank_id: formData?.preferredBankId || null,
    loan_priority: serializeLoanPriorities(getLoanPriorities(formData)) || null,
    loan_priorities: getLoanPriorities(formData),
    preferred_bank_name: formData?.preferredBankName || null,
    status,
    application_number: `RFC${Date.now()}`,
    customer_id: customerId || null,
  });

  const authenticateApplicant = async () => {
    if (assistedByAgent) {
      if (provisionedCustomerId) return provisionedCustomerId;
      const email = formData?.email?.trim();
      if (!email) {
        throw new Error('Customer email is required in Personal details.');
      }
      const result = await agentApplicationService.provisionCustomer({
        email,
        phone: formData?.phone || '',
        firstName: formData?.firstName,
        lastName: formData?.lastName,
        fullName: [formData?.firstName, formData?.middleName, formData?.lastName].filter(Boolean).join(' '),
      });
      setProvisionedCustomerId(result.customerId);
      if (result.temporaryPassword) {
        setGeneratedCredentials({
          email,
          password: result.temporaryPassword,
          username: email,
          isCustomer: true,
        });
      }
      return result.customerId;
    }

    if (user?.id) return user.id;
    if (otpAuthenticatedUserId) return otpAuthenticatedUserId;

    if (formData?.submitAuthMethod === 'otp') {
      const err = new Error('Please verify OTP on this step before submitting.');
      err.displayMessage = err.message;
      throw err;
    }

    const email = formData?.email?.trim();
    if (!email) {
      throw new Error('Email is required. Go back to Personal details and enter your email.');
    }

    const stored = getStoredCredentials(formData);
    const generated = generateCredentials(formData);
    const password = stored?.password || generated.password;
    const credentials = { email, password, username: generated.username };
    setGeneratedCredentials(credentials);

    const persistAndSetToken = (accessToken, userId) => {
      if (accessToken) setAccessToken(accessToken);
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ ...credentials, phone: formData?.phone }));
      return userId;
    };

    try {
      const res = await apiClient.post('/auth/signup', {
        email,
        password,
        fullName: `${formData?.firstName || ''} ${formData?.lastName || ''}`.trim(),
        phone: formData?.phone || '',
        role: 'customer',
      });
      return persistAndSetToken(res?.data?.accessToken, res?.data?.user?.id);
    } catch (signupErr) {
      if (signupErr?.response?.status !== 409) throw signupErr;
      try {
        const loginRes = await apiClient.post('/auth/login', { email, password });
        return persistAndSetToken(loginRes?.data?.accessToken, loginRes?.data?.user?.id);
      } catch {
        const err = new Error(
          'An account already exists for this email. Use OTP verification on this step, or log in from the Login page.',
        );
        throw err;
      }
    }
  };

  const ensureAuthAndDraftApplication = async () => {
    setIsPreparingAccount(true);
    setSubmitError('');
    try {
      const userId = await authenticateApplicant();
      const payload = buildApplicationPayload(userId, 'draft');

      if (assistedByAgent) {
        if (applicationId) {
          await agentApplicationService.updateApplication(applicationId, payload);
          return applicationId;
        }
        const app = await agentApplicationService.createApplication({
          ...payload,
          customerId: userId,
        });
        const id = app?.id;
        if (!id) throw new Error('Could not create application draft. Please try again.');
        setApplicationId(id);
        return id;
      }

      if (applicationId) {
        await applicationService.updateApplication(applicationId, payload);
        return applicationId;
      }
      const app = await applicationService.createApplication(payload);
      const id = app?.id;
      if (!id) {
        throw new Error('Could not create your application draft. Please try again.');
      }
      setApplicationId(id);
      localStorage.setItem('loan_assessment_application_id', id);
      return id;
    } finally {
      setIsPreparingAccount(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitError('');

    if (currentStep === 5) {
      setIsSubmitting(true);
      try {
        await ensureAuthAndDraftApplication();
        await fetchEligibility();
        saveProgress(formData, 6);
        setCurrentStep(6);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        const msg = err?.response?.data?.error || err?.message || 'Could not create your account. Please try again.';
        setSubmitError(msg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (currentStep === steps.length - 1) {
      handleFinalSubmit();
      return;
    }

    const nextStep = Math.min(steps.length - 1, currentStep + 1);
    saveProgress(formData, nextStep);
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    const nextStep = Math.max(0, currentStep - 1);
    if (nextStep === currentStep) return;
    setErrors({});
    setCurrentStep(nextStep);
    saveProgress(formData, nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (index) => {
    if (index >= currentStep) return;
    setErrors({});
    setCurrentStep(index);
    saveProgress(formData, index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProgress = () => {
    saveProgress(formData, currentStep);
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const customerId = await authenticateApplicant();

      let appId = applicationId;
      if (!appId) {
        appId = await ensureAuthAndDraftApplication();
      }
      if (!appId) {
        throw new Error('Application draft is missing. Go back to Review and tap Continue to Documents again.');
      }

      const signatureName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ');
      const signaturePayload =
        formData.submitAuthMethod === 'otp'
          ? {
              customer_signature: 'OTP_VERIFIED',
              signature_method: 'otp',
              signature_signed_at: new Date().toISOString(),
              signature_name: signatureName,
            }
          : {
              customer_signature: formData.customerSignature,
              signature_method: formData.signatureMode || 'draw',
              signature_signed_at: new Date().toISOString(),
              signature_name: signatureName,
            };

      const finalPayload = {
        ...buildApplicationPayload(customerId, 'documents_pending'),
        ...signaturePayload,
      };

      let confirmation = null;

      if (assistedByAgent) {
        await agentApplicationService.updateApplication(appId, finalPayload);
        const agentSubmit = await agentApplicationService.submitApplication(appId);
        confirmation = agentSubmit?.confirmation || null;
      } else {
        await applicationService.updateApplication(appId, finalPayload);

        const consentResult = await appService.saveConsents(appId, {
          certify_accuracy: formData.certifyAccuracy,
          authorize_credit: formData.authorizeCredit,
          agree_terms: formData.agreeTerms,
          consent_communications: formData.consentCommunications,
          electronic_signature: formData.consentSignatureAgreed,
        });
        if (consentResult?.error) {
          throw new Error(consentResult.error.message || 'Failed to save consents');
        }

        const submitResult = await appService.submitApplication(appId);
        if (submitResult?.error) {
          throw new Error(submitResult.error.message || 'Failed to submit application');
        }
        confirmation = submitResult?.data?.confirmation || null;
        if (!confirmation?.applicationNumber && submitResult?.data?.applicationNumber) {
          confirmation = {
            ...(confirmation || {}),
            applicationNumber: submitResult.data.applicationNumber,
          };
        }
      }

      if (!confirmation) {
        const applicantName = [formData.firstName, formData.middleName, formData.lastName]
          .filter(Boolean)
          .join(' ');
        confirmation = {
          applicationId: appId,
          applicationNumber: finalPayload.application_number || `RFC${Date.now()}`,
          applicantName,
          submittedAt: new Date().toISOString(),
          status: 'submitted',
          statusLabel: 'Submitted Successfully',
        };
      }

      setSubmissionConfirmation(confirmation);
      await fetchEligibility();

      localStorage.removeItem('loan_assessment_form_data');
      localStorage.removeItem('loan_assessment_step');
      localStorage.removeItem('loan_assessment_application_id');
      localStorage.removeItem(SESSION_KEY);
      try {
        sessionStorage.removeItem('rfincare_registration_prefill');
      } catch {
        /* ignore */
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err?.response?.data?.error || err?.displayMessage || err?.message || 'Submission failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocUploaded = (docType, meta) => {
    setUploadedDocs((prev) => ({ ...prev, [docType]: meta }));
    if (errors?.[docType]) {
      setErrors((prev) => ({ ...prev, [docType]: '' }));
    }
  };

  const handleSignatureChange = (dataUrl) => {
    setFormData((prev) => ({ ...prev, customerSignature: dataUrl }));
    if (errors?.customerSignature) {
      setErrors((prev) => ({ ...prev, customerSignature: '' }));
    }
  };

  const handleOtpVerified = (res) => {
    if (res?.accessToken) setAccessToken(res.accessToken);
    if (res?.user?.id) setOtpAuthenticatedUserId(res.user.id);
    setFormData((prev) => ({ ...prev, otpVerified: true }));
    if (errors?.otpVerified) {
      setErrors((prev) => ({ ...prev, otpVerified: '' }));
    }
  };

  const handleSuccessRedirect = () => {
    navigate(assistedByAgent ? '/agent-dashboard' : '/customer-dashboard');
  };

  const renderStepContent = () => {
    const activeStep = clampStep(currentStep, steps.length);
    switch (activeStep) {
      case 0:
        return <PersonalInfoForm formData={formData} errors={errors} onChange={handleChange} />;
      case 1:
        return <AddressInfoForm formData={formData} errors={errors} onChange={handleChange} />;
      case 2:
        return (
          <EmploymentInfoForm
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onCoApplicantChange={handleCoApplicantChange}
          />
        );
      case 3:
        return <FinancialInfoForm formData={formData} errors={errors} onChange={handleChange} />;
      case 4:
        return <BankPreferencesStep formData={formData} errors={errors} onChange={handleChange} />;
      case 5:
        return <ReviewSubmitForm formData={formData} errors={errors} onChange={handleChange} />;
      case 6:
        return (
          <DocumentUploadStep
            applicationId={applicationId}
            customerId={assistedByAgent ? provisionedCustomerId : undefined}
            uploadedDocs={uploadedDocs}
            onUploaded={handleDocUploaded}
            onRequirementsLoaded={setDocumentRequirements}
            errors={errors}
            employmentType={formData?.employmentType}
            existingLoans={formData?.existingLoans}
            hasRunningLoanOrCard={formData?.hasRunningLoanOrCard}
            eligibilityResult={eligibilityResult}
          />
        );
      case 7:
        return (
          <ConsentSignatureForm
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onSignatureChange={handleSignatureChange}
            onOtpVerified={handleOtpVerified}
            eligibilityResult={eligibilityResult}
          />
        );
      default:
        return null;
    }
  };

  if (!gateReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Header />
        <p className="text-muted-foreground">Preparing your application…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {assistedByAgent && (
          <AgentAssistedBanner
            agentCode={agentMeta?.agentCode}
            agentName={agentMeta?.agentName}
          />
        )}

        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary to-secondary mb-4 md:mb-6">
            <Icon name="FileText" size={32} color="white" className="md:w-10 md:h-10 lg:w-12 lg:h-12" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            {assistedByAgent ? 'Customer Loan Application' : 'Loan Assessment Portal'}
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            {assistedByAgent
              ? 'Complete the full application on behalf of your customer. Submissions are linked to your agent code automatically.'
              : 'Complete your financial profile to get matched with the best loan options tailored to your needs'}
          </p>
          <div className="mt-4 md:mt-6">
            <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={clampStep(currentStep, steps.length)}
          totalSteps={steps?.length}
          steps={steps}
          onStepClick={handleStepClick}
        />

        {/* Form Content */}
        <div className="form-section animate-fade-in">
          {renderStepContent()}

          {submitError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              {submitError}
            </div>
          )}

          {/* Navigation */}
          <FormNavigation
            currentStep={clampStep(currentStep, steps.length)}
            totalSteps={steps?.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSave={handleSaveProgress}
            isValid={true}
            isSaving={isSaving || isSubmitting || isPreparingAccount}
            nextLabel={currentStep === 5 ? 'Continue to Documents' : undefined}
            submitLabel="Submit Application"
          />
        </div>

        {/* Help Section */}
        <div className="mt-8 md:mt-12 p-4 md:p-6 bg-card rounded-lg border border-border">
          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="HelpCircle" size={20} className="text-primary md:w-6 md:h-6" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Need Help?</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                Our support team is available 24/7 to assist you with any questions about the assessment process.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <a href="tel:+917300069952" className="inline-flex items-center justify-center px-4 py-2 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  <Icon name="Phone" size={16} className="mr-2" />
                  Call: +91-7300069952
                </a>
                <a href="tel:+917696664657" className="inline-flex items-center justify-center px-4 py-2 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  <Icon name="Phone" size={16} className="mr-2" />
                  Call: +91-7696664657
                </a>
                <a href="mailto:support@rfincare.com" className="inline-flex items-center justify-center px-4 py-2 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  <Icon name="Mail" size={16} className="mr-2" />
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Success Modal with Credentials */}
      {showSuccessModal && submissionConfirmation && (
        <ApplicationConfirmation
          confirmation={submissionConfirmation}
          eligibilityResult={eligibilityResult}
          assistedByAgent={assistedByAgent}
          generatedCredentials={generatedCredentials}
          onContinue={handleSuccessRedirect}
        />
      )}
    </div>
  );
};

export default CustomerAssessmentPortal;