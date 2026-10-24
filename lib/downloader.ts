import { spawn } from 'child_process';
import path from 'path';
import { FormatOption, VideoInfo, detectPlatform } from './types';
import { cleanAndResolveUrl } from './urlHelper';
import { getYtDlpBinary } from './platformBin';

export * from './types';



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

function buildFallbackInfo(
  targetUrl: string,
  platform: string,
  customTitle?: string,
  customThumbnail?: string,
  customUploader?: string
): VideoInfo {
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
    thumbnail: customThumbnail || '',
    duration: 0,
    durationFormatted: '0:00',
    uploader: customUploader || platform,
    platform,
    formats,
    isLongVideo: false,
  };
}

export async function fetchVideoInfo(rawTargetUrl: string): Promise<VideoInfo> {
  const targetUrl = await cleanAndResolveUrl(rawTargetUrl);
  const platform = detectPlatform(targetUrl);

  try {
    new URL(targetUrl);
  } catch {
    // Return safe fallback rather than throwing 500
    return buildFallbackInfo(targetUrl, platform);
  }

  // Pre-fetch fast metadata for YouTube and TikTok via oEmbed
  let oembedTitle = '';
  let oembedAuthor = '';
  let oembedThumbnail = '';

  const ytMatch = targetUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  const ytId = ytMatch ? ytMatch[1] : null;

  if (platform === 'YouTube' && ytId) {
    oembedThumbnail = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`, {
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const oe = await res.json();
        if (oe.title) oembedTitle = oe.title;
        if (oe.author_name) oembedAuthor = oe.author_name;
      }
    } catch {}
  } else if (platform === 'TikTok') {
    try {
      const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(targetUrl)}`, {
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const oe = await res.json();
        if (oe.title) oembedTitle = oe.title;
        if (oe.author_name) oembedAuthor = oe.author_name;
        if (oe.thumbnail_url) oembedThumbnail = oe.thumbnail_url;
      }
    } catch {}
  }

  return new Promise((resolve) => {
    const userAgent = platform === 'Facebook'
      ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

    const args = [
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      '--skip-download',
      '--no-check-certificate',
      '--geo-bypass',
      '--user-agent',
      userAgent,
      '--extractor-args',
      'youtube:player_client=android,web',
    ];

    if (platform === 'Facebook') {
      args.push('--referer', 'https://www.facebook.com/');
    } else if (platform === 'TikTok') {
      args.push('--referer', 'https://www.tiktok.com/');
    } else if (platform === 'Instagram') {
      args.push('--referer', 'https://www.instagram.com/');
    } else if (platform === 'Pinterest') {
      args.push('--referer', 'https://www.pinterest.com/');
    }

    args.push(targetUrl);

    const binPath = getYtDlpBinary();
    const child = spawn(binPath, args);
    let stdoutData = '';

    const timeout = setTimeout(() => {
      child.kill();
      resolve(
        buildFallbackInfo(
          targetUrl,
          platform,
          oembedTitle || `${platform} Media`,
          oembedThumbnail,
          oembedAuthor || platform
        )
      );
    }, 30000);

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

          // Extract thumbnail with robust fallbacks
          let thumbnail = oembedThumbnail || data.thumbnail || '';
          if (platform === 'YouTube' && ytId) {
            // YouTube maxresdefault often 404s, hqdefault is 100% reliable
            thumbnail = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
          } else if (!thumbnail && Array.isArray(data.thumbnails) && data.thumbnails.length > 0) {
            const valid = data.thumbnails.filter((t: any) => t && t.url);
            if (valid.length > 0) {
              thumbnail = valid[valid.length - 1].url;
            }
          }

          // Direct MP4 stream for first-frame or video clip preview (e.g. Facebook or live clip preview)
          let previewUrl: string | undefined = undefined;
          if (Array.isArray(data.formats) && data.formats.length > 0) {
            const videoStream = data.formats.find(
              (f: any) =>
                f &&
                f.url &&
                f.vcodec !== 'none' &&
                (f.ext === 'mp4' || f.video_ext === 'mp4' || f.format_note === 'hd' || f.format_note === 'sd') &&
                !f.url.includes('.m3u8')
            );
            if (videoStream?.url) {
              previewUrl = videoStream.url;
            }
          }

          return resolve({
            id: data.id || ytId || 'unknown',
            title: data.title || oembedTitle || `${platform} Video`,
            url: targetUrl,
            thumbnail,
            previewUrl,
            duration,
            durationFormatted: formatSeconds(duration),
            uploader: data.uploader || data.channel || oembedAuthor || platform,
            platform,
            formats,
            isLongVideo,
          });
        } catch {}
      }

      // If parsing stdout failed, return robust fallback formats with real title/thumb if obtained from oEmbed
      resolve(
        buildFallbackInfo(
          targetUrl,
          platform,
          oembedTitle || `${platform} Video`,
          oembedThumbnail,
          oembedAuthor || platform
        )
      );
    });
  });
}
