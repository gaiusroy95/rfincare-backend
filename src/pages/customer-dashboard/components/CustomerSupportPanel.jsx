import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useSiteContact } from '../../../contexts/SiteContactContext';
import { useAuth } from '../../../contexts/AuthContext';
import CustomerLiveChatDrawer from './CustomerLiveChatDrawer';
import StaffSupportChatInbox from './StaffSupportChatInbox';

const SUPPORT_CHANNELS = [
  {
    icon: 'MessageSquare',
    title: 'Live Chat',
    description: 'Chat with our support team',
    availability: 'Available 24/7',
    color: 'from-emerald-600 to-[var(--color-brand-green-dark)]',
    action: 'chat',
  },
  {
    icon: 'Phone',
    title: 'Call Support',
    description: 'Speak with a financial expert',
    availability: 'Mon–Sat, 9 AM – 6 PM',
    color: 'from-green-500 to-green-600',
    action: 'phone',
  },
  {
    icon: 'Mail',
    title: 'Email Support',
    description: 'Send us your query',
    availability: 'Response within 24 hours',
    color: 'from-teal-500 to-emerald-600',
    action: 'email',
  },
  {
    icon: 'HelpCircle',
    title: 'FAQ Center',
    description: 'Find quick answers',
    availability: 'Self-service',
    color: 'from-orange-500 to-orange-600',
    action: 'faq',
  },
];

const CustomerSupportPanel = () => {
  const navigate = useNavigate();
  const { contact } = useSiteContact();
  const { user, userProfile } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  const role = userProfile?.role || user?.role || '';
  const isCustomer = role === 'customer';
  const isStaff = ['employee', 'admin', 'super_admin'].includes(role);

  const phone = contact?.phone || contact?.phones?.[0];
  const email = contact?.email || contact?.emails?.[0];

  const openWhatsApp = () => {
    const digits = String(phone || '').replace(/\D/g, '');
    const withCountry = digits.length === 10 ? `91${digits}` : digits;
    if (!withCountry) {
      navigate('/contact-us');
      return;
    }
    window.open(
      `https://wa.me/${withCountry}?text=${encodeURIComponent('Hi Rfincare support, I need help with…')}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleChannel = (action) => {
    if (action === 'chat') {
      if (isCustomer) {
        setChatOpen(true);
        return;
      }
      openWhatsApp();
      return;
    }
    if (action === 'phone' && phone) {
      window.location.href = `tel:${phone}`;
      return;
    }
    if (action === 'email' && email) {
      window.location.href = `mailto:${email}`;
      return;
    }
    if (action === 'faq') {
      navigate('/homepage', { state: { scrollToFaq: true } });
      return;
    }
    navigate('/contact-us');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SUPPORT_CHANNELS.map((channel) => (
          <button
            key={channel.title}
            type="button"
            onClick={() => handleChannel(channel.action)}
            className="group text-left bg-card border border-border rounded-xl p-5 hover:border-[var(--color-brand-green)] hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${channel.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon name={channel.icon} size={22} color="white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-[var(--color-brand-green)]">
                  {channel.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">{channel.description}</p>
                <p className="text-xs font-medium text-[var(--color-brand-green)] mt-2">
                  {channel.availability}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {isStaff ? <StaffSupportChatInbox /> : null}

      <div className="rf-filter-card space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Icon name="Headphones" size={20} className="text-[var(--color-brand-green)]" />
          Contact details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[var(--color-brand-green)] transition-colors"
            >
              <Icon name="Phone" size={18} className="text-[var(--color-brand-green)]" />
              <span>{phone}</span>
            </a>
          ) : null}
          {email ? (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[var(--color-brand-green)] transition-colors"
            >
              <Icon name="Mail" size={18} className="text-[var(--color-brand-green)]" />
              <span className="break-all">{email}</span>
            </a>
          ) : null}
        </div>
        <Button
          variant="outline"
          className="rf-btn-outline-green"
          iconName="MessageCircle"
          onClick={() => (isCustomer ? setChatOpen(true) : navigate('/contact-us'))}
        >
          {isCustomer ? 'Open live chat' : 'Open contact form'}
        </Button>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
        <p className="font-semibold mb-1">Quick tip</p>
        <p>Most queries are resolved within 2 hours during business hours. Keep your application reference handy.</p>
      </div>

      <CustomerLiveChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default CustomerSupportPanel;
