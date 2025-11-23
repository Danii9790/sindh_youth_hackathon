import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You are logged in as a regular user.</p>
          <p>Your User ID: {userId}</p>
        </CardContent>
      </Card>
    </div>
  );
}