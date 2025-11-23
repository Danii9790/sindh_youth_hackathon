'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      // Check if user is admin
      const adminUsers = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(',') || [];
      if (adminUsers.includes(user.id)) {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    } else {
      router.replace('/sign-in');
    }
  }, [user, isLoaded, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}