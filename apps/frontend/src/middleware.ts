import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';

// Runs before every matched request. Redirects unauthenticated users
// away from /dashboard/* to /login — the frontend's enforcement layer,
// independent of (but consistent with) the backend's SessionGuard.
export default auth((req) => {
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isAuthenticated = !!req.auth;

  if (isDashboardRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const runtime = 'nodejs';

export const config = {
  matcher: ['/dashboard/:path*'],
};