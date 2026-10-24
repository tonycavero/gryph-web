import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoInfo } from '@/lib/downloader';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Por favor proporciona una URL válida.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const info = await fetchVideoInfo(url.trim());
    return NextResponse.json({ success: true, data: info }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'No se pudo procesar el video. Verifica que el enlace sea público.' 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
