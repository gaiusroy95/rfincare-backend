import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { homepageService } from '../../../services/homepageService';

function youtubeThumb(url) {
  const m = url?.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

const VideosSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    homepageService.getVideos().then((d) => setVideos(Array.isArray(d) ? d : [])).catch(() => setVideos([])).finally(() => setLoading(false));
  }, []);
  if (loading) return <section className="py-16 bg-muted"><div className="text-center text-muted-foreground">Loading videos...</div></section>;
  if (!videos.length) return null;
  return (
    <section className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Educational Videos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const thumb = video.thumbnailUrl || youtubeThumb(video.youtubeUrl);
            return (
              <article key={video.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-muted">
                  {thumb && <img src={thumb} alt={video.thumbnailAlt || video.title} className="w-full h-full object-cover" />}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30"><Icon name="Play" size={40} color="white" /></span>
                </a>
                <div className="p-6">
                  <h3 className="text-lg font-bold">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{video.description}</p>
                  {video.durationLabel && <span className="text-xs text-muted-foreground mt-2 block">{video.durationLabel}</span>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default VideosSection;
