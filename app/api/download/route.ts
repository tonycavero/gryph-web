import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { detectPlatform } from '@/lib/types';
import { cleanAndResolveUrl } from '@/lib/urlHelper';
import { getYtDlpBinary } from '@/lib/platformBin';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  let tempFilePath: string | null = null;

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

    const id = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const tempTemplate = path.join(os.tmpdir(), `${id}.%(ext)s`);

    const args: string[] = [
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificate',
      '--geo-bypass',
      '--user-agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      '--extractor-args',
      'youtube:player_client=android,web',
      '-o', tempTemplate,
    ];

    // Detect ffmpeg if present
    const possibleFfmpeg = path.join(os.homedir(), '.local', 'bin', 'ffmpeg.exe');
    if (fs.existsSync(possibleFfmpeg)) {
      args.push('--ffmpeg-location', possibleFfmpeg);
    }

    if (platform === 'Facebook') {
      args.push('--referer', 'https://www.facebook.com/');
    } else if (platform === 'TikTok') {
      args.push('--referer', 'https://www.tiktok.com/');
    } else if (platform === 'Instagram') {
      args.push('--referer', 'https://www.instagram.com/');
    } else if (platform === 'Pinterest') {
      args.push('--referer', 'https://www.pinterest.com/');
    }

    if (isAudio) {
      args.push('-x', '--audio-format', 'mp3');
    } else if (format === '1080p') {
      args.push('-f', 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/bestvideo+bestaudio/best', '--merge-output-format', 'mp4');
    } else {
      args.push('-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]/bestvideo+bestaudio/best', '--merge-output-format', 'mp4');
    }

    args.push(url);

    await new Promise<void>((resolve, reject) => {
      const binPath = getYtDlpBinary();
      const child = spawn(binPath, args);
      let stderrMsg = '';

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error('Tiempo de espera agotado. El servidor del video tardó demasiado en responder.'));
      }, 90000);

      child.stderr.on('data', (d) => {
        stderrMsg += d.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve();
        } else {
          // Check if file was produced anyway
          const tmpFiles = fs.readdirSync(os.tmpdir());
          const found = tmpFiles.find((f) => f.startsWith(id));
          if (found) {
            resolve();
          } else {
            let userFriendly = 'No se pudo descargar el video.';
            if (stderrMsg.includes('404') || stderrMsg.includes('pfbid')) {
              userFriendly = 'Este video de Facebook no es público o requiere inicio de sesión. Por favor usa un enlace de video público.';
            } else if (stderrMsg.includes('Private video') || stderrMsg.includes('login')) {
              userFriendly = 'El video es privado o requiere inicio de sesión en la plataforma.';
            }
            reject(new Error(userFriendly));
          }
        }
      });
    });

    const tmpDirFiles = fs.readdirSync(os.tmpdir());
    const matched = tmpDirFiles.find((f) => f.startsWith(id));

    if (!matched) {
      return NextResponse.json({ error: 'No se pudo procesar el archivo de video.' }, { status: 500, headers: corsHeaders });
    }

    tempFilePath = path.join(os.tmpdir(), matched);
    const fileStat = fs.statSync(tempFilePath);
    const ext = path.extname(tempFilePath).replace('.', '') || (isAudio ? 'mp3' : 'mp4');

    const cleanTitle = title
      .replace(/[^\w\s-]/gi, '')
      .trim()
      .slice(0, 50) || 'media';

    const mediaTypeLabel = isAudio ? 'Audio' : 'Video';
    const finalFilename = `${platform} ${mediaTypeLabel} - ${cleanTitle}.${ext}`;

    const nodeStream = fs.createReadStream(tempFilePath);

    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => {
          controller.enqueue(chunk);
        });

        nodeStream.on('end', () => {
          controller.close();
          if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
              fs.unlinkSync(tempFilePath);
            } catch {}
          }
        });

        nodeStream.on('error', (err) => {
          controller.error(err);
          if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
              fs.unlinkSync(tempFilePath);
            } catch {}
          }
        });
      },
      cancel() {
        nodeStream.destroy();
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          try {
            fs.unlinkSync(tempFilePath);
          } catch {}
        }
      }
    });

    return new Response(webStream, {
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(finalFilename)}"; filename*=UTF-8''${encodeURIComponent(finalFilename)}`,
        'Content-Type': ext === 'mp3' ? 'audio/mpeg' : 'video/mp4',
        'Content-Length': fileStat.size.toString(),
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {}
    }
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar la descarga' }, { status: 500, headers: corsHeaders });
  }
}
