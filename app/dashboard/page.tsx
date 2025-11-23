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
  }

  // For regular users, show a simple dashboard or redirect to home
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h2>
        <div className="space-y-2">
          <p>You are logged in as a regular user.</p>
          <p className="text-sm text-gray-600">Your User ID: {userId}</p>
        </div>
      </div>
    </div>
  );
}