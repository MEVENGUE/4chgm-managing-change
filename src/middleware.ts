import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC = ['/login', '/register', '/forgot-password', '/reset-password', '/privacy', '/terms', '/cookies', '/about', '/contact']
const SESSION_COOKIE = '4chgm-session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value

  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')

  if (isProtected && !token) {
    const login = new URL('/login', request.url)
    login.searchParams.set('redirect', pathname)
    return NextResponse.redirect(login)
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(token ? '/dashboard' : '/login', request.url))
  }

  if (!isPublic && !isProtected && pathname !== '/') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg|api).*)'],
}
