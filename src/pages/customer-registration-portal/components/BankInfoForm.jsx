import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function BankInfoForm({ formData, banks, onSubmit, onBack, loading }) {
  const [localData, setLocalData] = useState({
    preferredBankId: formData?.preferredBankId || '',
    accountHolderName: formData?.accountHolderName || formData?.fullName || ''
  });

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSubmit(localData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Information</h2>
        <p className="text-gray-600">Select your preferred banking partner</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Bank</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banks?.map((bank) => (
            <div
              key={bank?.id}
              onClick={() => setLocalData(prev => ({ ...prev, preferredBankId: bank?.id }))}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                localData?.preferredBankId === bank?.id
                  ? 'border-blue-600 bg-blue-50' :'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {bank?.logo_url && (
                  <img
                    src={bank?.logo_url}
                    alt={bank?.logo_alt || `${bank?.name} logo`}
                    className="w-12 h-12 object-contain"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{bank?.name}</h3>
                </div>
                {localData?.preferredBankId === bank?.id && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
              </div>
            </div>
          ))}
        </div>
        {(!banks || banks?.length === 0) && (
          <p className="text-sm text-gray-500 mt-2">No banks available. Please contact support.</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
        <input
          type="text"
          value={localData?.accountHolderName}
          onChange={(e) => setLocalData(prev => ({ ...prev, accountHolderName: e?.target?.value }))}
          placeholder="As per bank records"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <p className="mt-2 text-sm text-gray-500">Enter name exactly as it appears on your bank account</p>
      </div>
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Final Step:</strong> After submission, our admin team will review your application and create your account credentials.
        </p>
      </div>
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          type="submit"
          disabled={loading || !localData?.preferredBankId}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Submit Application
            </>
          )}
        </button>
      </div>
    </form>
  );
}