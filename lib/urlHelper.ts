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

export async function resolveFacebookShareUrl(shareUrl: string): Promise<string> {
  try {
    const res = await fetch(shareUrl, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (res.url && !res.url.includes('/share/') && !res.url.includes('/login')) {
      return res.url;
    }

    const html = await res.text();
    const ogMatch = html.match(/property="og:url"\s+content="([^"]+)"/i) || html.match(/rel="canonical"\s+href="([^"]+)"/i);
    if (ogMatch && ogMatch[1] && !ogMatch[1].includes('/login') && !ogMatch[1].includes('/share/')) {
      return ogMatch[1];
    }

    const idMatch = html.match(/"video_id":"(\d+)"/) || html.match(/"entity_id":"(\d+)"/) || html.match(/\/videos\/(\d+)\//);
    if (idMatch && idMatch[1]) {
      return `https://www.facebook.com/watch/?v=${idMatch[1]}`;
    }
  } catch {}
  return shareUrl;
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

  // 2. Remove mobile subdomains
  if (url.includes('m.facebook.com')) {
    url = url.replace('m.facebook.com', 'www.facebook.com');
  }
  if (url.includes('m.youtube.com')) {
    url = url.replace('m.youtube.com', 'www.youtube.com');
  }

  // 3. Handle Facebook Share links (share/v/, share/r/, share/p/, share/)
  if (url.includes('facebook.com/share/')) {
    const match = url.match(/facebook\.com\/share\/(?:[rvp]\/)?([^/?#&]+)/i);
    if (match && match[1]) {
      const shareId = match[1];
      if (/^\d+$/.test(shareId)) {
        url = `https://www.facebook.com/watch/?v=${shareId}`;
      } else {
        try {
          const resolved = await resolveFacebookShareUrl(url);
          if (resolved && resolved !== url) {
            url = resolved;
          } else {
            url = url.includes('/share/r/')
              ? `https://www.facebook.com/reel/${shareId}/`
              : `https://www.facebook.com/watch/?v=${shareId}`;
          }
        } catch {
          url = `https://www.facebook.com/watch/?v=${shareId}`;
        }
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
