// Comprehensive Frontend Integration Example for Appointment Booking
// This file demonstrates how to use the appointment booking system from the frontend

import {
  saveAppointment,
  getUserAppointments,
  checkAppointmentAvailability,
  validateAppointmentDateTime,
  AppointmentData
} from '../services/appointmentApi';

// Example 1: Basic Appointment Booking
export const bookAppointment = async (appointmentData) => {
  try {
    console.log('📝 Starting appointment booking process...');

    // Validate required fields
    if (!appointmentData.phone || !appointmentData.date || !appointmentData.time) {
      throw new Error('Missing required fields: phone, date, time');
    }

    // Step 1: Validate appointment date/time
    console.log('🕐 Validating appointment date/time...');
    const validationResult = await validateAppointmentDateTime(
      appointmentData.date,
      appointmentData.time
    );

    if (!validationResult.valid) {
      throw new Error(validationResult.message);
    }
    console.log('✅ Date/time validation passed');

    // Step 2: Check availability
    console.log('🔍 Checking appointment availability...');
    const availabilityResult = await checkAppointmentAvailability(
      appointmentData.date,
      appointmentData.time
    );

    if (!availabilityResult.available) {
      throw new Error(availabilityResult.message);
    }
    console.log('✅ Time slot is available');

    // Step 3: Save appointment
    console.log('💾 Saving appointment to database...');
    const result = await saveAppointment(appointmentData);

    if (result.success) {
      console.log(`✅ Appointment booked successfully! ID: ${result.appointmentId}`);
      return {
        success: true,
        appointmentId: result.appointmentId,
        message: result.message
      };
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Appointment booking failed:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
};

// Example 2: React Component for Appointment Form
export const AppointmentFormExample = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    doctor: {
      id: 'doc-1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      location: 'Main Hospital',
      image: '/doctors/sarah-johnson.jpg'
    },
    date: '',
    time: '',
    symptoms: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('doctor.')) {
      const doctorField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        doctor: { ...prev.doctor, [doctorField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Client-side validation
      if (!formData.phone || !formData.date || !formData.time) {
        throw new Error('Please fill in all required fields');
      }

      // Phone number validation
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      // Validate that date is not in the past
      const appointmentDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        throw new Error('Appointment date cannot be in the past');
      }

      // Validate that time is during working hours (9 AM - 6 PM)
      const [hours] = formData.time.split(':').map(Number);
      if (hours < 9 || hours > 18) {
        throw new Error('Appointments are available between 9 AM and 6 PM');
      }

      // Book the appointment
      const result = await bookAppointment(formData);

      if (result.success) {
        setSuccess(`Appointment booked successfully! Your appointment ID is ${result.appointmentId}`);
        // Reset form
        setFormData({
          patientName: '',
          phone: '',
          doctor: formData.doctor,
          date: '',
          time: '',
          symptoms: ''
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-form">
      <h2>Book an Appointment</h2>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patientName">Full Name *</label>
          <input
            type="text"
            id="patientName"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            placeholder="+1 (555) 123-4567"
            pattern="^[\d\s\-\+\(\)]+$"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Appointment Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Preferred Time *</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
            min="09:00"
            max="18:00"
            step="1800" // 30-minute intervals
          />
          <small>Available between 9:00 AM and 6:00 PM</small>
        </div>

        <div className="form-group">
          <label htmlFor="symptoms">Symptoms/Reason for Visit</label>
          <textarea
            id="symptoms"
            name="symptoms"
            value={formData.symptoms}
            onChange={handleInputChange}
            rows="3"
            placeholder="Please describe your symptoms or reason for the visit..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

// Example 3: Advanced Appointment Management
export class AppointmentManager {
  constructor() {
    this.appointments = [];
    this.loading = false;
  }

  // Fetch all user appointments
  async fetchAppointments() {
    this.loading = true;
    try {
      console.log('📋 Fetching user appointments...');
      this.appointments = await getUserAppointments();
      console.log(`✅ Found ${this.appointments.length} appointments`);
      return this.appointments;
    } catch (error) {
      console.error('❌ Failed to fetch appointments:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Get upcoming appointments
  getUpcomingAppointments() {
    const now = new Date();
    return this.appointments.filter(apt => {
      const appointmentDate = new Date(`${apt.date} ${apt.time}`);
      return appointmentDate > now;
    });
  }

  // Get past appointments
  getPastAppointments() {
    const now = new Date();
    return this.appointments.filter(apt => {
      const appointmentDate = new Date(`${apt.date} ${apt.time}`);
      return appointmentDate <= now;
    });
  }

  // Get appointments by status
  getAppointmentsByStatus(status) {
    return this.appointments.filter(apt => apt.status === status);
  }

  // Format appointment for display
  formatAppointment(appointment) {
    const date = new Date(appointment.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      ...appointment,
      formattedDate,
      formattedTime: this.formatTime(appointment.time),
      isUpcoming: new Date(`${appointment.date} ${appointment.time}`) > new Date()
    };
  }

  // Format time to 12-hour format
  formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${formattedHour}:${minutes} ${ampm}`;
  }
}

// Example 4: Real-time Availability Checker
export const useAppointmentAvailability = () => {
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState({
    available: false,
    message: ''
  });

  const checkAvailability = async (date, time) => {
    if (!date || !time) return;

    setChecking(true);
    try {
      const result = await checkAppointmentAvailability(date, time);
      setAvailability(result);
      return result;
    } catch (error) {
      console.error('Availability check failed:', error);
      setAvailability({
        available: false,
        message: 'Unable to check availability'
      });
    } finally {
      setChecking(false);
    }
  };

  return {
    checking,
    availability,
    checkAvailability
  };
};

// Example 5: Complete Appointment Booking Flow
export const completeBookingFlow = async () => {
  const manager = new AppointmentManager();

  try {
    // Step 1: Fetch existing appointments
    await manager.fetchAppointments();

    // Step 2: Prepare new appointment data
    const newAppointmentData = {
      patientName: 'John Doe',
      phone: '+1 (555) 123-4567',
      doctor: {
        id: 'doc-2',
        name: 'Dr. Michael Chen',
        specialty: 'Internal Medicine',
        location: 'Medical Center',
        image: '/doctors/michael-chen.jpg'
      },
      date: '2024-12-15',
      time: '14:30',
      symptoms: 'Annual checkup'
    };

    // Step 3: Book the appointment
    const bookingResult = await bookAppointment(newAppointmentData);

    if (bookingResult.success) {
      console.log('🎉 Booking completed successfully!');

      // Step 4: Refresh appointments list
      await manager.fetchAppointments();

      // Step 5: Display upcoming appointments
      const upcoming = manager.getUpcomingAppointments();
      console.log('📅 Upcoming appointments:', upcoming);

      return bookingResult;
    } else {
      throw new Error(bookingResult.message);
    }
  } catch (error) {
    console.error('❌ Complete booking flow failed:', error);
    throw error;
  }
};

// Export all examples
export default {
  bookAppointment,
  AppointmentFormExample,
  AppointmentManager,
  useAppointmentAvailability,
  completeBookingFlow
};