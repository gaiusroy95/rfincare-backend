import React, { useEffect, useMemo, useState } from 'react';

import Icon from '../AppIcon';
import Button from '../ui/Button';
import {
  fetchProtectedLearningBlobUrl,
  getLearningVideoUrl,
  isYoutubeLearningUrl,
} from '../../utils/learningResources';
import { youtubeEmbed } from '../../utils/youtube';

const LearningResourceModal = ({ resource, portal = 'employee', onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blobUrl, setBlobUrl] = useState(null);

  const videoUrl = useMemo(() => getLearningVideoUrl(resource), [resource]);
  const youtubeSrc = useMemo(() => {
    if (!isYoutubeLearningUrl(videoUrl)) return null;
    return youtubeEmbed(videoUrl);
  }, [videoUrl]);

  useEffect(() => {
    if (!resource) return undefined;

    let active = true;
    let createdBlobUrl = null;

    const load = async () => {
      setLoading(true);
      setError('');
      setBlobUrl(null);

      if (youtubeSrc) {
        setLoading(false);
        return;
      }

      try {
        createdBlobUrl = await fetchProtectedLearningBlobUrl(resource, portal);
        if (!active) return;
        if (!createdBlobUrl) {
          setError('This training file could not be opened. Please contact your administrator.');
          return;
        }
        setBlobUrl(createdBlobUrl);
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.error || err?.message || 'Failed to load training content.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
      if (createdBlobUrl) URL.revokeObjectURL(createdBlobUrl);
    };
  }, [resource, portal, youtubeSrc]);

  useEffect(() => {
    if (!resource) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resource, onClose]);

  if (!resource) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-5xl bg-card rounded-xl border border-border overflow-hidden shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">{resource.title}</h2>
            {resource.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <Icon name="X" size={22} />
          </Button>
        </div>

        <div className="relative aspect-video bg-black">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Icon name="Loader2" size={28} className="animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && youtubeSrc && (
            <iframe
              src={youtubeSrc}
              title={resource.title}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {!loading && !error && blobUrl && (
            <iframe
              src={blobUrl}
              title={resource.title}
              className="absolute inset-0 w-full h-full bg-white"
              frameBorder="0"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningResourceModal;
