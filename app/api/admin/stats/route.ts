import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Admin user IDs from environment
const ADMIN_USERS = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(',') || [];

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId || !ADMIN_USERS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const DB_URL = process.env.NEON_POSTGRES_URL;
    if (!DB_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { Client } = await import('@neondatabase/serverless');
    const client = new Client(DB_URL);

    try {
      await client.connect();

      // Get current date and date ranges
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Total appointments
      const totalAppointmentsQuery = 'SELECT COUNT(*) as count FROM appointments';
      const totalAppointmentsResult = await client.query(totalAppointmentsQuery);
      const totalAppointments = parseInt(totalAppointmentsResult.rows[0].count);

      // Appointments by status
      const appointmentsByStatusQuery = `
        SELECT status, COUNT(*) as count
        FROM appointments
        GROUP BY status
      `;
      const appointmentsByStatusResult = await client.query(appointmentsByStatusQuery);
      const statusCounts = appointmentsByStatusResult.rows.reduce((acc, row) => {
        acc[row.status.toLowerCase()] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>);

      // Appointments today
      const todayQuery = `
        SELECT COUNT(*) as count
        FROM appointments
        WHERE date >= $1 AND date < $2
      `;
      const todayResult = await client.query(todayQuery, [todayStart, todayEnd]);
      const appointmentsToday = parseInt(todayResult.rows[0].count);

      // Appointments this week
      const weekQuery = `
        SELECT COUNT(*) as count
        FROM appointments
        WHERE date >= $1
      `;
      const weekResult = await client.query(weekQuery, [weekStart]);
      const appointmentsThisWeek = parseInt(weekResult.rows[0].count);

      // Appointments this month
      const monthQuery = `
        SELECT COUNT(*) as count
        FROM appointments
        WHERE date >= $1
      `;
      const monthResult = await client.query(monthQuery, [monthStart]);
      const appointmentsThisMonth = parseInt(monthResult.rows[0].count);

      // Total unique users (approximate from unique user_ids if column exists, or from unique emails)
      let totalUsers = 0;
      try {
        const usersQuery = 'SELECT COUNT(DISTINCT user_id) as count FROM appointments WHERE user_id IS NOT NULL';
        const usersResult = await client.query(usersQuery);
        totalUsers = parseInt(usersResult.rows[0].count);
      } catch (error) {
        // Fallback to unique emails if user_id column doesn't exist
        const emailsQuery = 'SELECT COUNT(DISTINCT email) as count FROM appointments WHERE email IS NOT NULL';
        const emailsResult = await client.query(emailsQuery);
        totalUsers = parseInt(emailsResult.rows[0].count);
      }

      const stats = {
        totalAppointments,
        scheduledAppointments: statusCounts.scheduled || 0,
        completedAppointments: statusCounts.completed || 0,
        cancelledAppointments: statusCounts.cancelled || 0,
        totalUsers,
        appointmentsToday,
        appointmentsThisWeek,
        appointmentsThisMonth
      };

      return NextResponse.json(stats);

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
    } finally {
      await client.end();
    }

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}