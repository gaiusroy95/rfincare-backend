import React, { useEffect, useState } from 'react';
import { homepageService } from '../../../services/homepageService';

const NewsSection = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    homepageService.getNews().then((d) => setNewsItems(Array.isArray(d) ? d : [])).catch(() => setNewsItems([])).finally(() => setLoading(false));
  }, []);
  if (loading) return <section className="py-16"><div className="text-center text-muted-foreground">Loading news...</div></section>;
  if (!newsItems.length) return null;
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Latest News & Updates</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((news) => (
            <article key={news.id} className="bg-card rounded-xl border border-border overflow-hidden">
              {news.imageUrl && (
                <img src={news.imageUrl} alt={news.imageAlt || news.title} className="w-full aspect-video object-cover" />
              )}
              <div className="p-6">
                {news.category && <span className="text-xs font-semibold text-primary">{news.category}</span>}
                <h3 className="text-lg font-bold mt-2">{news.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{news.excerpt}</p>
                {news.blogUrl && (
                  <a href={news.blogUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium mt-3 inline-block">
                    Read more
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
export default NewsSection;
