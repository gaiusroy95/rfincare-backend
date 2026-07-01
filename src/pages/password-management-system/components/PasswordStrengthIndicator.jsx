import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = () => {
    let strength = 0;
    
    if (password?.length >= 8) strength += 20;
    if (password?.length >= 12) strength += 10;
    if (/[a-z]/?.test(password)) strength += 20;
    if (/[A-Z]/?.test(password)) strength += 20;
    if (/[0-9]/?.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/?.test(password)) strength += 15;
    
    return strength;
  };

  let strength = calculateStrength();
  
  const getStrengthLabel = () => {
    if (strength < 40) return { label: 'Weak', color: 'bg-red-500' };
    if (strength < 70) return { label: 'Fair', color: 'bg-yellow-500' };
    if (strength < 90) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const { label, color } = getStrengthLabel();

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password Strength:</span>
        <span className="text-xs font-medium text-gray-900">{label}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;