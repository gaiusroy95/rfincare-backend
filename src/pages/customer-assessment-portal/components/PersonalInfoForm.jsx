import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PersonalInfoForm = ({ formData, errors, onChange }) => {
  const titleOptions = [
    { value: 'mr', label: 'Mr.' },
    { value: 'mrs', label: 'Mrs.' },
    { value: 'ms', label: 'Ms.' },
    { value: 'dr', label: 'Dr.' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' }
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Select
          label="Title"
          description="Select your title"
          options={titleOptions}
          value={formData?.title}
          onChange={(value) => onChange('title', value)}
          error={errors?.title}
          required
        />

        <Input
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          value={formData?.firstName}
          onChange={(e) => onChange('firstName', e?.target?.value)}
          error={errors?.firstName}
          required
          className="md:col-span-1"
        />

        <Input
          label="Middle Name"
          type="text"
          placeholder="Enter your middle name (optional)"
          value={formData?.middleName}
          onChange={(e) => onChange('middleName', e?.target?.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          value={formData?.lastName}
          onChange={(e) => onChange('lastName', e?.target?.value)}
          error={errors?.lastName}
          required
        />

        <Input
          label="Date of Birth"
          type="date"
          description="You must be at least 18 years old"
          value={formData?.dateOfBirth}
          onChange={(e) => onChange('dateOfBirth', e?.target?.value)}
          error={errors?.dateOfBirth}
          required
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))?.toISOString()?.split('T')?.[0]}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Select
          label="Gender"
          options={genderOptions}
          value={formData?.gender}
          onChange={(value) => onChange('gender', value)}
          error={errors?.gender}
          required
        />

        <Select
          label="Marital Status"
          options={maritalStatusOptions}
          value={formData?.maritalStatus}
          onChange={(value) => onChange('maritalStatus', value)}
          error={errors?.maritalStatus}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          description="We'll use this for important updates"
          value={formData?.email}
          onChange={(e) => onChange('email', e?.target?.value)}
          error={errors?.email}
          required
        />

        <Input
          label="Mobile Number"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="9876543210"
          description="10-digit Indian mobile number"
          value={formData?.phone}
          onChange={(e) => onChange('phone', e?.target?.value?.replace(/\D/g, '').slice(0, 10))}
          error={errors?.phone}
          required
          maxLength={10}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="Aadhaar (last 4 digits)"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="1234"
          description="Last 4 digits of your Aadhaar number only"
          value={formData?.aadhaar}
          onChange={(e) => onChange('aadhaar', e?.target?.value?.replace(/\D/g, '').slice(0, 4))}
          error={errors?.aadhaar}
          required
          maxLength={4}
        />

        <Input
          label="PAN Number"
          type="text"
          placeholder="ABCDE1234F"
          description="10-character PAN number"
          value={formData?.pan}
          onChange={(e) => onChange('pan', e?.target?.value?.toUpperCase())}
          error={errors?.pan}
          required
          maxLength={10}
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;