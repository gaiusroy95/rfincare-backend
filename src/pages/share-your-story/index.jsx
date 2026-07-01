import React, { useState, useRef } from 'react';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { homepageService } from '../../services/homepageService';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ShareYourStory = () => {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    submitterName: '',
    submitterEmail: '',
    submitterPhone: '',
    storyType: 'customer',
    storyText: '',
    location: '',
    loanAmount: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview('');
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Photo must be JPG, PNG, or WebP.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Photo must be under 5 MB.');
      return;
    }
    setError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await homepageService.submitStory(form, photoFile);
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Share Your Story</h1>
        <p className="text-muted-foreground mb-8">
          Tell us about your loan journey. Approved stories may appear on our homepage after review.
        </p>
        {done ? (
          <p className="text-green-600 font-medium">
            Thank you! Your story is pending moderation and will appear once approved.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Input
              label="Your name"
              value={form.submitterName}
              onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.submitterEmail}
              onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={form.submitterPhone}
              onChange={(e) => setForm({ ...form, submitterPhone: e.target.value })}
              placeholder="10-digit mobile (recommended)"
            />
            <Select
              label="I am a"
              value={form.storyType}
              onChange={(v) => setForm({ ...form, storyType: v })}
              options={[
                { value: 'customer', label: 'Customer' },
                { value: 'agent', label: 'Agent' },
              ]}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Your story</label>
              <textarea
                className="w-full min-h-[160px] rounded-md border border-input px-3 py-2"
                value={form.storyText}
                onChange={(e) => setForm({ ...form, storyText: e.target.value })}
                required
                minLength={20}
                placeholder="Describe your experience (minimum 20 characters)"
              />
            </div>
            <Input
              label="Location (optional)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City, State"
            />
            <Input
              label="Loan amount (optional)"
              value={form.loanAmount}
              onChange={(e) => setForm({ ...form, loanAmount: e.target.value })}
              placeholder="e.g. ₹5,00,000"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Photo (optional)</label>
              <p className="text-xs text-muted-foreground">
                Add a photo of yourself or your experience. JPG, PNG, or WebP, max 5 MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="flex flex-wrap gap-3 items-start">
                <Button
                  type="button"
                  variant="outline"
                  iconName="Upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoFile ? 'Change photo' : 'Upload photo'}
                </Button>
                {photoFile && (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              {photoPreview && (
                <div className="mt-2 rounded-lg border border-border overflow-hidden max-w-xs">
                  <img src={photoPreview} alt="Preview" className="w-full h-auto object-cover max-h-48" />
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit story'}
            </Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ShareYourStory;
