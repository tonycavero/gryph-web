/**
 * Utility to normalize, clean tracking params, and resolve mobile shortlinks (pin.it, fb.watch, share/r/, etc.)
 */

export async function followRedirects(url: string, maxHops = 5): Promise<string> {
  let current = url;
  for (let i = 0; i < maxHops; i++) {
    try {
      const res = await fetch(current, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual',
      });

      const loc = res.headers.get('location');
      if (loc && (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308)) {
        if (loc.startsWith('/')) {
          const u = new URL(current);
          current = `${u.origin}${loc}`;
        } else {
          current = loc;
        }
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  return current;
}

export async function cleanAndResolveUrl(rawUrl: string): Promise<string> {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // 1. Resolve short links first (pin.it, fb.watch, vm.tiktok.com, vt.tiktok.com, etc.)
  const isShortlink = /pin\.it|fb\.watch|vm\.tiktok\.com|vt\.tiktok\.com|bit\.ly|tinyurl\.com/i.test(url);
  if (isShortlink) {
    try {
      const resolved = await followRedirects(url);
      if (resolved && !resolved.endsWith('pinterest.com/') && !resolved.endsWith('facebook.com/')) {
        url = resolved;
      }
    } catch {}
  }

  // 2. Remove mobile subdomains and standard mobile share URLs
  if (url.includes('m.facebook.com')) {
    url = url.replace('m.facebook.com', 'www.facebook.com');
  }
  if (url.includes('m.youtube.com')) {
    url = url.replace('m.youtube.com', 'www.youtube.com');
  }

  // Convert Facebook mobile share links to direct Reel or Watch links
  // https://www.facebook.com/share/r/ID/ -> https://www.facebook.com/reel/ID/
  if (url.includes('facebook.com/share/r/')) {
    url = url.replace('facebook.com/share/r/', 'facebook.com/reel/');
  } else if (url.includes('facebook.com/share/v/')) {
    // https://www.facebook.com/share/v/ID/ -> https://www.facebook.com/watch/?v=ID
    const match = url.match(/facebook\.com\/share\/v\/([^/?]+)/i);
    if (match && match[1]) {
      url = `https://www.facebook.com/watch/?v=${match[1]}`;
    }
  }

  // Convert youtu.be to standard watch URL
  if (url.includes('youtu.be/')) {
    const match = url.match(/youtu\.be\/([^/?]+)/i);
    if (match && match[1]) {
      url = `https://www.youtube.com/watch?v=${match[1]}`;
    }
  }

  // 3. Strip tracking query parameters that break yt-dlp parsers (Instagram igsh, Facebook fbclid/mibextid, TikTok _r/_t, etc.)
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
