import { NextRequest, NextResponse } from 'next/server';
import { getUserAppointments, saveAppointmentToDb } from '@/services/dbService';
import { auth } from '@clerk/nextjs/server';
import { withApiMiddleware, createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return withApiMiddleware(request, async (req) => {
    const { userId } = auth();

    // Allow viewing appointments for demo purposes
    const finalUserId = userId || 'demo-user';

    if (!userId) {
      console.log('⚠️  User not authenticated - showing demo appointments');
    }

    try {
      const appointments = await getUserAppointments(userId);
      return createSuccessResponse(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return createErrorResponse('Failed to fetch appointments', 500);
    }
  }, {
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 50 // 50 requests per minute for GET
    }
  });
}

export async function POST(request: NextRequest) {
  return withApiMiddleware(request, async (req) => {
    const { userId } = auth();

    // Allow booking for demo purposes with a generated user ID
    const finalUserId = userId || 'demo-user-' + Date.now();

    if (!userId) {
      console.log('⚠️  User not authenticated - allowing demo booking with ID:', finalUserId);
    }

    try {
      const body = await req.json();
      console.log('📝 Received appointment data:', body);

      // Validate required fields
      if (!body.phone || !body.date || !body.time) {
        return createErrorResponse('Missing required fields: phone, date, time', 400);
      }

      // Convert the request body to match dbService interface
      const appointmentData = {
        patientName: body.fullName || body.patientName || 'Unknown Patient',
        phone: body.phone,
        doctor: {
          id: body.doctor?.id || 'default-doctor-id',
          name: body.doctor?.name || body.doctor || 'General Doctor',
          specialty: body.doctor?.specialty || 'General Practice',
          location: body.doctor?.location || 'Main Hospital',
          image: body.doctor?.image || '/default-doctor.jpg'
        },
        date: body.date,
        time: body.time,
        symptoms: body.symptoms || body.reason || 'General consultation'
      };

      const result = await saveAppointmentToDb(appointmentData);

      if (!result.success) {
        return createErrorResponse(result.message, 500);
      }

      // Return the created appointment with all fields
      const appointment = {
        id: result.appointmentId,
        userId: finalUserId,
        fullName: appointmentData.patientName,
        email: body.email || '',
        phone: appointmentData.phone,
        department: body.department || appointmentData.doctor.specialty,
        doctor: appointmentData.doctor.name,
        date: appointmentData.date,
        time: appointmentData.time,
        symptoms: appointmentData.symptoms,
        address: body.address || '',
        reason: body.reason || appointmentData.symptoms,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };

      return createSuccessResponse(appointment, 201);
    } catch (error) {
      console.error('Error creating appointment:', error);
      return createErrorResponse('Failed to create appointment', 500);
    }
  }, {
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10 // Lower limit for appointment creation
    }
  });
}