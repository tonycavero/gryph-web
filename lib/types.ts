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

export function buildPlatformFormats(platform: string): FormatOption[] {
  return [
    {
      formatId: 'bestaudio',
      quality: `${platform} Audio (MP3)`,
      resolution: 'Audio Estéreo (128-320 kbps)',
      ext: 'mp3',
      type: 'audio',
      isPremium: false,
    },
    {
      formatId: '720p',
      quality: `${platform} Video (720p HD)`,
      resolution: '1280x720 • MP4 Video',
      ext: 'mp4',
      type: 'video',
      isPremium: false,
    },
    {
      formatId: '1080p',
      quality: `${platform} Video (1080p Full HD)`,
      resolution: '1920x1080 • MP4 Video',
      ext: 'mp4',
      type: 'video',
      isPremium: false,
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
