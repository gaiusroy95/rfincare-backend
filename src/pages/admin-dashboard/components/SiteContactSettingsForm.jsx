import React, { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { cmsService } from '../../../services/cmsService';
import { useSiteContact } from '../../../contexts/SiteContactContext';

const emptyOffice = () => ({ title: '', address: '' });

const SiteContactSettingsForm = () => {
  const { refresh: refreshPublicContact } = useSiteContact();
  const [form, setForm] = useState({
    tagline: '',
    email: '',
    phone: '',
    emailsText: '',
    phonesText: '',
    registeredOfficeLabel: 'Regist. Office:',
    registeredAddress: '',
    branchOfficeLabel: 'Branch Office:',
    branchAddress: '',
    offices: [emptyOffice(), emptyOffice()],
    socialFacebook: '',
    socialTwitter: '',
    socialLinkedin: '',
    socialInstagram: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await cmsService.siteContact.get();
      setForm({
        tagline: data.tagline || '',
        email: data.email || '',
        phone: data.phone || '',
        emailsText: (data.emails || []).join('\n'),
        phonesText: (data.phones || []).join('\n'),
        registeredOfficeLabel: data.registeredOfficeLabel || 'Regist. Office:',
        registeredAddress: data.registeredAddress || '',
        branchOfficeLabel: data.branchOfficeLabel || 'Branch Office:',
        branchAddress: data.branchAddress || '',
        offices:
          data.offices?.length > 0
            ? data.offices.map((o) => ({ title: o.title || '', address: o.address || '' }))
            : [emptyOffice(), emptyOffice()],
        socialFacebook: data.socialFacebook || '',
        socialTwitter: data.socialTwitter || '',
        socialLinkedin: data.socialLinkedin || '',
        socialInstagram: data.socialInstagram || '',
      });
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Failed to load contact settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const emails = form.emailsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const phones = form.phonesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const offices = form.offices.filter((o) => o.title.trim() || o.address.trim());

      await cmsService.siteContact.update({
        tagline: form.tagline,
        email: form.email,
        phone: form.phone,
        emails: emails.length ? emails : [form.email],
        phones: phones.length ? phones : [form.phone],
        registeredOfficeLabel: form.registeredOfficeLabel,
        registeredAddress: form.registeredAddress,
        branchOfficeLabel: form.branchOfficeLabel,
        branchAddress: form.branchAddress,
        offices,
        socialFacebook: form.socialFacebook || '#',
        socialTwitter: form.socialTwitter || '#',
        socialLinkedin: form.socialLinkedin || '#',
        socialInstagram: form.socialInstagram || '#',
      });
      setMessage('Contact details saved. Footer and Contact page are updated.');
      await load();
      await refreshPublicContact();
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateOffice = (index, field, value) => {
    setForm((prev) => {
      const offices = [...prev.offices];
      offices[index] = { ...offices[index], [field]: value };
      return { ...prev, offices };
    });
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading contact settings…</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Site contact & footer</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Updates email, phone, office addresses, and social media links shown in the website footer
          and contact page.
        </p>
      </div>

      {message && (
        <p
          className={`text-sm p-3 rounded-lg ${
            message.includes('saved')
              ? 'bg-success/10 text-success border border-success/30'
              : 'bg-destructive/10 text-destructive border border-destructive/30'
          }`}
        >
          {message}
        </p>
      )}

      <Input
        label="Footer tagline"
        value={form.tagline}
        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Primary email (footer & login)"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Primary phone (footer)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          All emails (one per line, contact page)
        </label>
        <textarea
          className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[72px]"
          value={form.emailsText}
          onChange={(e) => setForm({ ...form, emailsText: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          All phone numbers (one per line, contact page)
        </label>
        <textarea
          className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[72px]"
          value={form.phonesText}
          onChange={(e) => setForm({ ...form, phonesText: e.target.value })}
        />
      </div>

      <div className="border border-border rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-foreground">Footer addresses</h4>
        <Input
          label="Registered office label"
          value={form.registeredOfficeLabel}
          onChange={(e) => setForm({ ...form, registeredOfficeLabel: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Registered address</label>
          <textarea
            className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[80px]"
            value={form.registeredAddress}
            onChange={(e) => setForm({ ...form, registeredAddress: e.target.value })}
          />
        </div>
        <Input
          label="Branch office label"
          value={form.branchOfficeLabel}
          onChange={(e) => setForm({ ...form, branchOfficeLabel: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Branch address</label>
          <textarea
            className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[80px]"
            value={form.branchAddress}
            onChange={(e) => setForm({ ...form, branchAddress: e.target.value })}
          />
        </div>
      </div>

      <div className="border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Contact page — office locations</h4>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setForm((prev) => ({ ...prev, offices: [...prev.offices, emptyOffice()] }))}
          >
            Add office
          </Button>
        </div>
        {form.offices.map((office, index) => (
          <div key={index} className="grid gap-2 p-3 bg-muted/30 rounded-lg">
            <Input
              label={`Office ${index + 1} title`}
              value={office.title}
              onChange={(e) => updateOffice(index, 'title', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Address</label>
              <textarea
                className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[64px]"
                value={office.address}
                onChange={(e) => updateOffice(index, 'address', e.target.value)}
              />
            </div>
            {form.offices.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    offices: prev.offices.filter((_, i) => i !== index),
                  }))
                }
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="border border-border rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-foreground">Social media links</h4>
        <p className="text-xs text-muted-foreground">Full URLs (e.g. https://facebook.com/yourpage)</p>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Facebook"
            value={form.socialFacebook}
            onChange={(e) => setForm({ ...form, socialFacebook: e.target.value })}
          />
          <Input
            label="Twitter / X"
            value={form.socialTwitter}
            onChange={(e) => setForm({ ...form, socialTwitter: e.target.value })}
          />
          <Input
            label="LinkedIn"
            value={form.socialLinkedin}
            onChange={(e) => setForm({ ...form, socialLinkedin: e.target.value })}
          />
          <Input
            label="Instagram"
            value={form.socialInstagram}
            onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save contact settings'}
      </Button>
    </div>
  );
};

export default SiteContactSettingsForm;
