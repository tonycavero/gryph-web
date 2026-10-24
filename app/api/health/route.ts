import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  return NextResponse.json(
    { status: 'ok', uptime: process.uptime(), timestamp: Date.now() },
    { status: 200, headers: getCorsHeaders(origin) }
  );
}
