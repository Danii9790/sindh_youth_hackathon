// Simulate the exact data structure from handleBookingSubmit
const DOCTORS = [
  { id: 'dr_sarah', name: 'Dr. Sarah Khan', specialty: 'Dermatologist', location: 'Clifton, Floor 2', image: 'https://picsum.photos/id/64/200/200' }
];

const bookingForm = {
  name: 'John Doe',
  phone: '1234567890',
  email: 'john@example.com',
  doctor: 'dr_sarah',
  department: 'general',
  date: '2024-12-25',
  time: '10:00AM',
  symptoms: 'Headache',
  address: '123 Main St',
  reason: 'Regular checkup'
};

const user = {
  id: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumbers: [{ phoneNumber: '1234567890' }],
  primaryEmailAddress: { emailAddress: 'john@example.com' }
};

// Get selected doctor info
const doctor = DOCTORS.find(d => d.id === bookingForm.doctor);

// Create appointment data matching the dbService interface
const appointmentData = {
  patientName: bookingForm.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
  phone: bookingForm.phone || user.phoneNumbers?.[0]?.phoneNumber || '',
  doctor: {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    location: doctor.location,
    image: doctor.image
  },
  date: bookingForm.date,
  time: bookingForm.time,
  symptoms: bookingForm.symptoms || bookingForm.reason || 'General consultation'
};

console.log('Final appointment data:');
console.log(JSON.stringify(appointmentData, null, 2));

// Check for any problematic characters
const jsonStr = JSON.stringify(appointmentData);
console.log('\nJSON string length:', jsonStr.length);
console.log('Character at position 22:', jsonStr[22]);
console.log('First 30 chars:', jsonStr.substring(0, 30));

// Test the fetch request as it would be made
console.log('\n--- Simulating fetch request ---');
const requestData = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(appointmentData)
};

console.log('Request headers:', requestData.headers);
console.log('Request body:', requestData.body);

// Test parsing the JSON
try {
  const parsed = JSON.parse(requestData.body);
  console.log('\nJSON parsing successful:', parsed);
} catch (error) {
  console.error('\nJSON parsing failed:', error.message);
  console.error('At character position:', error.message.match(/position (\d+)/)?.[1]);
}