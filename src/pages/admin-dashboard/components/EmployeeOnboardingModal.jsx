import React, { useState } from 'react';
import { X, User, Mail, Phone, CreditCard, Building2, Hash, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { adminService } from '../../../services/adminService';

export default function EmployeeOnboardingModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    employeeName: '',
    employeeCode: '',
    email: '',
    mobileNumber: '',
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminService?.createEmployeeOnboarding(formData);
      
      if (result?.error) {
        throw new Error(result?.error?.message);
      }
      
      onSuccess?.();
      onClose?.();
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        employeeName: '',
        employeeCode: '',
        email: '',
        mobileNumber: '',
        accountNumber: '',
        bankName: '',
        ifscCode: ''
      });
    } catch (err) {
      setError(err?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">Employee Onboarding</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Credentials Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Login Credentials</h3>
            <p className="text-sm text-gray-600">
              Credentials are emailed to the employee after creation. Account is activated immediately.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Username *
                </label>
                <Input
                  type="text"
                  name="username"
                  value={formData?.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData?.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Employee Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Employee Name *
                </label>
                <Input
                  type="text"
                  name="employeeName"
                  value={formData?.employeeName}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-2" />
                  Employee Code *
                </label>
                <Input
                  type="text"
                  name="employeeCode"
                  value={formData?.employeeCode}
                  onChange={handleChange}
                  placeholder="Enter employee code"
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email ID *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData?.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Mobile Number *
                </label>
                <Input
                  type="tel"
                  name="mobileNumber"
                  value={formData?.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Bank Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Bank Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Account Number *
                </label>
                <Input
                  type="text"
                  name="accountNumber"
                  value={formData?.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Bank Name *
                </label>
                <Input
                  type="text"
                  name="bankName"
                  value={formData?.bankName}
                  onChange={handleChange}
                  placeholder="Enter bank name"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-2" />
                  IFSC Code *
                </label>
                <Input
                  type="text"
                  name="ifscCode"
                  value={formData?.ifscCode}
                  onChange={handleChange}
                  placeholder="Enter IFSC code"
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Now'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}