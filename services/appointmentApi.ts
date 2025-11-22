// Client-side API wrapper functions for appointment operations
// This prevents server-side database modules from being bundled with the client

export interface AppointmentData {
  patientName?: string;
  phone: string;
  doctor: {
    id?: string;
    name: string;
    specialty: string;
    location: string;
    image?: string;
  };
  date: string;
  time: string;
  symptoms?: string;
}

export interface AppointmentResponse {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  phone: string;
  department?: string;
  doctor: string;
  date: string;
  time: string;
  symptoms?: string;
  address?: string;
  reason?: string;
  status: string;
  createdAt: string;
}

export interface DatabaseAppointment {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  department: string;
  doctor: string;
  reason: string;
  symptoms?: string;
  address: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

// Client-side wrapper for saving appointments
export const saveAppointment = async (appointmentData: AppointmentData): Promise<{success: boolean, message: string, appointmentId?: string}> => {
  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.error || 'Failed to save appointment'
      };
    }

    const result = await response.json();
    return {
      success: true,
      message: 'Appointment saved successfully',
      appointmentId: result.data?.id
    };
  } catch (error) {
    console.error('Error saving appointment:', error);
    return {
      success: false,
      message: 'Network error occurred while saving appointment'
    };
  }
};

// Client-side wrapper for getting user appointments
export const getUserAppointments = async (): Promise<DatabaseAppointment[]> => {
  try {
    const response = await fetch('/api/appointments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch appointments:', response.statusText);
      return [];
    }

    const appointments = await response.json();
    return appointments.data || appointments || [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

// Client-side wrapper for checking appointment availability
export const checkAppointmentAvailability = async (date: string, time: string): Promise<{available: boolean, message: string}> => {
  try {
    const response = await fetch(`/api/appointments/availability?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        available: false,
        message: 'Failed to check appointment availability'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking appointment availability:', error);
    return {
      available: false,
      message: 'Network error occurred while checking availability'
    };
  }
};

// Client-side wrapper for validating appointment date/time
export const validateAppointmentDateTime = async (date: string, time: string): Promise<{valid: boolean, message: string}> => {
  try {
    const response = await fetch(`/api/appointments/validate?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        message: 'Failed to validate appointment date/time'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating appointment date/time:', error);
    return {
      valid: false,
      message: 'Network error occurred while validating'
    };
  }
};