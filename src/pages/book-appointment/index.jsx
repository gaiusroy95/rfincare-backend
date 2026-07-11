import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { apiClient } from '../../lib/apiClient';
import { getApiErrorMessage } from '../../lib/apiErrors';

const TOPIC_OPTIONS = [
  { value: 'Personal Loan', label: 'Personal Loan' },
  { value: 'Home Loan', label: 'Home Loan' },
  { value: 'Business Loan', label: 'Business Loan' },
  { value: 'Credit cards', label: 'Credit cards' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Mutual Funds / SIP', label: 'Mutual Funds / SIP' },
  { value: 'CIBIL / Credit score', label: 'CIBIL / Credit score' },
  { value: 'General financial advice', label: 'General financial advice' },
];

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  topic: 'Personal Loan',
  preferredDate: '',
  preferredTime: '',
  notes: '',
};

const BookAppointment = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    (async () => {
      try {
        setSlotsLoading(true);
        const res = await apiClient.get('/public/appointments/slots');
        if (!cancelled) setSlots(Array.isArray(res.data?.slots) ? res.data.slots : []);
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dateOptions = useMemo(() => {
    const seen = new Set();
    return slots
      .filter((s) => {
        if (seen.has(s.date)) return false;
        seen.add(s.date);
        return true;
      })
      .map((s) => ({
        value: s.date,
        label: new Date(`${s.date}T00:00:00`).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      }));
  }, [slots]);

  const timeOptions = useMemo(() => {
    if (!form.preferredDate) return [];
    return slots
      .filter((s) => s.date === form.preferredDate)
      .map((s) => ({ value: s.time, label: s.time }));
  }, [slots, form.preferredDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Valid email required';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
      next.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!form.topic) next.topic = 'Select a topic';
    if (!form.preferredDate) next.preferredDate = 'Select a date';
    if (!form.preferredTime) next.preferredTime = 'Select a time';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError('');
    try {
      const res = await apiClient.post('/public/appointments', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, '').slice(-10),
        topic: form.topic,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        notes: form.notes.trim() || undefined,
      });
      setResult(res.data);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not book appointment. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <MarketingPageShell
        title="Appointment booked"
        subtitle="Confirmation emails are on the way to you and our sales team."
      >
        <section className="py-12">
          <div className="max-w-xl mx-auto px-4">
            <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle2" size={28} className="text-[var(--color-brand-green)]" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">You&apos;re all set</h2>
              <p className="text-muted-foreground mb-4">
                Your expert consultation is scheduled for{' '}
                <span className="font-semibold text-foreground">{result.whenLabel}</span>.
              </p>
              <ul className="text-sm text-left space-y-2 mb-6 bg-muted/40 rounded-xl p-4">
                <li className="flex gap-2">
                  <Icon name="Mail" size={16} className="text-primary mt-0.5 shrink-0" />
                  Confirmation email sent to your inbox (with calendar invite).
                </li>
                <li className="flex gap-2">
                  <Icon name="Users" size={16} className="text-primary mt-0.5 shrink-0" />
                  Sales team notified at the same time.
                </li>
                {result.googleCalendar?.synced ? (
                  <li className="flex gap-2">
                    <Icon name="Calendar" size={16} className="text-primary mt-0.5 shrink-0" />
                    Synced to company Google Calendar.
                    {result.googleCalendar.eventLink ? (
                      <a
                        href={result.googleCalendar.eventLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary font-medium underline"
                      >
                        Open event
                      </a>
                    ) : null}
                  </li>
                ) : (
                  <li className="flex gap-2">
                    <Icon name="Calendar" size={16} className="text-primary mt-0.5 shrink-0" />
                    Calendar invite (.ics) attached to both emails.
                  </li>
                )}
              </ul>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button className="rf-btn-primary" onClick={() => navigate('/homepage')}>
                  Back to Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setForm(EMPTY);
                  }}
                >
                  Book another
                </Button>
              </div>
            </div>
          </div>
        </section>
      </MarketingPageShell>
    );
  }

  return (
    <MarketingPageShell
      title="Talk to an Expert"
      subtitle="Book a free consultation. We’ll sync it to Google Calendar and email you and our sales team."
    >
      <section className="py-10 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-border rounded-2xl shadow-sm p-5 md:p-8">
            <div className="flex items-start gap-3 mb-6 pb-5 border-b border-border">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon name="Calendar" size={22} className="text-[var(--color-brand-green)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Book your appointment</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  30-minute call · Mon–Sat · Confirmation by email
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  name="fullName"
                  label="Full name"
                  value={form.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  required
                />
                <Input
                  name="email"
                  type="email"
                  label="Email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
                <Input
                  name="phone"
                  type="tel"
                  label="Mobile"
                  value={form.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="10-digit number"
                  required
                />
                <Select
                  label="Topic"
                  value={form.topic}
                  onChange={(value) => {
                    setForm((prev) => ({ ...prev, topic: value }));
                    if (errors.topic) setErrors((prev) => ({ ...prev, topic: '' }));
                  }}
                  options={TOPIC_OPTIONS}
                  required
                />
                <Select
                  label="Preferred date"
                  value={form.preferredDate}
                  onChange={(value) => {
                    setForm((prev) => ({ ...prev, preferredDate: value, preferredTime: '' }));
                    if (errors.preferredDate) setErrors((prev) => ({ ...prev, preferredDate: '' }));
                  }}
                  options={dateOptions}
                  placeholder={slotsLoading ? 'Loading dates…' : 'Select date'}
                  required
                />
                <Select
                  label="Preferred time (IST)"
                  value={form.preferredTime}
                  onChange={(value) => {
                    setForm((prev) => ({ ...prev, preferredTime: value }));
                    if (errors.preferredTime) setErrors((prev) => ({ ...prev, preferredTime: '' }));
                  }}
                  options={timeOptions}
                  placeholder={form.preferredDate ? 'Select time' : 'Pick a date first'}
                  disabled={!form.preferredDate}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm"
                  placeholder="Tell us briefly what you need help with"
                />
              </div>

              {formError ? (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  {formError}
                </p>
              ) : null}

              <Button
                type="submit"
                className="rf-btn-primary w-full sm:w-auto"
                loading={submitting}
                iconName="Calendar"
              >
                Confirm appointment
              </Button>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Icon name="Shield" size={12} />
                You and our sales team both receive email + calendar invite.
              </p>
            </form>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
};

export default BookAppointment;
