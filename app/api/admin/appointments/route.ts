import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Admin user IDs from environment (private)
const ADMIN_USERS = process.env.ADMIN_USERS?.split(',') || process.env.NEXT_PUBLIC_ADMIN_USERS?.split(',') || [];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

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

      // Check what columns exist in the table
      const columnsQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        ORDER BY ordinal_position;
      `;
      const columnsResult = await client.query(columnsQuery);
      const existingColumns = columnsResult.rows.map(row => row.column_name);

      // Build query based on existing columns
      let query: string;
      if (existingColumns.includes('doctor_name') && existingColumns.includes('doctor_specialty')) {
        // Full schema with separate doctor columns
        query = `
          SELECT id, patient_name, email, phone, address,
                 date, time, department, doctor_name, doctor_specialty, doctor_location,
                 symptoms, reason, status,
                 created_at, updated_at, booked_at
          FROM appointments
          ORDER BY created_at DESC
        `;
      } else {
        // Simplified schema
        query = `
          SELECT id, patient_name, email, phone, address,
                 date, time, department, doctor,
                 symptoms, reason, status,
                 created_at, updated_at, booked_at
          FROM appointments
          ORDER BY created_at DESC
        `;
      }

      const result = await client.query(query);

      // Transform results to consistent format
      const appointments = result.rows.map(row => {
        // Handle different doctor column formats
        let doctor = 'General Doctor';
        if (row.doctor_name) {
          doctor = row.doctor_name;
          if (row.doctor_specialty) {
            doctor += ` (${row.doctor_specialty})`;
          }
        } else if (row.doctor) {
          doctor = row.doctor;
        }

        return {
          id: row.id,
          fullName: row.patient_name || 'Unknown',
          email: row.email || '',
          phone: row.phone || '',
          address: row.address || '',
          date: row.date,
          time: row.time,
          department: row.department || 'general',
          doctor: doctor,
          reason: row.reason || row.symptoms || 'General consultation',
          symptoms: row.symptoms || '',
          status: row.status || 'scheduled',
          createdAt: row.created_at || row.booked_at || new Date().toISOString(),
          updatedAt: row.updated_at || row.created_at || row.booked_at || new Date().toISOString()
        };
      });

      return NextResponse.json(appointments);

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
    } finally {
      await client.end();
    }

  } catch (error) {
    console.error('Appointments API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}