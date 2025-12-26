import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Exclude login page from protection
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for access token in cookies
    const token = request.cookies.get('accessToken')?.value;
    
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token exists - allow access
    // Note: JWT verification happens in API calls via Authorization header
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
