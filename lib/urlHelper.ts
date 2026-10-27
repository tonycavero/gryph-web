import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * Resolves redirects rapidly using HTTP/1.1 client with proper User-Agent
 */
export async function followRedirects(targetUrl: string, maxHops = 5): Promise<string> {
  let currentUrl = targetUrl;

  for (let i = 0; i < maxHops; i++) {
    try {
      const parsed = new URL(currentUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      // Facebook crawler user agent gives 302 location to canonical reel / watch URL instantly
      const userAgent = currentUrl.includes('facebook.com')
        ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      const redirectLocation = await new Promise<string | null>((resolve) => {
        const req = client.request(
          currentUrl,
          {
            method: 'GET',
            headers: {
              'User-Agent': userAgent,
              Accept: '*/*',
            },
            timeout: 5000,
          },
          (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              const loc = res.headers.location;
              res.resume();
              return resolve(loc);
            }
            res.resume();
            return resolve(null);
          }
        );

        req.on('error', () => resolve(null));
        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });
        req.end();
      });

      if (redirectLocation) {
        if (redirectLocation.startsWith('/')) {
          const u = new URL(currentUrl);
          currentUrl = `${u.origin}${redirectLocation}`;
        } else {
          currentUrl = redirectLocation;
        }

        // Stop early if already resolved to canonical video or reel
        if (currentUrl.includes('/reel/') || currentUrl.includes('/watch/?v=') || currentUrl.includes('/watch?v=')) {
          break;
        }
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  return currentUrl;
}

export async function cleanAndResolveUrl(rawUrl: string): Promise<string> {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // 1. Resolve shortlinks and share links (facebook.com/share/, pin.it, fb.watch, vm.tiktok.com, vt.tiktok.com, tiktok.com/t/, etc.)
  const needsResolution = /facebook\.com\/share|pin\.it|fb\.watch|vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com\/t\/|bit\.ly|tinyurl\.com/i.test(url);
  if (needsResolution) {
    try {
      const resolved = await followRedirects(url);
      if (resolved && !resolved.endsWith('pinterest.com/') && !resolved.endsWith('facebook.com/')) {
        url = resolved;
      }
    } catch {}
  }

  // 2. Remove mobile subdomains
  if (url.includes('m.facebook.com')) {
    url = url.replace('m.facebook.com', 'www.facebook.com');
  }
  if (url.includes('m.youtube.com')) {
    url = url.replace('m.youtube.com', 'www.youtube.com');
  }
  if (url.includes('m.tiktok.com')) {
    url = url.replace('m.tiktok.com', 'www.tiktok.com');
  }

  // 3. Fallback normalization for any lingering share URLs
  if (url.includes('facebook.com/share/')) {
    const match = url.match(/facebook\.com\/share\/(?:[rvp]\/)?([^/?#&]+)/i);
    if (match && match[1]) {
      const shareId = match[1];
      if (/^\d+$/.test(shareId)) {
        url = `https://www.facebook.com/watch/?v=${shareId}`;
      } else if (url.includes('/share/r/')) {
        url = `https://www.facebook.com/reel/${shareId}/`;
      } else {
        url = `https://www.facebook.com/watch/?v=${shareId}`;
      }
    }
  }

  // Convert youtu.be to standard watch URL
  if (url.includes('youtu.be/')) {
    const match = url.match(/youtu\.be\/([^/?]+)/i);
    if (match && match[1]) {
      url = `https://www.youtube.com/watch?v=${match[1]}`;
    }
  }

  // 4. Strip tracking query parameters that break yt-dlp parsers
  try {
    const parsed = new URL(url);
    const trackingKeys = [
      'igsh',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'mibextid',
      'rdid',
      'share_url',
      '__cft__',
      '__tn__',
      '_r',
      '_t',
      'is_from_webapp',
      'sender_device',
      'invite_code',
      'sender',
      'si',
      'feature',
    ];

    trackingKeys.forEach((key) => {
      parsed.searchParams.delete(key);
    });

    url = parsed.toString();
  } catch {}

  return url;
}
