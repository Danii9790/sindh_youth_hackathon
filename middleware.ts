import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/settings(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();

  // Handle post-authentication routing
  if (userId && req.nextUrl.pathname === '/') {
    const adminUsers = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(',') || [];
    const isAdmin = adminUsers.includes(userId);

    if (isAdmin) {
      // Redirect admin users to admin dashboard
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    // Regular users stay on home page (will see MediAIApp)
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && userId) {
    const adminUsers = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(',') || [];
    const isAdmin = adminUsers.includes(userId);

    if (!isAdmin) {
      // Non-admin users trying to access admin routes
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};