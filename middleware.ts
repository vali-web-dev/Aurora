import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Export auth handler for middleware
export const middleware = auth((req) => {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  const withTraceHeaders = (response: NextResponse) => {
    response.headers.set('x-request-id', requestId);
    response.headers.set('x-aurora-trace', requestId);
    return response;
  };

  const isLoggedIn = !!req.auth;
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
  const isPublicPage = 
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname === '/about' ||
    req.nextUrl.pathname === '/legal' ||
    req.nextUrl.pathname === '/contact' ||
    req.nextUrl.pathname.startsWith('/auth') ||
    req.nextUrl.pathname.startsWith('/api/auth');

  if (isApiRoute) {
    console.info(
      JSON.stringify({
        level: 'info',
        event: 'api.request',
        requestId,
        method: req.method,
        path: req.nextUrl.pathname,
        userId: req.auth?.user?.id || null,
      })
    );

    return withTraceHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    );
  }

  // Redirect unauthenticated users trying to access protected pages
  if (!isLoggedIn && !isPublicPage) {
    return withTraceHeaders(NextResponse.redirect(new URL('/auth/signin', req.nextUrl)));
  }

  // Allow public pages for all users
  if (isPublicPage) {
    return withTraceHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    );
  }

  // User is authenticated and accessing protected content
  return withTraceHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  );
});

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
