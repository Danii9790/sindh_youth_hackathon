// Simulate the exact fetch request from the frontend
const fetch = require('node-fetch');

// Simulate the saveAppointment function from services/appointmentApi.ts
async function saveAppointment(appointmentData) {
  try {
    const response = await fetch('http://localhost:3003/api/appointments', {
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
      appointmentId: result.data?.id || result.appointmentId
    };
  } catch (error) {
    console.error('Error saving appointment:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Test data
const appointmentData = {
  patientName: 'John Doe',
  phone: '1234567890',
  doctor: {
    id: 'dr_sarah',
    name: 'Dr. Sarah Khan',
    specialty: 'Dermatologist',
    location: 'Clifton, Floor 2',
    image: 'https://picsum.photos/id/64/200/200'
  },
  date: '2024-12-25',
  time: '10:00AM',
  symptoms: 'Headache'
};

console.log('Testing appointment data:');
console.log(JSON.stringify(appointmentData, null, 2));

// Test the actual request
console.log('\nMaking request to localhost:3003...');
saveAppointment(appointmentData)
  .then(result => {
    console.log('Result:', result);
  })
  .catch(error => {
    console.error('Network error:', error);
  });