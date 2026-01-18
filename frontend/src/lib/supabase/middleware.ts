/**
 * Supabase Middleware Helper
 * For Next.js Middleware authentication
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - force revalidation, no cache
  const { data: { user }, error } = await supabase.auth.getUser()

  // Protect admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage) {
    // Require authentication for all admin routes except login
    if (error || !user) {
      // No valid session - redirect to login
      const redirectUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has admin role (if role is stored in user_metadata)
    const userRole = user.user_metadata?.role
    if (userRole && userRole !== 'admin') {
      // User is authenticated but not an admin
      const redirectUrl = new URL('/unauthorized', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Add cache prevention headers for admin pages
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (isLoginPage && user) {
    const redirectUrl = new URL('/admin', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
