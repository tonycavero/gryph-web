import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { detectPlatform } from '@/lib/types';
import { cleanAndResolveUrl } from '@/lib/urlHelper';
import { getYtDlpBinary } from '@/lib/platformBin';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export const dynamic = 'force-dynamic';

async function getTikTokNoWatermarkStream(tiktokUrl: string, format: string) {
  const isAudio = format === 'bestaudio';
  try {
    const res = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      body: new URLSearchParams({ url: tiktokUrl, hd: '1' }).toString(),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.code === 0 && json.data) {
        let streamUrl = '';
        let contentType = 'video/mp4';
        let ext = 'mp4';

        if (isAudio) {
          streamUrl = json.data.music || json.data.play;
          contentType = 'audio/mpeg';
          ext = 'mp3';
        } else if (format === '1080p') {
          // Prefer HD without watermark
          streamUrl = json.data.hdplay || json.data.play;
        } else {
          // Standard definition without watermark
          streamUrl = json.data.play || json.data.hdplay;
        }

        if (streamUrl) {
          if (streamUrl.startsWith('/')) {
            streamUrl = `https://www.tikwm.com${streamUrl}`;
          }

          const mediaRes = await fetch(streamUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Referer': 'https://www.tiktok.com/',
            },
            signal: AbortSignal.timeout(60000),
          });

          if (mediaRes.ok && mediaRes.body) {
            return {
              body: mediaRes.body,
              contentLength: mediaRes.headers.get('content-length'),
              contentType,
              ext,
              title: json.data.title || '',
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('TikWM direct stream fetch failed, falling back to yt-dlp:', err);
  }
  return null;
}

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const searchParams = req.nextUrl.searchParams;
    const rawUrl = searchParams.get('url');
    const format = searchParams.get('format') || '720p';
    const title = searchParams.get('title') || 'video';

    if (!rawUrl) {
      return NextResponse.json({ error: 'Falta el parámetro URL' }, { status: 400, headers: corsHeaders });
    }

    if (format === '4k') {
      return NextResponse.json(
        { 
          error: 'Descargas en 4K requieren Plan Premium.', 
          isPremiumRequired: true 
        }, 
        { status: 403, headers: corsHeaders }
      );
    }

    const url = await cleanAndResolveUrl(rawUrl);
    const platform = detectPlatform(url);
    const isAudio = format === 'bestaudio';

    const cleanTitle = title
      .replace(/[^\w\s-]/gi, '')
      .trim()
      .slice(0, 50) || 'media';

    // 1. FAST PATH PARA TIKTOK: Descarga directa 100% libre de marca de agua
    if (platform === 'TikTok') {
      try {
        const tikwmStream = await getTikTokNoWatermarkStream(url, format);
        if (tikwmStream) {
          const mediaLabel = isAudio ? 'Audio' : 'Video Sin Marca';
          const ext = tikwmStream.ext;
          const finalFilename = `TikTok ${mediaLabel} - ${cleanTitle}.${ext}`;

          const headers: Record<string, string> = {
            'Content-Disposition': `attachment; filename="${encodeURIComponent(finalFilename)}"; filename*=UTF-8''${encodeURIComponent(finalFilename)}`,
            'Content-Type': tikwmStream.contentType,
            ...corsHeaders,
          };

          if (tikwmStream.contentLength) {
            headers['Content-Length'] = tikwmStream.contentLength;
          }

          return new Response(tikwmStream.body, { headers });
        }
      } catch (err) {
        console.warn('TikWM stream failed, proceeding to yt-dlp fallback:', err);
      }
    }

    const userAgent = platform === 'Facebook'
      ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

    // Direct streaming to stdout via -o - (No temporary disk write)
    const args: string[] = [
      '-o', '-',
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificate',
      '--geo-bypass',
      '--user-agent', userAgent,
      '--extractor-args', 'youtube:player_client=android,web',
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

    // Format selection for instant stdout streaming without heavy ffmpeg disk merge
    if (platform === 'TikTok') {
      if (isAudio) {
        args.push('-f', 'bestaudio/best[ext=mp4]/best');
      } else {
        // Excluir explícitamente formatos con marca de agua ('watermarked' y 'download')
        args.push('-f', 'best[format_note!*=watermarked][format_id!=download][ext=mp4]/best[format_note!*=watermarked][format_id!=download]/best[ext=mp4]/best');
      }
    } else if (isAudio) {
      args.push('-f', 'bestaudio[ext=m4a]/bestaudio/best[ext=mp4]/best');
    } else if (format === '1080p') {
      args.push('-f', 'best[height<=1080][ext=mp4]/best[height<=1080]/bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/hd/best');
    } else {
      args.push('-f', 'best[height<=720][ext=mp4]/best[height<=720]/bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/hd/sd/best');
    }

    args.push(url);

    const binPath = getYtDlpBinary();
    const child = spawn(binPath, args);

    const mediaTypeLabel = isAudio ? 'Audio' : (platform === 'TikTok' ? 'Video Sin Marca' : 'Video');
    const ext = isAudio ? (platform === 'TikTok' ? 'mp3' : 'm4a') : 'mp4';
    const finalFilename = `${platform} ${mediaTypeLabel} - ${cleanTitle}.${ext}`;

    const webStream = new ReadableStream({
      start(controller) {
        child.stdout.on('data', (chunk) => {
          controller.enqueue(chunk);
        });

        child.stdout.on('end', () => {
          controller.close();
        });

        child.stdout.on('error', (err) => {
          controller.error(err);
        });

        child.on('error', (err) => {
          controller.error(err);
        });
      },
      cancel() {
        child.kill();
      },
    });

    return new Response(webStream, {
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(finalFilename)}"; filename*=UTF-8''${encodeURIComponent(finalFilename)}`,
        'Content-Type': isAudio ? 'audio/mp4' : 'video/mp4',
        'Transfer-Encoding': 'chunked',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Download streaming error:', error);
    return NextResponse.json({ error: error.message || 'Error al iniciar la descarga' }, { status: 500, headers: corsHeaders });
  }
}
