export function extractYoutubeId(url) {
  if (!url) return null;
  const value = String(url).trim();
  if (!value) return null;

  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|live\/|v\/))([\w-]{11})/i,
    /[?&]v=([\w-]{11})/i,
    /vid:([\w-]{11})/i,
    /\/vi\/([\w-]{11})(?:\/|$)/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function resolveVideoYoutubeUrl(video) {
  if (!video) return null;
  return video.youtubeUrl || video.youtubeurl || video.youtube_url || null;
}

export function youtubeThumbnail(url) {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function youtubeEmbed(url) {
  const id = extractYoutubeId(url);
  return id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
    : null;
}
