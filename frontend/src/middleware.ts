import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware disabled - using client-side auth checks instead
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
