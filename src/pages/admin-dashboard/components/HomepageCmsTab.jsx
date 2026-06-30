import React, { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import LegalContentEditor from '../../../components/cms/LegalContentEditor';
import { cmsService } from '../../../services/cmsService';
import { homepageService } from '../../../services/homepageService';
import { prepareLegalHtml } from '../../../utils/legalContent';
import { LEGAL_PAGE_SECTIONS } from '../../../constants/legalPages';
import { getStoryPhotoUrl, formatStoryDate } from '../../../utils/storyMedia';
import SiteContactSettingsForm from './SiteContactSettingsForm';

const HomepageCmsTab = () => {
  const [tab, setTab] = useState('news');
  const [news, setNews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [stories, setStories] = useState([]);
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', blogUrl: '', imageUrl: '', category: '', isPublished: true });
  const [videoForm, setVideoForm] = useState({ title: '', description: '', youtubeUrl: '', isPublished: true });
  const [legalSlug, setLegalSlug] = useState('privacy-policy');
  const [legalForm, setLegalForm] = useState({ title: '', bodyHtml: '' });
  const [trustForm, setTrustForm] = useState({
    heading: 'Trusted by Thousands',
    subtitle: 'Our commitment to security, transparency, and customer success speaks for itself',
    stats: [],
    certifications: [],
  });
  const [aboutForm, setAboutForm] = useState({
    heroTitle: 'About Rfincare',
    heroSubtitle:
      'Empowering Indians with smart financial solutions through technology and transparency',
    stats: [],
    values: [],
    storyHeading: 'Our Story',
    storyParagraphsText: '',
  });

  const load = async () => {
    const [n, v, s] = await Promise.all([
      cmsService.news.list(),
      cmsService.videos.list(),
      cmsService.stories.list('pending'),
    ]);
    setNews(n); setVideos(v); setStories(s);
  };

  const loadLegal = async (slug) => {
    const page = await homepageService.getLegalPage(slug);
    setLegalForm({ title: page.title, bodyHtml: page.bodyHtml || '' });
    setLegalSlug(slug);
  };

  useEffect(() => {
    load().catch(console.error);
    loadLegal('privacy-policy').catch(() => {});
    cmsService.trustSignals.get().then((data) => {
      setTrustForm({
        heading: data?.heading || 'Trusted by Thousands',
        subtitle:
          data?.subtitle ||
          'Our commitment to security, transparency, and customer success speaks for itself',
        stats: Array.isArray(data?.stats) ? data.stats : [],
        certifications: Array.isArray(data?.certifications) ? data.certifications : [],
      });
    }).catch(() => {});
    cmsService.aboutContent.get().then((data) => {
      setAboutForm({
        heroTitle: data?.heroTitle || 'About Rfincare',
        heroSubtitle:
          data?.heroSubtitle ||
          'Empowering Indians with smart financial solutions through technology and transparency',
        stats: Array.isArray(data?.stats) ? data.stats : [],
        values: Array.isArray(data?.values) ? data.values : [],
        storyHeading: data?.storyHeading || 'Our Story',
        storyParagraphsText: Array.isArray(data?.storyParagraphs)
          ? data.storyParagraphs.join('\n\n')
          : '',
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {['contact', 'news', 'videos', 'stories', 'trust', 'about', 'legal'].map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t)}>
            {t === 'legal' ? 'Legal & policies' : t}
          </Button>
        ))}
      </div>
      {tab === 'contact' && <SiteContactSettingsForm />}
      {tab === 'news' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 border rounded-lg p-4">
            <h3 className="font-semibold">Add news / blog</h3>
            <Input label="Title" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} />
            <Input label="Excerpt" value={newsForm.excerpt} onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })} />
            <Input label="Blog URL" value={newsForm.blogUrl} onChange={(e) => setNewsForm({ ...newsForm, blogUrl: e.target.value })} />
            <Input label="Image URL" value={newsForm.imageUrl} onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })} />
            <Button onClick={() => cmsService.news.create(newsForm).then(load)}>Save</Button>
          </div>
          <ul className="space-y-2 max-h-96 overflow-auto">{news.map((item) => (
            <li key={item.id} className="border p-3 rounded flex justify-between"><span>{item.title}</span>
            <Button size="sm" variant="outline" onClick={() => cmsService.news.remove(item.id).then(load)}>Delete</Button></li>
          ))}</ul>
        </div>
      )}
      {tab === 'videos' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 border rounded-lg p-4">
            <h3 className="font-semibold">Add YouTube video</h3>
            <Input label="Title" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} />
            <Input label="YouTube URL" value={videoForm.youtubeUrl} onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })} />
            <Input label="Description" value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} />
            <Button onClick={() => cmsService.videos.create(videoForm).then(load)}>Save</Button>
          </div>
          <ul className="space-y-2 max-h-96 overflow-auto">{videos.map((item) => (
            <li key={item.id} className="border p-3 rounded flex justify-between"><span>{item.title}</span>
            <Button size="sm" variant="outline" onClick={() => cmsService.videos.remove(item.id).then(load)}>Delete</Button></li>
          ))}</ul>
        </div>
      )}
      {tab === 'stories' && (
        <ul className="space-y-4">
          {stories.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No pending stories.</p>
          )}
          {stories.map((s) => {
            const photoSrc = getStoryPhotoUrl(s.photo_url);
            return (
              <li key={s.id} className="border border-border rounded-xl p-5 bg-card shadow-sm">
                <div className="flex flex-col lg:flex-row gap-5">
                  {photoSrc && (
                    <div className="flex-shrink-0">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Submitted photo</p>
                      <a href={photoSrc} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={photoSrc}
                          alt={`Photo from ${s.submitter_name}`}
                          className="w-full max-w-[220px] rounded-lg border border-border object-cover max-h-56"
                        />
                      </a>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{s.submitter_name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {formatStoryDate(s.created_at)}
                        {s.story_type && (
                          <span className="ml-2 capitalize inline-flex px-2 py-0.5 rounded-full bg-muted">
                            {s.story_type}
                          </span>
                        )}
                      </p>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-medium break-all">
                          <a href={`mailto:${s.submitter_email}`} className="text-primary hover:underline">
                            {s.submitter_email || '—'}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd className="font-medium">
                          {s.submitter_phone ? (
                            <a href={`tel:${s.submitter_phone}`} className="text-primary hover:underline">
                              {s.submitter_phone}
                            </a>
                          ) : (
                            '—'
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Location</dt>
                        <dd className="font-medium">{s.location || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Loan amount</dt>
                        <dd className="font-medium">{s.loan_amount || '—'}</dd>
                      </div>
                    </dl>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Story</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap rounded-lg bg-muted/50 p-3 border border-border">
                        {s.story_text}
                      </p>
                    </div>
                    {!photoSrc && (
                      <p className="text-xs text-muted-foreground italic">No photo submitted</p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" onClick={() => cmsService.stories.moderate(s.id, { action: 'approve' }).then(load)}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const reason = window.prompt('Rejection reason (optional):', 'Not suitable for publication');
                          if (reason === null) return;
                          cmsService.stories.moderate(s.id, { action: 'reject', rejectionReason: reason || 'Not suitable' }).then(load);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {tab === 'trust' && (
        <div className="space-y-4 max-w-4xl">
          <Input
            label="Section heading"
            value={trustForm.heading}
            onChange={(e) => setTrustForm((p) => ({ ...p, heading: e.target.value }))}
          />
          <Input
            label="Section subtitle"
            value={trustForm.subtitle}
            onChange={(e) => setTrustForm((p) => ({ ...p, subtitle: e.target.value }))}
          />

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Statistics (value, label, icon, color)</h3>
            {trustForm.stats.map((item, idx) => (
              <div key={item.id || idx} className="grid md:grid-cols-5 gap-2">
                <Input
                  label="Value"
                  value={item.value || ''}
                  onChange={(e) =>
                    setTrustForm((p) => ({
                      ...p,
                      stats: p.stats.map((s, i) => (i === idx ? { ...s, value: e.target.value } : s)),
                    }))
                  }
                />
                <Input
                  label="Label"
                  value={item.label || ''}
                  onChange={(e) =>
                    setTrustForm((p) => ({
                      ...p,
                      stats: p.stats.map((s, i) => (i === idx ? { ...s, label: e.target.value } : s)),
                    }))
                  }
                />
                <Input
                  label="Icon"
                  value={item.icon || ''}
                  onChange={(e) =>
                    setTrustForm((p) => ({
                      ...p,
                      stats: p.stats.map((s, i) => (i === idx ? { ...s, icon: e.target.value } : s)),
                    }))
                  }
                />
                <Input
                  label="Color var"
                  value={item.color || ''}
                  onChange={(e) =>
                    setTrustForm((p) => ({
                      ...p,
                      stats: p.stats.map((s, i) => (i === idx ? { ...s, color: e.target.value } : s)),
                    }))
                  }
                />
                <Input
                  label="ID"
                  value={item.id || ''}
                  onChange={(e) =>
                    setTrustForm((p) => ({
                      ...p,
                      stats: p.stats.map((s, i) => (i === idx ? { ...s, id: e.target.value } : s)),
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Certifications (name, icon, description)</h3>
            {trustForm.certifications.map((item, idx) => (
              <div key={item.id || idx} className="grid md:grid-cols-4 gap-2">
                <Input
                  label="Name"
                  value={item.name || ''}
                  onChange={(e) =>
                    setTrustForm((p) => ({
                      ...p,
                      certifications: p.certifications.map((s, i) =>
                        i === idx ? { ...s, name: e.target.value } : s,
                      ),
                    }))
                  }
                />
                <Input
                  label="Icon"
                  value={item.icon || ''}
                  onChange={(e) =>
                    setTrustForm((p) => ({
                      ...p,
                      certifications: p.certifications.map((s, i) =>
                        i === idx ? { ...s, icon: e.target.value } : s,
                      ),
                    }))
                  }
                />
                <Input
                  label="Description"
                  value={item.description || ''}
                  onChange={(e) =>
                    setTrustForm((p) => ({
                      ...p,
                      certifications: p.certifications.map((s, i) =>
                        i === idx ? { ...s, description: e.target.value } : s,
                      ),
                    }))
                  }
                />
                <Input
                  label="ID"
                  value={item.id || ''}
                  onChange={(e) =>
                    setTrustForm((p) => ({
                      ...p,
                      certifications: p.certifications.map((s, i) =>
                        i === idx ? { ...s, id: e.target.value } : s,
                      ),
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <Button
            onClick={() => cmsService.trustSignals.update(trustForm)}
          >
            Save trust section
          </Button>
        </div>
      )}
      {tab === 'about' && (
        <div className="space-y-4 max-w-5xl">
          <Input
            label="Hero title"
            value={aboutForm.heroTitle}
            onChange={(e) => setAboutForm((p) => ({ ...p, heroTitle: e.target.value }))}
          />
          <Input
            label="Hero subtitle"
            value={aboutForm.heroSubtitle}
            onChange={(e) => setAboutForm((p) => ({ ...p, heroSubtitle: e.target.value }))}
          />

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">About number matrix</h3>
            {aboutForm.stats.map((item, idx) => (
              <div key={item.id || idx} className="grid md:grid-cols-3 gap-2">
                <Input
                  label="Value"
                  value={item.value || ''}
                  onChange={(e) =>
                    setAboutForm((p) => ({
                      ...p,
                      stats: p.stats.map((s, i) => (i === idx ? { ...s, value: e.target.value } : s)),
                    }))
                  }
                />
                <Input
                  label="Label"
                  value={item.label || ''}
                  onChange={(e) =>
                    setAboutForm((p) => ({
                      ...p,
                      stats: p.stats.map((s, i) => (i === idx ? { ...s, label: e.target.value } : s)),
                    }))
                  }
                />
                <Input
                  label="ID"
                  value={item.id || ''}
                  onChange={(e) =>
                    setAboutForm((p) => ({
                      ...p,
                      stats: p.stats.map((s, i) => (i === idx ? { ...s, id: e.target.value } : s)),
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">What Drives Us cards</h3>
            {aboutForm.values.map((item, idx) => (
              <div key={item.id || idx} className="grid md:grid-cols-4 gap-2">
                <Input
                  label="Title"
                  value={item.title || ''}
                  onChange={(e) =>
                    setAboutForm((p) => ({
                      ...p,
                      values: p.values.map((s, i) => (i === idx ? { ...s, title: e.target.value } : s)),
                    }))
                  }
                />
                <Input
                  label="Icon"
                  value={item.icon || ''}
                  onChange={(e) =>
                    setAboutForm((p) => ({
                      ...p,
                      values: p.values.map((s, i) => (i === idx ? { ...s, icon: e.target.value } : s)),
                    }))
                  }
                />
                <Input
                  label="Description"
                  value={item.description || ''}
                  onChange={(e) =>
                    setAboutForm((p) => ({
                      ...p,
                      values: p.values.map((s, i) => (i === idx ? { ...s, description: e.target.value } : s)),
                    }))
                  }
                />
                <Input
                  label="ID"
                  value={item.id || ''}
                  onChange={(e) =>
                    setAboutForm((p) => ({
                      ...p,
                      values: p.values.map((s, i) => (i === idx ? { ...s, id: e.target.value } : s)),
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <Input
            label="Story heading"
            value={aboutForm.storyHeading}
            onChange={(e) => setAboutForm((p) => ({ ...p, storyHeading: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium mb-2">Story paragraphs (separate with blank line)</label>
            <textarea
              className="w-full border rounded-lg p-3 min-h-[180px]"
              value={aboutForm.storyParagraphsText}
              onChange={(e) => setAboutForm((p) => ({ ...p, storyParagraphsText: e.target.value }))}
            />
          </div>

          <Button
            onClick={() =>
              cmsService.aboutContent.update({
                heroTitle: aboutForm.heroTitle,
                heroSubtitle: aboutForm.heroSubtitle,
                stats: aboutForm.stats,
                values: aboutForm.values,
                storyHeading: aboutForm.storyHeading,
                storyParagraphs: aboutForm.storyParagraphsText
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          >
            Save about section
          </Button>
        </div>
      )}
      {tab === 'legal' && (
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm text-muted-foreground">
            Edit legal pages and regulatory policies shown on the website footer and mobile app.
          </p>
          <label className="block text-sm font-medium text-foreground">Page</label>
          <select className="border rounded px-3 py-2 w-full max-w-lg" value={legalSlug} onChange={(e) => loadLegal(e.target.value)}>
            {LEGAL_PAGE_SECTIONS.map((section) => (
              <optgroup key={section.id} label={section.label}>
                {section.pages.map((page) => (
                  <option key={page.slug} value={page.slug}>{page.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <Input label="Title" value={legalForm.title} onChange={(e) => setLegalForm({ ...legalForm, title: e.target.value })} />
          <LegalContentEditor
            label="Page content (paragraphs, headings, lists)"
            value={legalForm.bodyHtml}
            onChange={(bodyHtml) => setLegalForm({ ...legalForm, bodyHtml })}
          />
          <Button
            onClick={() =>
              cmsService.legal.update(legalSlug, {
                title: legalForm.title,
                bodyHtml: prepareLegalHtml(legalForm.bodyHtml),
              }).then(() => loadLegal(legalSlug))
            }
          >
            Save legal page
          </Button>
        </div>
      )}
    </div>
  );
};
export default HomepageCmsTab;
