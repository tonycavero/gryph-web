import { spawn } from 'child_process';
import path from 'path';
import { FormatOption, VideoInfo, detectPlatform } from './types';

export * from './types';

const BIN_PATH = path.join(process.cwd(), 'bin', 'yt-dlp.exe');

function formatSeconds(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function buildFallbackInfo(targetUrl: string, platform: string, customTitle?: string): VideoInfo {
  const formats: FormatOption[] = [
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

  return {
    id: 'media_' + Date.now(),
    title: customTitle || `${platform} Video / Audio`,
    url: targetUrl,
    thumbnail: '',
    duration: 0,
    durationFormatted: '0:00',
    uploader: platform,
    platform,
    formats,
    isLongVideo: false,
  };
}

export async function fetchVideoInfo(targetUrl: string): Promise<VideoInfo> {
  const platform = detectPlatform(targetUrl);

  return new Promise((resolve) => {
    try {
      new URL(targetUrl);
    } catch {
      // Return safe fallback rather than throwing 500
      return resolve(buildFallbackInfo(targetUrl, platform));
    }

    const args = [
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      '--skip-download',
      '--no-check-certificate',
      '--geo-bypass',
      '--user-agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      '--extractor-args',
      'youtube:player_client=android,web',
      targetUrl,
    ];

    const child = spawn(BIN_PATH, args);
    let stdoutData = '';

    const timeout = setTimeout(() => {
      child.kill();
      resolve(buildFallbackInfo(targetUrl, platform, `${platform} Media`));
    }, 15000);

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.on('close', () => {
      clearTimeout(timeout);

      const trimmed = stdoutData.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const data = JSON.parse(trimmed);
          const duration = Number(data.duration) || 0;
          const isLongVideo = duration > 300;

          const formats: FormatOption[] = [
            {
              formatId: 'bestaudio',
              quality: `${platform} Audio (MP3)`,
              resolution: 'Audio Estéreo (128-320 kbps)',
              ext: 'mp3',
              type: 'audio',
              isPremium: isLongVideo,
              premiumReason: isLongVideo ? 'El audio dura más de 5 minutos (Requiere Plan Pro)' : undefined,
            },
            {
              formatId: '720p',
              quality: `${platform} Video (720p HD)`,
              resolution: '1280x720 • MP4 Video',
              ext: 'mp4',
              type: 'video',
              isPremium: isLongVideo,
              premiumReason: isLongVideo ? 'Videos largos (+5 min) requieren Plan Pro' : undefined,
            },
            {
              formatId: '1080p',
              quality: `${platform} Video (1080p Full HD)`,
              resolution: '1920x1080 • MP4 Video',
              ext: 'mp4',
              type: 'video',
              isPremium: isLongVideo,
              premiumReason: isLongVideo ? 'Videos mayores a 5 min requieren Plan Pro' : undefined,
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

          return resolve({
            id: data.id || 'unknown',
            title: data.title || `${platform} Video`,
            url: targetUrl,
            thumbnail: data.thumbnail || '',
            duration,
            durationFormatted: formatSeconds(duration),
            uploader: data.uploader || data.channel || platform,
            platform,
            formats,
            isLongVideo,
          });
        } catch {}
      }

      // If parsing stdout failed, return robust fallback formats so user ALWAYS has buttons!
      resolve(buildFallbackInfo(targetUrl, platform, `${platform} Video`));
    });
  });
}
