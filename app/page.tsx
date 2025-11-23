'use client';

import { useUser } from '@clerk/nextjs';
import { MediAIApp } from '@/components/MediAIApp';
import { LandingPage } from '@/components/LandingPage';

export default function Page() {
  const { user, isSignedIn, isLoaded } = useUser();

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authenticated, show the main application
  // Admin users will be redirected by middleware
  if (isSignedIn && user) {
    return <MediAIApp />;
  }

  // If not authenticated, show the landing page
  return <LandingPage />;
}