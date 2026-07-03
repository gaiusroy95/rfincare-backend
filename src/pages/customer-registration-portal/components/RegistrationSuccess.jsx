import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function RegistrationSuccess({ onNavigateToLogin }) {
  return (
    <div className="text-center py-8">
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Submitted Successfully!</h2>
      
      <div className="max-w-2xl mx-auto space-y-4 mb-8">
        <p className="text-lg text-gray-700">
          Thank you for registering with our loan platform. Your application has been received and is under review.
        </p>
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Our admin team will review your registration details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You will receive an email with your login credentials once approved</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>The admin will set up your username and password for secure access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You can then log in and complete your loan application</span>
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> The review process typically takes 1-2 business days. You will be notified via email once your account is activated.
          </p>
        </div>
      </div>

      <button
        onClick={onNavigateToLogin}
        className="rf-btn-primary font-medium py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
      >
        Go to Login Page
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}