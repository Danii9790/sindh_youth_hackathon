import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function isAdmin() {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  const adminUsers = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(',') || [];
  return adminUsers.includes(userId);
}

export async function requireAdmin() {
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    return NextResponse.redirect(new URL('/', baseUrl));
  }

  return true;
}