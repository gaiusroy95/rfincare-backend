import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { homepageService } from '../../../services/homepageService';

function youtubeId(url) {
  const m = url?.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function youtubeThumb(url) {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function youtubeEmbed(url) {
  const id = youtubeId(url);
  return id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
    : null;
}

const VideosSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    homepageService
      .getVideos()
      .then((d) => setVideos(Array.isArray(d) ? d : []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  if (loading) {
    return (
      <section className="py-16 bg-muted">
        <div className="text-center text-muted-foreground">Loading videos...</div>
      </section>
    );
  }
  if (!videos.length) return null;

  const activeEmbed = active ? youtubeEmbed(active.youtubeUrl) : null;

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
                <button
                  type="button"
                  onClick={() => setActive(video)}
                  className="block w-full relative aspect-video bg-muted cursor-pointer"
                >
                  {thumb && (
                    <img
                      src={thumb}
                      alt={video.thumbnailAlt || video.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Icon name="Play" size={40} color="white" />
                  </span>
                </button>
                <div className="p-6">
                  <h3 className="text-lg font-bold">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{video.description}</p>
                  {video.durationLabel && (
                    <span className="text-xs text-muted-foreground mt-2 block">{video.durationLabel}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute -top-10 right-0 text-white hover:opacity-80"
              aria-label="Close video"
            >
              <Icon name="X" size={28} color="white" />
            </button>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {activeEmbed ? (
                <iframe
                  src={activeEmbed}
                  title={active.title}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  Video is unavailable.
                </div>
              )}
            </div>
            {active.title && (
              <div className="mt-4 text-white">
                <h3 className="text-lg font-bold">{active.title}</h3>
                {active.description && (
                  <p className="text-sm text-white/80 mt-1">{active.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default VideosSection;
