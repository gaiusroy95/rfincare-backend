import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loginPortals = [
    {
      id: 'admin',
      title: 'Admin Login',
      description: 'Access admin dashboard and system management',
      icon: 'Shield',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-400',
      hoverColor: 'hover:bg-yellow-200',
      iconBg: 'bg-yellow-400',
      route: '/admin-login'
    },
    {
      id: 'employee',
      title: 'Employee Login',
      description: 'Process applications and manage tasks',
      icon: 'Users',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-400',
      hoverColor: 'hover:bg-blue-200',
      iconBg: 'bg-blue-500',
      route: '/employee-login'
    },
    {
      id: 'agent',
      title: 'Agent Login',
      description: 'Manage clients and track commissions',
      icon: 'Briefcase',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-400',
      hoverColor: 'hover:bg-gray-200',
      iconBg: 'bg-gray-500',
      route: '/agent-login',
    },
  ];

  const staffLoginLinks = loginPortals.map((portal) => ({
    ...portal,
    href: `${window.location.origin}${portal.route}`,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome Back</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Staff portal access — select your role below. Customers should use{' '}
              <button
                type="button"
                onClick={() => navigate('/customer-login')}
                className="underline font-semibold hover:text-white"
              >
                Customer Login
              </button>
              .
            </p>
          </div>
        </section>

        {/* Login Portals */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">Choose Your Portal</h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
              Internal team logins only. Bookmark or share the direct links below.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {loginPortals?.map((portal) => (
                <div
                  key={portal?.id}
                  className={`${portal?.bgColor} ${portal?.borderColor} border-2 rounded-xl p-6 cursor-pointer transition-all ${portal?.hoverColor} shadow-md hover:shadow-xl`}
                  onClick={() => navigate(portal?.route)}
                >
                  <div className={`w-16 h-16 ${portal?.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon name={portal?.icon} size={32} color="white" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">{portal?.title}</h3>
                  <p className="text-sm text-gray-700 text-center mb-2">{portal?.description}</p>
                  <p className="text-xs text-gray-500 text-center mb-4 font-mono break-all px-1">
                    {portal?.route}
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e?.stopPropagation();
                      navigate(portal?.route);
                    }}
                  >
                    Login
                  </Button>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Rfincare?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Lock" size={32} color="#6366f1" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
                <p className="text-gray-600">Bank-grade security with multi-factor authentication</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Zap" size={32} color="#6366f1" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
                <p className="text-gray-600">Quick loan approvals and instant updates</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="HeadphonesIcon" size={32} color="#6366f1" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600">Round-the-clock assistance for all users</p>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Need Help?</h2>
            <p className="text-lg text-gray-600 mb-8">
              If you're having trouble logging in or need assistance, our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/contact-us')}
              >
                Contact Support
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;