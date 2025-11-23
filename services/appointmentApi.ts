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

    // Handle both response formats: { data: {...} } or direct appointment object
    const responseData = result.data || result;
    const appointmentId = responseData.id || responseData.appointmentId;

    return {
      success: true,
      message: 'Appointment saved successfully',
      appointmentId: appointmentId
    };
  } catch (error) {
    console.error('Error saving appointment:', error);

    let errorMessage = 'Network error occurred while saving appointment';

    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.message.includes('AbortError')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        errorMessage = 'Appointment service not available. Please try again later.';
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        errorMessage = 'Server error occurred. Please try again in a few moments.';
      }
    }

    return {
      success: false,
      message: errorMessage
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
    const response = await fetch(`/api/appointments/validate?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        available: false,
        message: errorData.error || 'Failed to check availability'
      };
    }

    const result = await response.json();
    const data = result.data || result;

    return {
      available: data.available || true,
      message: data.message || 'Time slot is available'
    };
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
      const errorData = await response.json();
      return {
        valid: false,
        message: errorData.error || 'Failed to validate appointment time'
      };
    }

    const result = await response.json();
    const data = result.data || result;

    return {
      valid: data.valid !== false,
      message: data.message || 'Appointment time is valid'
    };
  } catch (error) {
    console.error('Error validating appointment date/time:', error);

    // Fallback to client-side validation
    try {
      const appointmentDate = new Date(`${date} ${time}`);
      const now = new Date();

      if (isNaN(appointmentDate.getTime())) {
        return { valid: false, message: 'Invalid date format' };
      }

      if (appointmentDate <= now) {
        return { valid: false, message: 'Appointment must be in the future' };
      }

      const hours = appointmentDate.getHours();
      if (hours < 9 || hours > 18) {
        return { valid: false, message: 'Appointments are available between 9 AM and 6 PM' };
      }

      return { valid: true, message: 'Appointment time is valid' };
    } catch (fallbackError) {
      return { valid: false, message: 'Error validating appointment time' };
    }
  }
};