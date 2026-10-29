import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SlideItem {
  slideNumber: number;
  badge?: string;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  imagePrompt: string;
  imageUrl?: string;
  speakerNotes?: string;
}

export interface PresentationPlan {
  title: string;
  subtitle: string;
  theme: 'navy' | 'emerald' | 'amber' | 'slate' | 'violet';
  slides: SlideItem[];
}

export interface GeneratorOptions {
  slideCount?: number;
  theme?: 'navy' | 'emerald' | 'amber' | 'slate' | 'violet';
  language?: 'es' | 'en';
  apiKey?: string;
}

/**
 * Generador heurístico de respaldo (funciona sin API key ni conexión a IA).
 */
function generateHeuristicPlan(
  rawText: string,
  targetSlides: number,
  theme: 'navy' | 'emerald' | 'amber' | 'slate' | 'violet',
  lang: 'es' | 'en'
): PresentationPlan {
  const isEs = lang === 'es';
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Intentar detectar título
  let presTitle = lines[0]?.slice(0, 70) || (isEs ? 'Presentación Ejecutiva' : 'Executive Presentation');
  if (presTitle.length < 5) presTitle = isEs ? 'Resumen del Documento' : 'Document Executive Summary';

  const presSubtitle = isEs
    ? 'Síntesis ejecutiva y puntos clave del contenido'
    : 'Executive synthesis and key takeaways';

  // Dividir el texto en bloques de párrafos significativos
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 40);

  const totalSlides = Math.min(Math.max(targetSlides, 4), 14);
  const slides: SlideItem[] = [];

  const defaultBadgesEs = [
    'Visión General',
    'Contexto & Antecedentes',
    'Puntos Críticos',
    'Estrategia & Enfoque',
    'Métricas & Resultados',
    'Implementación',
    'Factores de Éxito',
    'Conclusiones & Pasos Siguientes',
  ];

  const defaultBadgesEn = [
    'Overview',
    'Context & Background',
    'Key Findings',
    'Strategy & Approach',
    'Metrics & Insights',
    'Implementation',
    'Success Factors',
    'Next Steps & Conclusion',
  ];

  const badges = isEs ? defaultBadgesEs : defaultBadgesEn;

  const defaultPrompts = [
    'business meeting strategic discussion collaboration',
    'technology digital transformation cloud innovation',
    'data analytics growth metrics charts',
    'teamwork diverse professionals working together',
    'financial success market expansion graph',
    'modern office creative brainstorming',
    'global network connected world infrastructure',
    'futuristic corporate leadership vision',
  ];

  for (let i = 0; i < totalSlides; i++) {
    const badge = badges[i % badges.length];
    const imagePrompt = defaultPrompts[i % defaultPrompts.length];

    // Obtener texto para esta diapositiva
    const chunkIndex = Math.floor((i / totalSlides) * Math.max(paragraphs.length, 1));
    const chunk = paragraphs[chunkIndex] || paragraphs[0] || rawText.slice(i * 200, (i + 1) * 200);

    // Extraer frases u oraciones para bullet points
    const sentences = chunk
      .split(/[.?!]\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    const slideTitle = sentences[0]?.slice(0, 55) || `${badge} ${i + 1}`;
    const bulletPoints = sentences.slice(1, 4).map((s) => s.slice(0, 120));

    if (bulletPoints.length === 0) {
      bulletPoints.push(
        isEs ? 'Análisis integral de los factores determinantes descritos en el documento.' : 'Comprehensive analysis of key factors outlined in the source document.',
        isEs ? 'Identificación de oportunidades clave de optimización y desarrollo.' : 'Identification of core development and optimization opportunities.',
        isEs ? 'Recomendaciones estratégicas para maximizar el impacto operativo.' : 'Strategic recommendations to maximize operational impact and results.'
      );
    }

    slides.push({
      slideNumber: i + 1,
      badge,
      title: slideTitle,
      subtitle: isEs ? 'Análisis y síntesis del contenido' : 'Content analysis & synthesis',
      bulletPoints,
      imagePrompt,
    });
  }

  return {
    title: presTitle,
    subtitle: presSubtitle,
    theme,
    slides,
  };
}

/**
 * Genera el plan estructurado de diapositivas usando la IA de Google Gemini o fallback heurístico.
 */
export async function generateSlidePlan(
  documentText: string,
  options: GeneratorOptions = {}
): Promise<PresentationPlan> {
  const {
    slideCount = 6,
    theme = 'navy',
    language = 'es',
    apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  } = options;

  const targetCount = Math.min(Math.max(slideCount, 4), 14);

  // Si no hay API key configurada, usar el motor heurístico instantáneo
  if (!apiKey) {
    return generateHeuristicPlan(documentText, targetCount, theme, language);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const isEs = language === 'es';
    const sampleText = documentText.slice(0, 18000); // Contexto óptimo de entrada

    const prompt = `Actúa como un diseñador ejecutivo de presentaciones de consultoría de clase mundial (estilo McKinsey/Bain).
Analiza el siguiente documento y sintetízalo en una presentación de PowerPoint de alto impacto con exactamente ${targetCount} diapositivas de contenido.

Idioma de salida: ${isEs ? 'Español' : 'Inglés'}.

Estructura requerida en formato JSON estricto:
{
  "title": "Título principal atractivo y ejecutivo de la presentación",
  "subtitle": "Subtítulo descriptivo en 1 línea",
  "theme": "${theme}",
  "slides": [
    {
      "slideNumber": 1,
      "badge": "Categoría breve (ej: 'Contexto', 'Estrategia', 'Resultados', 'Conclusión')",
      "title": "Titular de la diapositiva conciso y contundente",
      "subtitle": "Resumen en una frase del mensaje clave de la diapositiva",
      "bulletPoints": [
        "Punto 1: Dato o idea clave bien explicada de forma ejecutiva",
        "Punto 2: Segundo hallazgo o aspecto relevante del documento",
        "Punto 3: Acción, conclusión o impacto medible"
      ],
      "imagePrompt": "2-4 palabras clave en inglés muy visuales para buscar o generar la imagen temática perfecta (ej: 'artificial intelligence data network', 'financial growth market chart', 'team collaboration office')",
      "speakerNotes": "Breve nota o argumento para el presentador"
    }
  ]
}

Documento fuente:
"""
${sampleText}
"""
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const parsed = JSON.parse(responseText);

    if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
      return {
        title: parsed.title || (isEs ? 'Presentación Ejecutiva' : 'Executive Presentation'),
        subtitle: parsed.subtitle || '',
        theme: parsed.theme || theme,
        slides: parsed.slides.map((s: any, idx: number) => ({
          slideNumber: idx + 1,
          badge: s.badge || `Slide ${idx + 1}`,
          title: s.title || `Diapositiva ${idx + 1}`,
          subtitle: s.subtitle || '',
          bulletPoints: Array.isArray(s.bulletPoints) && s.bulletPoints.length > 0
            ? s.bulletPoints.slice(0, 4)
            : ['Punto clave del documento'],
          imagePrompt: s.imagePrompt || 'business technology concept',
          speakerNotes: s.speakerNotes || '',
        })),
      };
    }
  } catch (err) {
    console.warn('Gemini slide generation failed or timed out, falling back to heuristic engine:', err);
  }

  // Fallback seguro si falla la llamada a la API
  return generateHeuristicPlan(documentText, targetCount, theme, language);
}
