import { requireAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from './AdminDashboardClient';

export async function AdminWrapper() {
  // Check admin authentication on server side
  const authResult = await requireAdmin();

  // If requireAdmin returns a redirect response, redirect
  if (authResult !== true) {
    redirect('/');
  }

  // User is authenticated as admin, render the client component
  return <AdminDashboardClient />;
}