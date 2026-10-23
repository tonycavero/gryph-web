import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoInfo } from '@/lib/downloader';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Por favor proporciona una URL válida.' },
        { status: 400 }
      );
    }

    const info = await fetchVideoInfo(url.trim());
    return NextResponse.json({ success: true, data: info });
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'No se pudo procesar el video. Verifica que el enlace sea público.' 
      },
      { status: 500 }
    );
  }
}
