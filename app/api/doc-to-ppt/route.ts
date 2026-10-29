import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromDocument } from '@/lib/documentParser';
import { generateSlidePlan, PresentationPlan } from '@/lib/aiSlideGenerator';
import { getThematicImageDataUrl } from '@/lib/imageFetcher';
import { buildPptxPresentation } from '@/lib/pptxBuilder';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 segundos para permitir procesamiento holgado

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // MODO 1: Descarga directa a partir del plan JSON ya generado
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const plan: PresentationPlan = body.plan;

      if (!plan || !Array.isArray(plan.slides) || plan.slides.length === 0) {
        return NextResponse.json({ success: false, error: 'Plan de diapositivas inválido' }, { status: 400 });
      }

      const pptxBuffer = await buildPptxPresentation(plan);
      const safeTitle = (plan.title || 'Presentacion')
        .replace(/[^\w\s-]/gi, '')
        .trim()
        .slice(0, 40) || 'Presentacion';
      const filename = `Gryph - ${safeTitle}.pptx`;

      const headers = new Headers();
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
      headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      headers.set('Content-Length', pptxBuffer.length.toString());

      return new Response(new Uint8Array(pptxBuffer), { status: 200, headers });
    }

    // MODO 2: Procesamiento inicial de archivo subido (PDF, DOCX, DOC, TXT)
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const slideCount = parseInt((formData.get('slideCount') as string) || '6', 10);
    const theme = ((formData.get('theme') as string) || 'navy') as any;
    const language = ((formData.get('language') as string) || 'es') as any;
    const apiKey = (formData.get('apiKey') as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Por favor selecciona un archivo PDF o Word válido.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 1. Extraer texto del documento
    const { text, wordCount } = await extractTextFromDocument(fileBuffer, file.name, file.type);

    // 2. Generar plan de diapositivas con IA / motor cognitivo
    const plan = await generateSlidePlan(text, {
      slideCount,
      theme,
      language,
      apiKey,
    });

    // 3. Generar / asociar imágenes temáticas para cada diapositiva en paralelo
    const slidesWithImages = await Promise.all(
      plan.slides.map(async (slide, idx) => {
        try {
          const imgResult = await getThematicImageDataUrl(slide.imagePrompt, idx);
          return {
            ...slide,
            imageUrl: imgResult.dataUrl,
            imageSourceUrl: imgResult.sourceUrl,
          };
        } catch {
          return slide;
        }
      })
    );

    const completedPlan: PresentationPlan = {
      ...plan,
      slides: slidesWithImages,
    };

    return NextResponse.json({
      success: true,
      data: {
        plan: completedPlan,
        fileName: file.name,
        wordCount,
      },
    });
  } catch (err: any) {
    console.error('Doc to PPT error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Ocurrió un error inesperado al procesar el documento.',
      },
      { status: 500 }
    );
  }
}
