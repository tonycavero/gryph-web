/**
 * Colección de imágenes de alta resolución curadas de Unsplash para respaldo rápido.
 */
const FALLBACK_CATEGORY_IMAGES: Record<string, string[]> = {
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
  ],
  business: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
  ],
  team: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
  ],
  growth: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&w=1000&q=80',
  ],
  creative: [
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80',
  ],
};

function selectCategoryFallback(prompt: string, index: number): string {
  const p = prompt.toLowerCase();
  let category = 'business';

  if (p.includes('tech') || p.includes('ia') || p.includes('software') || p.includes('data') || p.includes('code')) {
    category = 'tech';
  } else if (p.includes('team') || p.includes('collab') || p.includes('equipo') || p.includes('lider') || p.includes('people')) {
    category = 'team';
  } else if (p.includes('growth') || p.includes('metric') || p.includes('financ') || p.includes('ventas') || p.includes('market')) {
    category = 'growth';
  } else if (p.includes('design') || p.includes('creat') || p.includes('idea') || p.includes('innovat')) {
    category = 'creative';
  }

  const list = FALLBACK_CATEGORY_IMAGES[category] || FALLBACK_CATEGORY_IMAGES.business;
  return list[index % list.length];
}

/**
 * Genera o busca una imagen temática y la entrega como Base64 Data URL.
 */
export async function getThematicImageDataUrl(
  searchQuery: string,
  slideIndex: number = 0
): Promise<{ dataUrl: string; sourceUrl: string }> {
  const cleanPrompt = (searchQuery || 'business presentation executive modern')
    .replace(/[^\w\s-]/gi, ' ')
    .trim()
    .slice(0, 100);

  // 1. Intentar con Pollinations AI (generación personalizada ultra-relevante)
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + ' professional 4k presentation illustration corporate clean cinematic lighting')}?width=800&height=550&nologo=true&seed=${slideIndex + 42}`;

  try {
    const res = await fetch(aiImageUrl, {
      signal: AbortSignal.timeout(9000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gryph/1.0',
      },
    });

    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      if (buffer.length > 5000) {
        const base64 = buffer.toString('base64');
        return {
          dataUrl: `data:image/jpeg;base64,${base64}`,
          sourceUrl: aiImageUrl,
        };
      }
    }
  } catch (err) {
    // Continuar con respaldo
  }

  // 2. Respaldo: Unsplash curado
  const fallbackUrl = selectCategoryFallback(cleanPrompt, slideIndex);
  try {
    const res = await fetch(fallbackUrl, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gryph/1.0',
      },
    });
    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const base64 = buffer.toString('base64');
      return {
        dataUrl: `data:image/jpeg;base64,${base64}`,
        sourceUrl: fallbackUrl,
      };
    }
  } catch (err) {
    // Si falla la descarga del fallback
  }

  // Si fallan ambas llamadas a red, retornar la URL directa para que el cliente la use
  return {
    dataUrl: fallbackUrl,
    sourceUrl: fallbackUrl,
  };
}
