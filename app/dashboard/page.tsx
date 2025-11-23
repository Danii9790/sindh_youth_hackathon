import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-auth';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const adminStatus = await isAdmin();

  if (adminStatus) {
    // Redirect admin users to admin panel
    redirect('/admin');
  } else {
    // Redirect regular users to home page
    redirect('/');
  }
}