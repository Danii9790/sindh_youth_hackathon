'use client';

import { MediAIApp } from '@/components/MediAIApp';
import { AdminDashboard } from '@/components/AdminDashboard';
import { LandingPage } from '../components/LandingPage';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';

function HomePage() {
  const { user } = useUser();

  // Check if user is admin (using environment variable for admin user IDs)
  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(',').includes(user?.id || '');

  return (
    <>
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <MediAIApp />
      )}
    </>
  );
}

export default function Page() {
  return (
    <>
      <SignedIn>
        <HomePage />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  );
}