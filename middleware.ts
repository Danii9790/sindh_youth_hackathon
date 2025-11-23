import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/settings(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();

  // Handle admin routing for any authenticated user
  if (userId) {
    const adminUsers = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(',') || [];
    const isAdmin = adminUsers.includes(userId);

    // If admin is on dashboard or home, redirect to admin panel
    if (isAdmin && (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/dashboard')) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    // If non-admin is trying to access admin routes, redirect to home
    if (!isAdmin && req.nextUrl.pathname.startsWith('/admin')) {
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