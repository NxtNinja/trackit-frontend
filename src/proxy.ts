import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Define public routes
  const isPublicRoute = pathname === '/login' || pathname === '/signup' || pathname === '/'
  
  // Ignore static assets and internal Next.js paths
  const isStaticAsset = 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/static') || 
    pathname.includes('.')

  if (isStaticAsset) {
    return NextResponse.next()
  }

  // If not a public route and no token, redirect to login
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If already authenticated and trying to access login/signup, redirect to dashboard
  if ((pathname === '/login' || pathname === '/signup') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}
 
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}