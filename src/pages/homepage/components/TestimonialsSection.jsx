import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { homepageService } from '../../../services/homepageService';
import { getStoryPhotoUrl } from '../../../utils/storyMedia';

const TestimonialsSection = () => {
  const [activeTab, setActiveTab] = useState('customer');
  const [stories, setStories] = useState({ customer: [], agent: [] });

  useEffect(() => {
    homepageService.getSuccessStories().then((rows) => {
      const list = Array.isArray(rows) ? rows : [];
      setStories({
        customer: list.filter((s) => s.storyType === 'customer'),
        agent: list.filter((s) => s.storyType === 'agent'),
      });
    }).catch(() => setStories({ customer: [], agent: [] }));
  }, []);

  const items = stories[activeTab] || [];
  if (!items.length && !stories.customer.length && !stories.agent.length) return null;

  return (
    <section className="bg-muted py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Success Stories</h2>
        <div className="flex justify-center gap-4 mb-8">
          {['customer', 'agent'].map((t) => (
            <button key={t} type="button" onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-full capitalize ${activeTab === t ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>{t}s</button>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((s) => {
            const photoSrc = getStoryPhotoUrl(s.photoUrl);
            return (
              <blockquote key={s.id} className="bg-card border rounded-xl p-6 flex flex-col">
                {photoSrc && (
                  <img
                    src={photoSrc}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover mb-4 border border-border"
                  />
                )}
                <p className="text-sm text-muted-foreground italic flex-1">&ldquo;{s.storyText}&rdquo;</p>
                <footer className="mt-4 font-semibold">{s.name}{s.location ? `, ${s.location}` : ''}</footer>
                {s.loanAmount && <p className="text-xs text-muted-foreground">{s.loanAmount}</p>}
              </blockquote>
            );
          })}
        </div>
        <p className="text-center mt-6 text-sm text-muted-foreground">
          <a href="/share-your-story" className="text-primary font-medium">Share your story</a>
        </p>
      </div>
    </section>
  );
};
export default TestimonialsSection;
