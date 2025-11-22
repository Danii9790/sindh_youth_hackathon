import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Admin user IDs from environment
const ADMIN_USERS = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(',') || [];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId || !ADMIN_USERS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentId = params.id;
    const body = await request.json();
    const { status } = body;

    if (!status || !['scheduled', 'completed', 'cancelled', 'confirmed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const DB_URL = process.env.NEON_POSTGRES_URL;
    if (!DB_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { Client } = await import('@neondatabase/serverless');
    const client = new Client(DB_URL);

    try {
      await client.connect();

      // Check if appointment exists
      const checkQuery = 'SELECT id FROM appointments WHERE id = $1';
      const checkResult = await client.query(checkQuery, [appointmentId]);

      if (checkResult.rows.length === 0) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      // Update appointment status
      const updateQuery = `
        UPDATE appointments
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, status
      `;

      const updateResult = await client.query(updateQuery, [status, appointmentId]);

      if (updateResult.rows.length === 0) {
        return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Appointment updated successfully',
        appointment: {
          id: updateResult.rows[0].id,
          status: updateResult.rows[0].status
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
    } finally {
      await client.end();
    }

  } catch (error) {
    console.error('Update appointment API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId || !ADMIN_USERS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentId = params.id;

    const DB_URL = process.env.NEON_POSTGRES_URL;
    if (!DB_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { Client } = await import('@neondatabase/serverless');
    const client = new Client(DB_URL);

    try {
      await client.connect();

      // Check if appointment exists
      const checkQuery = 'SELECT id FROM appointments WHERE id = $1';
      const checkResult = await client.query(checkQuery, [appointmentId]);

      if (checkResult.rows.length === 0) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      // Delete appointment
      const deleteQuery = 'DELETE FROM appointments WHERE id = $1';
      const deleteResult = await client.query(deleteQuery, [appointmentId]);

      if (deleteResult.rowCount === 0) {
        return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Appointment deleted successfully',
        appointmentId: appointmentId
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
    } finally {
      await client.end();
    }

  } catch (error) {
    console.error('Delete appointment API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}