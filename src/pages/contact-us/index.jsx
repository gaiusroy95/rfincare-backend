import React, { useState, useEffect, useMemo } from 'react';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useSiteContact } from '../../contexts/SiteContactContext';

const ContactUs = () => {
  const { contact } = useSiteContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactInfo = useMemo(
    () => [
      {
        icon: 'Phone',
        title: 'Phone',
        details: (contact.phones || [contact.phone]).filter(Boolean).map((p) =>
          p.startsWith('+') ? p : `+91-${p}`,
        ),
        description: 'Mon-Sat, 9 AM - 6 PM',
      },
      {
        icon: 'Mail',
        title: 'Email',
        details: contact.emails?.length ? contact.emails : [contact.email],
        description: "We'll respond within 24 hours",
      },
    ],
    [contact],
  );

  const officeAddresses = useMemo(() => {
    if (contact.offices?.length) return contact.offices;
    return [
      { title: 'Reg. Office', address: contact.registeredAddress },
      { title: 'Branch Office', address: contact.branchAddress },
    ].filter((o) => o.address);
  }, [contact]);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <MarketingPageShell
      title="Contact Us"
      subtitle="Have questions? Our financial experts are here to help — reach out anytime."
    >
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {contactInfo.map((info, index) => (
              <div key={index} className="rf-sidebar-widget text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon name={info.icon} size={26} className="text-[var(--color-brand-green)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                {info.details?.map((detail, idx) => (
                  <p key={idx} className="text-foreground font-medium">{detail}</p>
                ))}
                <p className="text-sm text-muted-foreground mt-2">{info.description}</p>
              </div>
            ))}
          </div>

          {officeAddresses.length > 0 ? (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-center mb-6">Our Offices</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {officeAddresses.map((office, index) => (
                  <div key={index} className="rf-sidebar-widget">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                      <Icon name="MapPin" size={20} className="text-[var(--color-brand-green)]" />
                    </div>
                    <h3 className="font-semibold mb-2">{office.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{office.address}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-12 bg-white border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rf-filter-card">
            <h2 className="text-2xl font-bold mb-6 text-center">Send Us a Message</h2>

            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={32} color="white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground">Thank you for contacting us. We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                    <Input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email Address *</label>
                    <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
                    <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subject *</label>
                    <Input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="How can we help?" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)]/30 outline-none"
                    placeholder="Tell us more about your inquiry..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full rf-btn-primary" size="lg">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What are your business hours?', a: "We're available Monday to Saturday, 9 AM to 6 PM IST. Online services are available 24/7." },
              { q: 'How long does loan approval take?', a: 'Most applications are processed within 24-48 hours. Complex cases may take up to 5 business days.' },
              { q: 'Is my information secure?', a: 'Yes — we use bank-grade encryption and follow strict data protection regulations.' },
              { q: 'Do you charge for eligibility checks?', a: 'No, our eligibility assessment is completely free with no hidden charges.' },
            ].map((faq) => (
              <div key={faq.q} className="rf-sidebar-widget">
                <h3 className="font-semibold mb-1">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
};

export default ContactUs;
