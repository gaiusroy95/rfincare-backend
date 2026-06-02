import React from 'react';
import { Shield, Users, Briefcase, UserCheck } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function RoleSelector({ selectedRole, onRoleChange }) {
  const roles = [
    { id: 'admin', label: 'Admin', icon: Shield, color: 'bg-red-100 text-red-700 border-red-300', activeColor: 'bg-red-600 text-white border-red-600' },
    { id: 'agent', label: 'Agent', icon: Users, color: 'bg-blue-100 text-blue-700 border-blue-300', activeColor: 'bg-blue-600 text-white border-blue-600' },
    { id: 'employee', label: 'Employee', icon: Briefcase, color: 'bg-green-100 text-green-700 border-green-300', activeColor: 'bg-green-600 text-white border-green-600' },
    { id: 'customer', label: 'Customer', icon: UserCheck, color: 'bg-purple-100 text-purple-700 border-purple-300', activeColor: 'bg-purple-600 text-white border-purple-600' }
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Role</label>
      <div className="grid grid-cols-2 gap-3">
        {roles?.map((role) => {
          const Icon = role?.icon;
          const isActive = selectedRole === role?.id;

          return (
            <button
              key={role?.id}
              type="button"
              onClick={() => onRoleChange(role?.id)}
              className={`p-4 border-2 rounded-lg transition-all ${
                isActive ? role?.activeColor : `${role?.color} hover:shadow-md`
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{role?.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}