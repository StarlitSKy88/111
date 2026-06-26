/**
 * ONE-MCN Next.js Middleware
 * v5.6 — CORS + Rate Limit
 */
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/api/:path*',
};

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin');
  const isDev = process.env.NODE_ENV !== 'production';

  // CORS
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && (isDev || /^https:\/\/(onemcn\.com|.*\.onemcn-pages\.edgeone\.app)$/.test(origin))) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Vary'] = 'Origin';
  }

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}
