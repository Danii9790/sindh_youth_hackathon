# Appointment Booking System - Frontend Integration Guide

This guide explains how to use the appointment booking system from your frontend application.

## 🏗️ System Overview

The appointment booking system consists of:

1. **Database Service** (`services/dbService.ts`) - Server-side database operations
2. **API Endpoints** (`app/api/appointments/`) - REST API routes
3. **Client API** (`services/appointmentApi.ts`) - Frontend-friendly API wrappers
4. **Validation System** - Date/time validation and availability checking

## 🚀 Quick Start

### 1. Basic Appointment Booking

```javascript
import { saveAppointment } from '@/services/appointmentApi';

const appointmentData = {
  patientName: 'John Doe',
  phone: '+1 (555) 123-4567',
  doctor: {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    location: 'Main Hospital',
    image: '/doctors/sarah-johnson.jpg'
  },
  date: '2024-12-15',
  time: '14:30',
  symptoms: 'Annual checkup'
};

const result = await saveAppointment(appointmentData);
if (result.success) {
  console.log('Appointment booked!', result.appointmentId);
} else {
  console.error('Booking failed:', result.message);
}
```

### 2. Get User Appointments

```javascript
import { getUserAppointments } from '@/services/appointmentApi';

const appointments = await getUserAppointments();
console.log('Your appointments:', appointments);
```

### 3. Check Availability

```javascript
import { checkAppointmentAvailability } from '@/services/appointmentApi';

const availability = await checkAppointmentAvailability('2024-12-15', '14:30');
if (availability.available) {
  console.log('Time slot is available!');
} else {
  console.log('Time slot is taken:', availability.message);
}
```

## 📝 Required Fields

### Minimum Required Fields
- `phone` - Patient phone number
- `date` - Appointment date (YYYY-MM-DD format)
- `time` - Appointment time (HH:MM format)

### Optional Fields
- `patientName` - Patient's full name (defaults to 'Unknown Patient')
- `doctor` - Doctor information object
- `symptoms` - Reason for visit or symptoms

### Doctor Object Structure
```javascript
doctor: {
  id: 'unique-doctor-id',        // Optional
  name: 'Dr. Name',              // Required
  specialty: 'Specialty',        // Required
  location: 'Hospital/Clinic',   // Required
  image: '/path/to/image.jpg'    // Optional
}
```

## ✅ Validation Rules

### Date Validation
- Appointments must be booked for future dates
- Only Monday to Friday are allowed (weekends are blocked)
- Date format must be YYYY-MM-DD

### Time Validation
- Available hours: 9:00 AM - 6:00 PM (09:00 - 18:00)
- Time format must be HH:MM (24-hour format)
- Time slots are checked for conflicts

### Phone Number Validation
- Must contain only digits, spaces, dashes, plus signs, and parentheses
- Example valid formats:
  - `+1 (555) 123-4567`
  - `555-123-4567`
  - `5551234567`

## 🎯 API Endpoints

### POST /api/appointments
Books a new appointment.

**Request Body:**
```json
{
  "patientName": "John Doe",
  "phone": "+1 (555) 123-4567",
  "doctor": {
    "name": "Dr. Sarah Johnson",
    "specialty": "Cardiology",
    "location": "Main Hospital"
  },
  "date": "2024-12-15",
  "time": "14:30",
  "symptoms": "Annual checkup"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "APT-01",
    "userId": "user-123",
    "fullName": "John Doe",
    "phone": "+1 (555) 123-4567",
    "doctor": "Dr. Sarah Johnson",
    "date": "2024-12-15",
    "time": "14:30",
    "status": "scheduled",
    "createdAt": "2024-12-01T10:30:00.000Z"
  }
}
```

### GET /api/appointments
Retrieves user appointments.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "APT-01",
      "fullName": "John Doe",
      "phone": "+1 (555) 123-4567",
      "date": "2024-12-15",
      "time": "14:30",
      "doctor": "Dr. Sarah Johnson (Cardiology)",
      "status": "scheduled",
      "createdAt": "2024-12-01T10:30:00.000Z"
    }
  ]
}
```

### GET /api/appointments/validate?date=2024-12-15&time=14:30
Validates appointment date/time and checks availability.

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "Appointment time is valid",
    "available": true,
    "availabilityMessage": "Time slot is available",
    "date": "2024-12-15",
    "time": "14:30"
  }
}
```

## 🔄 Error Handling

The system provides comprehensive error handling with user-friendly messages:

### Common Error Types
- **Missing Fields**: "Missing required fields: phone, date, time"
- **Invalid Date**: "Cannot book appointments in the past"
- **Weekend Booking**: "Appointments are only available Monday to Friday"
- **Time Slot Taken**: "This time slot is already booked"
- **Invalid Hours**: "Appointments are available between 9 AM and 6 PM"
- **Database Error**: "Unable to connect to database. Please try again later"

### Error Response Format
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

## 🎨 React Component Example

```jsx
import React, { useState } from 'react';
import { saveAppointment, validateAppointmentDateTime } from '@/services/appointmentApi';

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    date: '',
    time: '',
    symptoms: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate date/time
      const validation = await validateAppointmentDateTime(
        formData.date,
        formData.time
      );

      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Book appointment
      const result = await saveAppointment({
        ...formData,
        doctor: {
          id: 'default-doc',
          name: 'Dr. Smith',
          specialty: 'General Practice',
          location: 'Main Clinic'
        }
      });

      if (result.success) {
        setSuccess(`Appointment booked! ID: ${result.appointmentId}`);
        // Reset form
        setFormData({
          patientName: '',
          phone: '',
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
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <input
        type="text"
        placeholder="Full Name"
        value={formData.patientName}
        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
        required
      />

      <input
        type="tel"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        required
      />

      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({...formData, date: e.target.value})}
        min={new Date().toISOString().split('T')[0]}
        required
      />

      <input
        type="time"
        value={formData.time}
        onChange={(e) => setFormData({...formData, time: e.target.value})}
        min="09:00"
        max="18:00"
        required
      />

      <textarea
        placeholder="Symptoms or reason for visit"
        value={formData.symptoms}
        onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
};

export default AppointmentForm;
```

## 🔧 Advanced Usage

### Appointment Manager Class
For complex appointment management, use the `AppointmentManager` class:

```javascript
import { AppointmentManager } from '@/examples/appointment-booking-example';

const manager = new AppointmentManager();

// Fetch all appointments
await manager.fetchAppointments();

// Get upcoming appointments
const upcoming = manager.getUpcomingAppointments();

// Get past appointments
const past = manager.getPastAppointments();

// Format appointment for display
const formatted = manager.formatAppointment(appointment);
```

### Real-time Availability Checking
```javascript
import { useAppointmentAvailability } from '@/examples/appointment-booking-example';

const AvailabilityChecker = () => {
  const { checking, availability, checkAvailability } = useAppointmentAvailability();

  const handleDateChange = (date, time) => {
    checkAvailability(date, time);
  };

  return (
    <div>
      {checking && <p>Checking availability...</p>}
      {availability.available ? (
        <p>✅ Time slot available!</p>
      ) : (
        <p>❌ {availability.message}</p>
      )}
    </div>
  );
};
```

## 🎯 Best Practices

1. **Always validate on client side first** for better UX
2. **Show loading states** during API calls
3. **Display clear error messages** to users
4. **Use proper date/time formatting** for display
5. **Implement proper error boundaries** in React
6. **Cache appointment data** when appropriate
7. **Use optimistic updates** for better perceived performance

## 🚨 Important Notes

- **Demo Mode**: The system supports demo mode for unauthenticated users
- **Rate Limiting**: API endpoints have rate limiting (10 requests/minute for POST)
- **Sequential IDs**: Appointment IDs are generated sequentially (APT-01, APT-02, etc.)
- **Database Health**: The system includes database health checks
- **Weekend Restriction**: Appointments cannot be booked on weekends

## 🛠️ Troubleshooting

### Common Issues and Solutions

1. **"Database connection failed"**
   - Check NEON_POSTGRES_URL environment variable
   - Verify database is accessible

2. **"This time slot is already booked"**
   - The slot is genuinely taken, try a different time
   - Check for duplicate submissions

3. **"Appointments are only available Monday to Friday"**
   - Weekends are blocked by design
   - Choose a weekday date

4. **"Unable to connect to the server"**
   - Check internet connection
   - Verify API endpoints are accessible

5. **"Invalid date format"**
   - Use YYYY-MM-DD format for dates
   - Use HH:MM (24-hour) format for times