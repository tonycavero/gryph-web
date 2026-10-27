export interface FormatOption {
  formatId: string;
  quality: string;
  resolution: string;
  ext: string;
  type: 'audio' | 'video';
  filesizeApprox?: string;
  isPremium: boolean;
  premiumReason?: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  previewUrl?: string;
  duration: number;
  durationFormatted: string;
  uploader?: string;
  platform: string;
  formats: FormatOption[];
  isLongVideo: boolean;
}

export function detectPlatform(url: string): string {
  if (!url) return 'Web';
  const lower = url.toLowerCase();
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) return 'Facebook';
  if (lower.includes('pinterest.com') || lower.includes('pin.it')) return 'Pinterest';
  if (lower.includes('tiktok.com')) return 'TikTok';
  if (lower.includes('instagram.com')) return 'Instagram';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'X / Twitter';
  if (lower.includes('reddit.com')) return 'Reddit';
  if (lower.includes('vimeo.com')) return 'Vimeo';
  return 'Web';
}

export function buildPlatformFormats(platform: string, isLongVideo = false): FormatOption[] {
  const isTikTok = platform === 'TikTok';

  return [
    {
      formatId: 'bestaudio',
      quality: isTikTok ? 'TikTok Audio (MP3 • Sin marca)' : `${platform} Audio (MP3)`,
      resolution: isTikTok ? 'Audio Original Estéreo (MP3)' : 'Audio Estéreo (128-320 kbps)',
      ext: 'mp3',
      type: 'audio',
      isPremium: isLongVideo,
      premiumReason: isLongVideo ? 'El audio dura más de 1 hora requiere Plan Pro' : undefined,
    },
    {
      formatId: '720p',
      quality: isTikTok ? 'TikTok Video (Sin marca de agua)' : `${platform} Video (720p HD)`,
      resolution: isTikTok ? 'HD MP4 • Sin marca de agua' : '1280x720 • MP4 Video',
      ext: 'mp4',
      type: 'video',
      isPremium: isLongVideo,
      premiumReason: isLongVideo ? 'Videos largos (+1 hora) requieren Plan Pro' : undefined,
    },
    {
      formatId: '1080p',
      quality: isTikTok ? 'TikTok Video (Full HD Sin marca)' : `${platform} Video (1080p Full HD)`,
      resolution: isTikTok ? '1080p Full HD • Sin marca de agua' : '1920x1080 • MP4 Video',
      ext: 'mp4',
      type: 'video',
      isPremium: isLongVideo,
      premiumReason: isLongVideo ? 'Videos mayores a 1 hora requieren Plan Pro' : undefined,
    },
    {
      formatId: '4k',
      quality: `${platform} Video (4K Ultra HD)`,
      resolution: '3840x2160 • 4K UHD Pro',
      ext: 'mp4',
      type: 'video',
      isPremium: true,
      premiumReason: 'Descarga en resolución 4K exclusiva del Plan Pro',
    },
  ];
}
