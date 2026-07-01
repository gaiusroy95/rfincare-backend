import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import AppImage from 'components/AppImage';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const quickLinks = [
    { label: 'Home', path: '/', icon: 'Home' },
    { label: 'About Us', path: '/about-us', icon: 'Info' },
    { label: 'Contact Support', path: '/contact-us', icon: 'MessageCircle' },
    { label: 'Check Eligibility', path: '/eligibility-assessment', icon: 'CheckCircle' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="text-center max-w-2xl">
        {/* Rfincare Logo */}
        <div className="flex justify-center mb-8">
          <AppImage
            src="/assets/images/Logo_-_Copy_-_Copy-1771484476490.jpg"
            alt="Rfincare Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* 404 Error Display */}
        <div className="relative mb-6">
          <h1 className="text-9xl font-bold text-blue-600 opacity-20">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-6 shadow-lg">
              <Icon name="AlertCircle" size={48} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            variant="primary"
            icon={<Icon name="Home" />}
            iconPosition="left"
            onClick={handleGoHome}
            className="px-6 py-3"
          >
            Back to Home
          </Button>

          <Button
            variant="outline"
            icon={<Icon name="ArrowLeft" />}
            iconPosition="left"
            onClick={() => window.history?.back()}
            className="px-6 py-3"
          >
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Quick Links
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickLinks?.map((link) => (
              <button
                key={link?.path}
                onClick={() => navigate(link?.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-blue-50 transition-colors duration-200 group"
              >
                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
                  <Icon name={link?.icon} size={20} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  {link?.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Support Message */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need help?{' '}
            <button
              onClick={() => navigate('/contact-us')}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Contact our support team
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
