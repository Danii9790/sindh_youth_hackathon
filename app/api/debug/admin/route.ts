import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    const response = {
      currentUserId: userId,
      adminUsers: process.env.ADMIN_USERS?.split(',') || [],
      isAdmin: userId ? await isAdmin() : false,
      envAdminUsers: process.env.ADMIN_USERS
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get auth info', details: error },
      { status: 500 }
    );
  }
}