import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function EmploymentForm({ formData, onSubmit, onBack }) {
  const [localData, setLocalData] = useState({
    employmentType: formData?.employmentType || '',
    employerName: formData?.employerName || '',
    annualIncome: formData?.annualIncome || ''
  });

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSubmit(localData);
  };

  const employmentTypes = [
    { value: 'salaried', label: 'Salaried' },
    { value: 'self_employed', label: 'Self Employed' },
    { value: 'business_owner', label: 'Business Owner' },
    { value: 'professional', label: 'Professional' },
    { value: 'retired', label: 'Retired' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Employment Details</h2>
        <p className="text-gray-600">Help us understand your financial profile</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
        <select
          value={localData?.employmentType}
          onChange={(e) => setLocalData(prev => ({ ...prev, employmentType: e?.target?.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select Employment Type</option>
          {employmentTypes?.map(type => (
            <option key={type?.value} value={type?.value}>{type?.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {localData?.employmentType === 'business_owner' ? 'Business Name' : 'Employer Name'}
        </label>
        <input
          type="text"
          value={localData?.employerName}
          onChange={(e) => setLocalData(prev => ({ ...prev, employerName: e?.target?.value }))}
          placeholder={localData?.employmentType === 'business_owner' ? 'Your Business Name' : 'Company Name'}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income (₹)</label>
        <input
          type="number"
          value={localData?.annualIncome}
          onChange={(e) => setLocalData(prev => ({ ...prev, annualIncome: e?.target?.value }))}
          placeholder="1200000"
          min="0"
          step="10000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <p className="mt-2 text-sm text-gray-500">Enter your total annual income before taxes</p>
      </div>
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Privacy Note:</strong> Your employment and income information is kept confidential and used only for loan eligibility assessment.
        </p>
      </div>
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          type="submit"
          className="flex-1 rf-btn-primary font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}