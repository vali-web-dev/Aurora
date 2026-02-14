import { auth } from '@/lib/auth';

// Export auth handler for middleware
export const middleware = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isPublicPage = 
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname === '/about' ||
    req.nextUrl.pathname === '/legal' ||
    req.nextUrl.pathname === '/contact' ||
    req.nextUrl.pathname.startsWith('/auth') ||
    req.nextUrl.pathname.startsWith('/api/auth');

  // Redirect unauthenticated users trying to access protected pages
  if (!isLoggedIn && !isPublicPage) {
    return Response.redirect(new URL('/auth/signin', req.nextUrl));
  }

  // Allow public pages for all users
  if (isPublicPage) {
    return;
  }

  // User is authenticated and accessing protected content
  return;
});

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
