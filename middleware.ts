import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCorsHeaders, handleCorsPreflight } from './lib/cors';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Handle preflight OPTIONS requests immediately
  if (request.method === 'OPTIONS') {
    return handleCorsPreflight(origin);
  }

  // Handle standard requests and attach CORS headers
  const response = NextResponse.next();
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
