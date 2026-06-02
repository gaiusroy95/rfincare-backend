import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Briefcase, Building, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { bankService } from '../../services/apiServices';
import OAuthProviderButtons from './components/OAuthProviderButtons';
import DemographicForm from './components/DemographicForm';
import EmploymentForm from './components/EmploymentForm';
import BankInfoForm from './components/BankInfoForm';
import RegistrationSuccess from './components/RegistrationSuccess';
import Icon from '../../components/AppIcon';

import Header from '../../components/ui/Header';


export default function CustomerRegistrationPortal() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [banks, setBanks] = useState([]);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    oauthProvider: 'email',
    oauthProviderId: null,
    dateOfBirth: '',
    gender: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    employmentType: '',
    employerName: '',
    annualIncome: '',
    preferredBankId: '',
    accountHolderName: ''
  });

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const data = await bankService.getActiveBanks();
      setBanks(data || []);
    } catch (err) {
      console.error('Failed to load banks:', err);
    }
  };

  const handleOAuthSelect = (provider, providerData) => {
    setFormData(prev => ({
      ...prev,
      oauthProvider: provider,
      oauthProviderId: providerData?.id || null,
      email: providerData?.email || prev?.email,
      fullName: providerData?.name || prev?.fullName
    }));
    setCurrentStep(2);
  };

  const handleEmailSignup = () => {
    if (!formData?.email || !formData?.fullName) {
      setError('Please provide email and full name');
      return;
    }
    setFormData(prev => ({ ...prev, oauthProvider: 'email' }));
    setCurrentStep(2);
  };

  const handleDemographicSubmit = (demographicData) => {
    setFormData(prev => ({ ...prev, ...demographicData }));
    setCurrentStep(3);
  };

  const handleEmploymentSubmit = (employmentData) => {
    setFormData(prev => ({ ...prev, ...employmentData }));
    setCurrentStep(4);
  };

  const handleBankInfoSubmit = async (bankData) => {
    setLoading(true);
    setError('');

    try {
      const finalData = { ...formData, ...bankData };
      const result = await authService?.signUpCustomer(finalData);
      
      if (result?.error) {
        setError(result?.error?.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }
      
      setSuccess(true);
      setCurrentStep(5);
      
      // Auto-redirect to customer dashboard after 2 seconds
      setTimeout(() => {
        navigate('/customer-dashboard', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const steps = [
    { number: 1, title: 'Email Sync', icon: Mail },
    { number: 2, title: 'Demographics', icon: User },
    { number: 3, title: 'Employment', icon: Briefcase },
    { number: 4, title: 'Bank Info', icon: Building }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Registration Portal</h1>
          <p className="text-lg text-gray-600">Complete your profile to access loan services</p>
        </div>

        {/* Progress Steps */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps?.map((step, index) => {
                const Icon = step?.icon;
                const isActive = currentStep === step?.number;
                const isCompleted = currentStep > step?.number;

                return (
                  <React.Fragment key={step?.number}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isActive
                            ? 'bg-blue-600 text-white' :'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {step?.title}
                      </span>
                    </div>
                    {index < steps?.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-4 rounded transition-all ${
                          currentStep > step?.number ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <OAuthProviderButtons
              formData={formData}
              setFormData={setFormData}
              onProviderSelect={handleOAuthSelect}
              onEmailSignup={handleEmailSignup}
              error={error}
              setError={setError}
            />
          )}

          {currentStep === 2 && (
            <DemographicForm
              formData={formData}
              onSubmit={handleDemographicSubmit}
              onBack={handleBackStep}
            />
          )}

          {currentStep === 3 && (
            <EmploymentForm
              formData={formData}
              onSubmit={handleEmploymentSubmit}
              onBack={handleBackStep}
            />
          )}

          {currentStep === 4 && (
            <BankInfoForm
              formData={formData}
              banks={banks}
              onSubmit={handleBankInfoSubmit}
              onBack={handleBackStep}
              loading={loading}
            />
          )}

          {currentStep === 5 && success && (
            <RegistrationSuccess onNavigateToLogin={() => navigate('/authentication-management-center')} />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Already have an account?{' '}
            <button
              onClick={() => navigate('/authentication-management-center')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}