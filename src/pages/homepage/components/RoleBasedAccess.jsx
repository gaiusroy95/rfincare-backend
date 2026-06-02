import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RoleBasedAccess = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'customer',
      title: 'Customer Portal',
      description: 'Apply for loans, track applications, and manage documents',
      icon: 'User',
      color: 'var(--color-customer-primary)',
      features: ['Quick eligibility check', 'Bank marketplace', 'Document vault', 'Application tracking'],
      route: '/customer-login'
    },
    {
      id: 'agent',
      title: 'Agent Dashboard',
      description: 'Manage clients, track commissions, and grow your business',
      icon: 'Users',
      color: 'var(--color-agent-primary)',
      features: ['Client management', 'Commission tracking', 'Performance analytics', 'Training resources'],
      route: '/agent-login'
    },
    {
      id: 'admin',
      title: 'Admin Control',
      description: 'Oversee operations, manage agents, and configure systems',
      icon: 'Shield',
      color: 'var(--color-admin-primary)',
      features: ['Application oversight', 'Agent management', 'Interest matrix', 'Comprehensive reports'],
      route: '/admin-login'
    },
    {
      id: 'employee',
      title: 'Employee Portal',
      description: 'Process applications, verify documents, and maintain compliance',
      icon: 'Briefcase',
      color: 'var(--color-employee-primary)',
      features: ['Document verification', 'Status updates', 'Workflow management', 'Audit compliance'],
      route: '/employee-login'
    }
  ];

  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Choose Your Journey
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your role to access personalized features and workflows designed for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {roles?.map((role) => (
            <div
              key={role?.id}
              className="feature-card group cursor-pointer"
              onClick={() => navigate(role?.route)}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: role?.color }}
                  >
                    <Icon name={role?.icon} size={24} color="white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">{role?.title}</h3>
                </div>

                <p className="text-sm md:text-base text-muted-foreground mb-4 flex-grow">
                  {role?.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {role?.features?.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-xs md:text-sm">
                      <Icon name="Check" size={16} color={role?.color} className="flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  size="default"
                  fullWidth
                  iconName="ArrowRight"
                  iconPosition="right"
                  className="mt-auto"
                >
                  Access Portal
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleBasedAccess;