import { NextRequest, NextResponse } from 'next/server';
import { getUserAppointments, saveAppointmentToDb } from '@/services/dbService';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointments = await getUserAppointments(userId);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Convert the request body to match dbService interface
    const appointmentData = {
      patientName: body.fullName || body.patientName,
      phone: body.phone,
      doctor: {
        id: body.doctor.id || 'default-doctor-id',
        name: body.doctor.name || body.doctor,
        specialty: body.doctor.specialty,
        location: body.doctor.location,
        image: body.doctor.image || '/default-doctor.jpg'
      },
      date: body.date,
      time: body.time,
      symptoms: body.symptoms || body.reason
    };

    const result = await saveAppointmentToDb(appointmentData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    // Return the created appointment with all fields
    const appointment = {
      id: result.appointmentId,
      userId,
      fullName: appointmentData.patientName,
      email: body.email,
      phone: appointmentData.phone,
      department: body.department,
      doctor: appointmentData.doctor.name,
      date: appointmentData.date,
      time: appointmentData.time,
      symptoms: appointmentData.symptoms,
      address: body.address,
      reason: body.reason,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}