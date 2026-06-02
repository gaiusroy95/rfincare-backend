import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { stateService } from '../../../services/apiServices';

const AddressInfoForm = ({ formData, errors, onChange }) => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const data = await stateService?.getAllStates();
      const stateOptions = data?.map(state => ({
        value: state?.stateName,
        label: state?.stateName
      }));
      setStates(stateOptions);
    } catch (error) {
      console.error('Failed to load states:', error);
    } finally {
      setLoading(false);
    }
  };

  const residenceTypeOptions = [
    { value: 'owned', label: 'Owned' },
    { value: 'rented', label: 'Rented' },
    { value: 'family_owned', label: 'Family Owned' },
    { value: 'company_provided', label: 'Company Provided' }
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <Input
        label="Address Line 1"
        type="text"
        placeholder="House/Flat No., Building Name, Street"
        value={formData?.addressLine1}
        onChange={(e) => onChange('addressLine1', e?.target?.value)}
        error={errors?.addressLine1}
        required
      />
      
      <Input
        label="Address Line 2"
        type="text"
        placeholder="Area, Locality (optional)"
        value={formData?.addressLine2}
        onChange={(e) => onChange('addressLine2', e?.target?.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Input
          label="City"
          type="text"
          placeholder="Enter city"
          value={formData?.city}
          onChange={(e) => onChange('city', e?.target?.value)}
          error={errors?.city}
          required
        />

        <Input
          label="District"
          type="text"
          placeholder="Enter district (optional)"
          value={formData?.district}
          onChange={(e) => onChange('district', e?.target?.value)}
        />

        <Select
          label="State"
          options={states}
          value={formData?.state}
          onChange={(value) => onChange('state', value)}
          error={errors?.state}
          searchable
          required
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="PIN Code"
          type="text"
          placeholder="400001"
          description="6-digit PIN code"
          value={formData?.pinCode}
          onChange={(e) => onChange('pinCode', e?.target?.value)}
          error={errors?.pinCode}
          required
          maxLength={6}
        />

        <Input
          label="Country"
          type="text"
          value="India"
          disabled
          description="Default country"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Select
          label="Residence Type"
          description="Current living situation"
          options={residenceTypeOptions}
          value={formData?.residenceType}
          onChange={(value) => onChange('residenceType', value)}
          error={errors?.residenceType}
          required
        />

        <Input
          label="Years at Current Address"
          type="number"
          placeholder="0"
          description="Enter number of years"
          value={formData?.yearsAtAddress}
          onChange={(e) => onChange('yearsAtAddress', e?.target?.value)}
          error={errors?.yearsAtAddress}
          required
          min={0}
          max={100}
        />
      </div>
      {formData?.residenceType === 'rented' && (
        <Input
          label="Monthly Rent Amount"
          type="number"
          placeholder="15000"
          description="Enter your monthly rent in INR (₹)"
          value={formData?.monthlyRent}
          onChange={(e) => onChange('monthlyRent', e?.target?.value)}
          error={errors?.monthlyRent}
          required
          min={0}
        />
      )}
    </div>
  );
};

export default AddressInfoForm;