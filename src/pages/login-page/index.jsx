import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
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
      accent: 'border-amber-200 bg-amber-50 hover:border-amber-400',
      iconBg: 'bg-amber-600',
      route: '/admin-login',
    },
    {
      id: 'employee',
      title: 'Employee Login',
      description: 'Process applications and manage tasks',
      icon: 'Users',
      accent: 'border-sky-200 bg-sky-50 hover:border-sky-400',
      iconBg: 'bg-sky-600',
      route: '/employee-login',
    },
    {
      id: 'agent',
      title: 'Agent Login',
      description: 'Manage clients and track commissions',
      icon: 'Briefcase',
      accent: 'border-emerald-200 bg-emerald-50 hover:border-[var(--color-brand-green)]',
      iconBg: 'bg-[var(--color-brand-green)]',
      route: '/agent-login',
    },
  ];

  return (
    <MarketingPageShell
      title="Staff Portal Access"
      subtitle={(
        <>
          Select your role below. Customers should use{' '}
          <button type="button" onClick={() => navigate('/customer-login')} className="underline font-semibold hover:text-white">
            Customer Login
          </button>
          .
        </>
      )}
    >
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Choose Your Portal</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Internal team logins only. Bookmark or share the direct links below.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {loginPortals.map((portal) => (
              <button
                key={portal.id}
                type="button"
                onClick={() => navigate(portal.route)}
                className={`text-left border-2 rounded-xl p-6 transition-all shadow-sm hover:shadow-md ${portal.accent}`}
              >
                <div className={`w-14 h-14 ${portal.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon name={portal.icon} size={28} color="white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{portal.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{portal.description}</p>
                <p className="text-xs text-muted-foreground font-mono mb-4">{portal.route}</p>
                <span className="inline-flex items-center text-sm font-semibold text-[var(--color-brand-green)]">
                  Continue <Icon name="ArrowRight" size={16} className="ml-1" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">Why Choose RFINCARE?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'Lock', title: 'Secure Access', desc: 'Bank-grade security with role-based access' },
              { icon: 'Zap', title: 'Fast Processing', desc: 'Quick approvals and instant updates' },
              { icon: 'Headphones', title: '24/7 Support', desc: 'Round-the-clock assistance for all users' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon name={item.icon} size={26} className="text-[var(--color-brand-green)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            If you&apos;re having trouble logging in, our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" className="rf-btn-outline-green" onClick={() => navigate('/contact-us')}>
              Contact Support
            </Button>
            <Button className="rf-btn-primary" onClick={() => navigate('/homepage')}>
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
};

export default LoginPage;
