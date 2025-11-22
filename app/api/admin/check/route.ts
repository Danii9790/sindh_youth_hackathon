import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Admin user IDs from environment (private)
const ADMIN_USERS = process.env.ADMIN_USERS?.split(',') || [];

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const isAdmin = ADMIN_USERS.includes(userId);

    return NextResponse.json({ isAdmin }, { status: 200 });

  } catch (error) {
    console.error('Admin check API error:', error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}