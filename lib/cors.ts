import { NextResponse } from 'next/server';

const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/gryph-web-seven\.vercel\.app$/,
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/gryph-web\.onrender\.com$/,
];

export function isOriginAllowed(origin: string | null | undefined): boolean {
  if (!origin) return true;
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

export function getCorsHeaders(origin?: string | null): Record<string, string> {
  let allowOrigin = '*';
  if (origin && isOriginAllowed(origin)) {
    allowOrigin = origin;
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCorsPreflight(origin?: string | null): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
