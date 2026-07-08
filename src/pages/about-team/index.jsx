import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const TEAM_MEMBERS = [
  {
    name: 'Leadership Team',
    role: 'Strategy & partnerships',
    description: 'Experienced leaders guiding RFINCARE’s mission to make financial services accessible across India.',
    icon: 'Briefcase',
  },
  {
    name: 'Product & Technology',
    role: 'Platform & innovation',
    description: 'Engineers and product specialists building secure, easy-to-use tools for customers and partners.',
    icon: 'Cpu',
  },
  {
    name: 'Customer Success',
    role: 'Support & guidance',
    description: 'Dedicated advisors helping you compare options, check eligibility, and complete applications with confidence.',
    icon: 'Headphones',
  },
  {
    name: 'Operations & Compliance',
    role: 'Trust & quality',
    description: 'Experts ensuring RBI-partner standards, data security, and smooth processing at every step.',
    icon: 'ShieldCheck',
  },
];

const AboutTeam = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MarketingPageShell
      title="About Our Team"
      subtitle="The people behind RFINCARE — committed to transparency, expertise, and your financial success."
    >
      <section className="py-14 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-muted-foreground leading-relaxed">
              Our multidisciplinary team brings together financial expertise, technology, and customer care
              to help millions of Indians compare loans, insurance, investments, and more — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="rf-why-card bg-white h-full">
                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon name={member.icon} size={24} className="text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-green)] mb-2">
                  {member.role}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[var(--color-brand-green-dark)] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Need help from our team?</h2>
          <p className="text-white/90 mb-6">
            Reach out for product guidance, application support, or partnership enquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-white text-[var(--color-brand-green)] hover:bg-white/90"
              onClick={() => navigate('/contact-us')}
            >
              Contact Us Help
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10"
              onClick={() => navigate('/about-us')}
            >
              About RFINCARE
            </Button>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
};

export default AboutTeam;
