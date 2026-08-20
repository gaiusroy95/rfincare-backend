import React, { useState, useEffect, useMemo } from 'react';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useSiteContact } from '../../contexts/SiteContactContext';
import { apiClient } from '../../lib/apiClient';
import { getApiErrorMessage } from '../../lib/apiErrors';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const ContactUs = () => {
  const { contact } = useSiteContact();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpRequirements, setOtpRequirements] = useState({
    requireMobileOtp: true,
    requireEmailOtp: true,
  });
  const [otpInfo, setOtpInfo] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

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
    if (formError) setFormError('');
    if (otpRequested) {
      setOtpRequested(false);
      setMobileOtp('');
      setEmailOtp('');
      setOtpInfo('');
    }
  };

  const validate = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError('Please enter your full name.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, '').slice(-10))) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!formData.subject.trim()) {
      setFormError('Please enter a subject.');
      return false;
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      setFormError('Please enter your message.');
      return false;
    }
    if (!consentAccepted) {
      setFormError(
        'Please accept the consent note to continue with OTP verification and send your message.',
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, '').slice(-10),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        consentAccepted: true,
      };

      if (!otpRequested) {
        const otpRes = await apiClient.post('/public/contact/otp/request', payload);
        setOtpRequested(true);
        setOtpRequirements({
          requireMobileOtp: otpRes.data?.requireMobileOtp !== false,
          requireEmailOtp: otpRes.data?.requireEmailOtp !== false,
        });
        setOtpInfo('OTP sent. Please verify to send your message.');
        if (Array.isArray(otpRes.data?.warnings) && otpRes.data.warnings.length) {
          setFormError(otpRes.data.warnings.join(' '));
        }
        return;
      }

      if (otpRequirements.requireMobileOtp && mobileOtp.trim().length !== 6) {
        setFormError('Please enter a valid 6-digit mobile OTP.');
        return;
      }
      if (otpRequirements.requireEmailOtp && emailOtp.trim().length !== 6) {
        setFormError('Please enter a valid 6-digit email OTP.');
        return;
      }

      const verifyRes = await apiClient.post('/public/contact/otp/verify', {
        email: payload.email,
        phone: payload.phone,
        mobileOtp: otpRequirements.requireMobileOtp ? mobileOtp.trim() : undefined,
        emailOtp: otpRequirements.requireEmailOtp ? emailOtp.trim() : undefined,
      });

      const res = await apiClient.post('/public/contact', {
        ...payload,
        otpVerificationId: verifyRes.data?.otpVerificationId,
      });
      setResult(res.data);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not send your message. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setFormData(EMPTY_FORM);
    setConsentAccepted(false);
    setOtpRequested(false);
    setMobileOtp('');
    setEmailOtp('');
    setOtpInfo('');
    setFormError('');
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

            {result ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={32} color="white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-4">
                  Thank you for contacting us. We&apos;ll get back to you soon.
                </p>
                <ul className="text-sm text-left space-y-2 mb-6 bg-muted/40 rounded-xl p-4 max-w-md mx-auto">
                  <li className="flex gap-2">
                    <Icon name="Mail" size={16} className="text-primary mt-0.5 shrink-0" />
                    {result?.emails?.customer?.sent
                      ? 'Confirmation email sent to your inbox.'
                      : 'Confirmation email may not have been delivered. Our team still received your inquiry.'}
                  </li>
                  <li className="flex gap-2">
                    <Icon name="ShieldCheck" size={16} className="text-primary mt-0.5 shrink-0" />
                    Your contact was verified with OTP before submission.
                  </li>
                </ul>
                {Array.isArray(result?.notificationWarnings) && result.notificationWarnings.length ? (
                  <p className="text-xs text-amber-700 mb-4">{result.notificationWarnings.join(' ')}</p>
                ) : null}
                <Button type="button" className="rf-btn-primary" onClick={resetForm}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email Address *</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subject *</label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="How can we help?"
                      required
                    />
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

                <label className="flex items-start gap-2.5 rounded-lg border border-border p-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={consentAccepted}
                    onChange={(e) => {
                      setConsentAccepted(e.target.checked);
                      if (formError) setFormError('');
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    I here by authorized to send notifications via SMS, Email, RCS and other as per
                    terms of service &amp; privacy policy.
                  </span>
                </label>

                {otpRequested ? (
                  <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
                    {otpInfo ? (
                      <p className="text-sm text-[var(--color-brand-green)] font-medium">{otpInfo}</p>
                    ) : null}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {otpRequirements.requireMobileOtp ? (
                        <Input
                          name="mobileOtp"
                          label="Mobile OTP"
                          value={mobileOtp}
                          onChange={(e) => {
                            setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                            if (formError) setFormError('');
                          }}
                          maxLength={6}
                          placeholder="6-digit OTP"
                          required
                        />
                      ) : null}
                      {otpRequirements.requireEmailOtp ? (
                        <Input
                          name="emailOtp"
                          label="Email OTP"
                          value={emailOtp}
                          onChange={(e) => {
                            setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                            if (formError) setFormError('');
                          }}
                          maxLength={6}
                          placeholder="6-digit OTP"
                          required
                        />
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {formError ? (
                  <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full rf-btn-primary"
                  size="lg"
                  disabled={submitting}
                  loading={submitting}
                >
                  {otpRequested ? 'Verify OTP & Send Message' : 'Send OTP for Message'}
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
              {
                q: 'What are your business hours?',
                a: "We're available Monday to Saturday, 9 AM to 6 PM IST. Online services are available 24/7.",
              },
              {
                q: 'How long does loan approval take?',
                a: 'Most applications are processed within 24-48 hours. Complex cases may take up to 5 business days.',
              },
              {
                q: 'Is my information secure?',
                a: 'Yes — we use bank-grade encryption and follow strict data protection regulations.',
              },
              {
                q: 'Do you charge for eligibility checks?',
                a: 'No, our eligibility assessment is completely free with no hidden charges.',
              },
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
