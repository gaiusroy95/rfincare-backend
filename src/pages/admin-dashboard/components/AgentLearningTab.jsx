import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { adminAgentLearningService } from '../../../services/agentLearningService';
import { getApiBaseUrl } from '../../../lib/runtimeConfig';

const CONTENT_TYPES = [
  { value: 'video', label: 'Training video' },
  { value: 'pdf', label: 'PDF document' },
  { value: 'presentation', label: 'Presentation (PPT/PDF)' },
  { value: 'circular', label: 'Circular / notice' },
  { value: 'course', label: 'Course module' },
  { value: 'webinar', label: 'Webinar recording' },
  { value: 'certification', label: 'Certification' },
];

const emptyForm = {
  contentType: 'video',
  title: '',
  description: '',
  durationLabel: '',
  videoUrl: '',
  isNew: true,
  sortOrder: '0',
};

const AgentLearningTab = () => {
  const fileRef = useRef(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAgentLearningService.listAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setMessage('Title is required');
      return;
    }
    if (form.contentType === 'video' && !form.videoUrl.trim() && !file) {
      setMessage('Add a video URL (YouTube/Vimeo) or upload a video file');
      return;
    }
    if (form.contentType !== 'video' && !file) {
      setMessage('Please attach a file');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('contentType', form.contentType);
      fd.append('title', form.title.trim());
      if (form.description) fd.append('description', form.description.trim());
      if (form.durationLabel) fd.append('durationLabel', form.durationLabel.trim());
      if (form.videoUrl) fd.append('videoUrl', form.videoUrl.trim());
      fd.append('isNew', form.isNew ? 'true' : 'false');
      fd.append('sortOrder', form.sortOrder);
      if (file) fd.append('file', file);

      await adminAgentLearningService.publish(fd);
      setMessage('Published — visible on agent dashboards.');
      setForm(emptyForm);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      await load();
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Publish failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    await adminAgentLearningService.update(item.id, { isActive: !item.isActive });
    await load();
  };

  const fileUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    return `${getApiBaseUrl().replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Icon name="GraduationCap" size={22} className="text-primary" />
          Agent learning hub
        </h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Publish training videos, PDFs, presentations, and circulars. Agents see the latest content
          under Training &amp; Certification on their dashboard.
        </p>
      </div>

      {message && (
        <p className="text-sm px-3 py-2 rounded-lg bg-muted border border-border">{message}</p>
      )}

      <form
        onSubmit={handlePublish}
        className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4"
      >
        <h3 className="font-semibold text-foreground">Publish new content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Content type"
            options={CONTENT_TYPES}
            value={form.contentType}
            onChange={(v) => setForm((p) => ({ ...p, contentType: v }))}
          />
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <Input
            label="Duration label (optional)"
            placeholder="e.g. 45 minutes, 4 hours"
            value={form.durationLabel}
            onChange={(e) => setForm((p) => ({ ...p, durationLabel: e.target.value }))}
          />
          <Input
            label="Sort order (lower = higher)"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
          />
        </div>
        <Input
          label="Description"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
        {form.contentType === 'video' && (
          <Input
            label="Video URL (YouTube, Vimeo, or direct link)"
            placeholder="https://..."
            value={form.videoUrl}
            onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
          />
        )}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            {form.contentType === 'video' ? 'Or upload video file' : 'Upload file'}
          </p>
          <input
            ref={fileRef}
            type="file"
            className="block w-full text-sm"
            accept={
              form.contentType === 'video'
                ? 'video/*,.mp4,.webm'
                : '.pdf,.ppt,.pptx,.doc,.docx,application/pdf,application/vnd.ms-powerpoint'
            }
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && <p className="text-xs text-muted-foreground mt-1">{file.name}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => setForm((p) => ({ ...p, isNew: e.target.checked }))}
          />
          Show &quot;New&quot; badge on agent dashboard
        </label>
        <Button type="submit" loading={saving} iconName="Upload">
          Publish to agents
        </Button>
      </form>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">
          Published content ({items.length})
        </div>
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No learning content yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">New</th>
                  <th className="px-4 py-2">Active</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-4 py-3 capitalize">{item.contentType}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.isNew ? 'Yes' : '—'}</td>
                    <td className="px-4 py-3">{item.isActive ? 'Yes' : 'Hidden'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {(item.fileUrl || item.videoUrl) && (
                        <a
                          href={fileUrl(item.videoUrl || item.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline mr-3"
                        >
                          Open
                        </a>
                      )}
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => toggleActive(item)}
                      >
                        {item.isActive ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentLearningTab;
