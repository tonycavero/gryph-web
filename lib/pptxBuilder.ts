import pptxgen from 'pptxgenjs';
import { PresentationPlan, SlideItem } from './aiSlideGenerator';

interface ColorPalette {
  bg: string;
  darkBg: string;
  primary: string;
  accent: string;
  textDark: string;
  textLight: string;
  textMuted: string;
  cardBg: string;
  border: string;
}

const THEMES: Record<string, ColorPalette> = {
  navy: {
    bg: 'F8FAFC',
    darkBg: '0F172A',
    primary: '2563EB',
    accent: '38BDF8',
    textDark: '0F172A',
    textLight: 'FFFFFF',
    textMuted: '64748B',
    cardBg: 'FFFFFF',
    border: 'E2E8F0',
  },
  emerald: {
    bg: 'F0FDF4',
    darkBg: '064E3B',
    primary: '059669',
    accent: '34D399',
    textDark: '064E3B',
    textLight: 'FFFFFF',
    textMuted: '4B5563',
    cardBg: 'FFFFFF',
    border: 'D1FAE5',
  },
  amber: {
    bg: 'FFFBEB',
    darkBg: '1E293B',
    primary: 'D97706',
    accent: 'FBBF24',
    textDark: '1E293B',
    textLight: 'FFFFFF',
    textMuted: '64748B',
    cardBg: 'FFFFFF',
    border: 'FEF3C7',
  },
  violet: {
    bg: 'FAF5FF',
    darkBg: '2E1065',
    primary: '7C3AED',
    accent: 'C084FC',
    textDark: '2E1065',
    textLight: 'FFFFFF',
    textMuted: '6B7280',
    cardBg: 'FFFFFF',
    border: 'F3E8FF',
  },
  slate: {
    bg: 'F8FAFC',
    darkBg: '18181B',
    primary: '2563EB',
    accent: '94A3B8',
    textDark: '18181B',
    textLight: 'FFFFFF',
    textMuted: '71717A',
    cardBg: 'FFFFFF',
    border: 'E4E4E7',
  },
};

/**
 * Construye una presentación PowerPoint moderna 16:9 (.pptx) con imágenes temáticas incrustadas.
 */
export async function buildPptxPresentation(plan: PresentationPlan): Promise<Buffer> {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 inches

  const palette = THEMES[plan.theme] || THEMES.navy;

  // ==========================================
  // 1. DIAPOSITIVA DE PORTADA (COVER SLIDE)
  // ==========================================
  const coverSlide = pres.addSlide();
  coverSlide.background = { color: palette.darkBg };

  // Barra de acento superior
  coverSlide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: palette.accent },
  });

  // Badge corporativo
  coverSlide.addText('GRYPH/ • PRESENTACIÓN EJECUTIVA INTELIGENTE', {
    x: 1.0,
    y: 1.8,
    w: 8.5,
    h: 0.4,
    fontSize: 10,
    bold: true,
    color: palette.accent,
    charSpacing: 2,
  });

  // Título principal
  coverSlide.addText(plan.title, {
    x: 1.0,
    y: 2.3,
    w: 11.3,
    h: 2.2,
    fontSize: 36,
    bold: true,
    color: palette.textLight,
    fontFace: 'Arial',
    valign: 'top',
  });

  // Subtítulo
  if (plan.subtitle) {
    coverSlide.addText(plan.subtitle, {
      x: 1.0,
      y: 4.6,
      w: 10.5,
      h: 1.0,
      fontSize: 18,
      color: palette.accent,
      fontFace: 'Arial',
    });
  }

  // Línea divisoria
  coverSlide.addShape(pres.ShapeType.line, {
    x: 1.0,
    y: 5.8,
    w: 4.0,
    h: 0,
    line: { color: palette.primary, width: 2 },
  });

  // Metadatos al pie
  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  coverSlide.addText(`Documento Sintetizado con IA • ${today}`, {
    x: 1.0,
    y: 6.2,
    w: 8.0,
    h: 0.4,
    fontSize: 10,
    color: palette.textMuted,
  });

  // ==========================================
  // 2. DIAPOSITIVAS DE CONTENIDO CON IMÁGENES
  // ==========================================
  for (const slideData of plan.slides) {
    const slide = pres.addSlide();
    slide.background = { color: palette.bg };

    // Barra de cabecera decorativa
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.1,
      fill: { color: palette.primary },
    });

    // Badge de categoría
    if (slideData.badge) {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8,
        y: 0.45,
        w: 2.4,
        h: 0.35,
        fill: { color: palette.primary },
        rectRadius: 0.1,
      });

      slide.addText(slideData.badge.toUpperCase(), {
        x: 0.8,
        y: 0.45,
        w: 2.4,
        h: 0.35,
        fontSize: 9,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
      });
    }

    // Título de la diapositiva
    slide.addText(slideData.title, {
      x: 0.8,
      y: 0.9,
      w: 11.7,
      h: 0.8,
      fontSize: 22,
      bold: true,
      color: palette.textDark,
      fontFace: 'Arial',
      valign: 'top',
    });

    // Contenedor tarjeta izquierda (Puntos clave)
    const leftCardX = 0.8;
    const leftCardY = 1.85;
    const leftCardW = 6.2;
    const leftCardH = 4.9;

    slide.addShape(pres.ShapeType.roundRect, {
      x: leftCardX,
      y: leftCardY,
      w: leftCardW,
      h: leftCardH,
      fill: { color: palette.cardBg },
      line: { color: palette.border, width: 1 },
      rectRadius: 0.15,
    });

    // Encabezado dentro de la tarjeta
    slide.addText('PUNTOS CLAVE Y HALLAZGOS', {
      x: leftCardX + 0.3,
      y: leftCardY + 0.25,
      w: leftCardW - 0.6,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: palette.primary,
      charSpacing: 1,
    });

    // Lista de viñetas estructuradas
    const bulletItems = slideData.bulletPoints.map((point) => ({
      text: point,
      options: {
        fontSize: 13,
        color: palette.textDark,
        bullet: { type: 'bullet' as const, code: '25AA' },
        spacingAfter: 14,
        lineSpacing: 18,
      },
    }));

    slide.addText(bulletItems, {
      x: leftCardX + 0.3,
      y: leftCardY + 0.7,
      w: leftCardW - 0.6,
      h: leftCardH - 1.0,
      valign: 'top',
    });

    // Contenedor derecho: Imagen temática ilustrativa
    const imgX = 7.3;
    const imgY = 1.85;
    const imgW = 5.2;
    const imgH = 4.9;

    // Marco base para la imagen
    slide.addShape(pres.ShapeType.roundRect, {
      x: imgX,
      y: imgY,
      w: imgW,
      h: imgH,
      fill: { color: palette.cardBg },
      line: { color: palette.border, width: 1 },
      rectRadius: 0.15,
    });

    // Incrustar imagen
    if (slideData.imageUrl) {
      try {
        const isBase64 = slideData.imageUrl.startsWith('data:');
        slide.addImage({
          data: isBase64 ? slideData.imageUrl : undefined,
          path: !isBase64 ? slideData.imageUrl : undefined,
          x: imgX + 0.1,
          y: imgY + 0.1,
          w: imgW - 0.2,
          h: imgH - 0.2,
          sizing: { type: 'cover', w: imgW - 0.2, h: imgH - 0.2 },
        });
      } catch (err) {
        console.warn('Could not embed slide image:', err);
      }
    } else {
      // Placeholder si la imagen no está disponible
      slide.addText('🖼️ Ilustración Temática', {
        x: imgX,
        y: imgY + 2.0,
        w: imgW,
        h: 0.8,
        fontSize: 14,
        align: 'center',
        color: palette.textMuted,
      });
    }

    // Pie de página de diapositiva
    slide.addText(`Gryph/ • Diapositiva ${slideData.slideNumber} de ${plan.slides.length}`, {
      x: 0.8,
      y: 7.0,
      w: 8.0,
      h: 0.3,
      fontSize: 9,
      color: palette.textMuted,
    });

    // Speaker notes si existen
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }
  }

  // ==========================================
  // 3. DIAPOSITIVA DE CIERRE / CONCLUSIÓN
  // ==========================================
  const closingSlide = pres.addSlide();
  closingSlide.background = { color: palette.darkBg };

  closingSlide.addShape(pres.ShapeType.roundRect, {
    x: 2.0,
    y: 1.8,
    w: 9.33,
    h: 3.8,
    fill: { color: palette.darkBg },
    line: { color: palette.primary, width: 1.5 },
    rectRadius: 0.2,
  });

  closingSlide.addText('CONCLUSIÓN & PRÓXIMOS PASOS', {
    x: 2.5,
    y: 2.3,
    w: 8.33,
    h: 0.4,
    fontSize: 11,
    bold: true,
    color: palette.accent,
    charSpacing: 2,
    align: 'center',
  });

  closingSlide.addText('¡Gracias por su atención!', {
    x: 2.5,
    y: 2.9,
    w: 8.33,
    h: 1.0,
    fontSize: 32,
    bold: true,
    color: palette.textLight,
    align: 'center',
  });

  closingSlide.addText('Presentación generada automáticamente a partir del documento original con Gryph/ AI.', {
    x: 2.5,
    y: 4.1,
    w: 8.33,
    h: 0.8,
    fontSize: 14,
    color: palette.accent,
    align: 'center',
  });

  // Exportar a Buffer de Node
  const buffer = (await pres.write({ outputType: 'nodebuffer' })) as Buffer;
  return buffer;
}
