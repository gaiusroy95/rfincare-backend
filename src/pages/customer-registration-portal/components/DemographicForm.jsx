import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function DemographicForm({ formData, onSubmit, onBack }) {
  const [localData, setLocalData] = useState({
    dateOfBirth: formData?.dateOfBirth || '',
    gender: formData?.gender || '',
    addressLine1: formData?.addressLine1 || '',
    addressLine2: formData?.addressLine2 || '',
    city: formData?.city || '',
    state: formData?.state || '',
    pinCode: formData?.pinCode || ''
  });

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSubmit(localData);
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Demographic Details</h2>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            value={localData?.dateOfBirth}
            onChange={(e) => setLocalData(prev => ({ ...prev, dateOfBirth: e?.target?.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={localData?.gender}
            onChange={(e) => setLocalData(prev => ({ ...prev, gender: e?.target?.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
        <input
          type="text"
          value={localData?.addressLine1}
          onChange={(e) => setLocalData(prev => ({ ...prev, addressLine1: e?.target?.value }))}
          placeholder="House/Flat No., Building Name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
        <input
          type="text"
          value={localData?.addressLine2}
          onChange={(e) => setLocalData(prev => ({ ...prev, addressLine2: e?.target?.value }))}
          placeholder="Street, Area, Landmark (Optional)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={localData?.city}
            onChange={(e) => setLocalData(prev => ({ ...prev, city: e?.target?.value }))}
            placeholder="Mumbai"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <select
            value={localData?.state}
            onChange={(e) => setLocalData(prev => ({ ...prev, state: e?.target?.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select State</option>
            {indianStates?.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
          <input
            type="text"
            value={localData?.pinCode}
            onChange={(e) => setLocalData(prev => ({ ...prev, pinCode: e?.target?.value }))}
            placeholder="400001"
            maxLength="6"
            pattern="[0-9]{6}"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
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
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}