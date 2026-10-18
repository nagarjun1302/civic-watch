import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'roadwatch-admin-secret-key-change-in-production-2026'
);

const COOKIE_NAME = 'roadwatch_admin_token';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only handle /admin paths
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    let isAuthenticated = false;

    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        isAuthenticated = true;
      } catch {
        isAuthenticated = false;
      }
    }

    // If on /admin/login and already authenticated, redirect to /admin/complaints
    if (pathname === '/admin/login') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin/complaints', req.url));
      }
      return NextResponse.next();
    }

    // If accessing any other /admin path and NOT authenticated, redirect to /admin/login
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If visiting /admin directly, redirect to /admin/complaints
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/complaints', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
