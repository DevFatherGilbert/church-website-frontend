export type VideoEmbedInfo = {
  provider: "youtube" | "vimeo" | "direct" | "unknown";
  id: string | null;
  embedUrl: string | null;
  isValid: boolean;
};

export function parseVideoUrl(rawUrl?: string | null): VideoEmbedInfo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { provider: "unknown", id: null, embedUrl: null, isValid: false };
  }

  const url = rawUrl.trim();

  // YouTube Patterns:
  // - https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // - https://youtu.be/dQw4w9WgXcQ
  // - https://www.youtube.com/embed/dQw4w9WgXcQ
  // - https://www.youtube.com/shorts/dQw4w9WgXcQ
  const ytMatch =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      provider: "youtube",
      id: videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      isValid: true,
    };
  }

  // Vimeo Patterns:
  // - https://vimeo.com/123456789
  // - https://player.vimeo.com/video/123456789
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      provider: "vimeo",
      id: videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?dnt=1`,
      isValid: true,
    };
  }

  // Direct MP4 / WebM video link
  if (/\.(mp4|webm|ogv)$/i.test(url)) {
    return {
      provider: "direct",
      id: null,
      embedUrl: url,
      isValid: true,
    };
  }

  return { provider: "unknown", id: null, embedUrl: null, isValid: false };
}

export function formatSermonDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const parsed = new Date(`${dateString.slice(0, 10)}T12:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return dateString;
    return new Intl.DateTimeFormat("en", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(parsed);
  } catch {
    return dateString;
  }
}
