// Comprehensive test to find the exact JSON issue
const DOCTORS = [
  { id: "dr_sarah", name: "Dr. Sarah Khan", specialty: "Dermatologist", location: "Clifton, Floor 2", image: "https://picsum.photos/id/64/200/200" }
];

// Test various user data scenarios that could cause issues
const userScenarios = [
  {
    name: "Normal user",
    user: {
      id: "user123",
      firstName: "John",
      lastName: "Doe",
      phoneNumbers: [{ phoneNumber: "1234567890" }],
      primaryEmailAddress: { emailAddress: "john@example.com" }
    }
  },
  {
    name: "User with special chars",
    user: {
      id: "user123",
      firstName: "José",
      lastName: "O'Connor",
      phoneNumbers: [{ phoneNumber: "1234567890" }],
      primaryEmailAddress: { emailAddress: "john@example.com" }
    }
  },
  {
    name: "User with missing data",
    user: {
      id: "user123",
      firstName: null,
      lastName: undefined,
      phoneNumbers: [],
      primaryEmailAddress: null
    }
  },
  {
    name: "User with problematic chars",
    user: {
      id: "user123",
      firstName: 'John "test" Doe',
      lastName: "O'Connor\n\t\r",
      phoneNumbers: [{ phoneNumber: "123-456-7890" }],
      primaryEmailAddress: { emailAddress: "john+test@example.com" }
    }
  }
];

// Test various form scenarios
const formScenarios = [
  {
    name: "Normal form data",
    form: {
      name: "Jane Smith",
      phone: "9876543210",
      email: "jane@example.com",
      doctor: "dr_sarah",
      department: "dermatology",
      date: "2024-12-25",
      time: "10:00AM",
      symptoms: "Skin rash",
      address: "123 Main St, City",
      reason: "Regular checkup"
    }
  },
  {
    name: "Empty form data",
    form: {
      name: "",
      phone: "",
      email: "",
      doctor: "dr_sarah",
      department: "general",
      date: "",
      time: "",
      symptoms: "",
      address: "",
      reason: ""
    }
  },
  {
    name: "Form with special chars",
    form: {
      name: "José García",
      phone: "123-456-7890",
      email: "josé.garcía@example.com",
      doctor: "dr_sarah",
      department: "dermatología",
      date: "2024-12-25",
      time: "10:00AM",
      symptoms: "Erupción cutánea con picazón",
      address: "Calle Principal #123",
      reason: "Consulta de seguimiento"
    }
  }
];

// Test all combinations
console.log("=== COMPREHENSIVE JSON TESTING ===\n");

userScenarios.forEach((userScenario, userIndex) => {
  formScenarios.forEach((formScenario, formIndex) => {
    console.log(`--- Test ${userIndex + 1}-${formIndex + 1}: ${userScenario.name} + ${formScenario.name} ---`);

    const user = userScenario.user;
    const bookingForm = formScenario.form;

    // Get selected doctor info
    const doctor = DOCTORS.find(d => d.id === bookingForm.doctor);

    if (!doctor) {
      console.log("SKIP: Doctor not found\n");
      return;
    }

    try {
      // Create appointment data matching the exact frontend logic
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

      console.log('Appointment data created successfully');

      // Test JSON serialization
      const jsonString = JSON.stringify(appointmentData);
      console.log('JSON.stringify SUCCESS - Length:', jsonString.length);

      // Check character at position 22
      if (jsonString.length > 22) {
        const char22 = jsonString[22];
        const charCode22 = jsonString.charCodeAt(22);
        console.log('Character 22:', char22, `(${charCode22})`);

        // Check for problematic characters
        if (charCode22 < 32 && charCode22 !== 9 && charCode22 !== 10 && charCode22 !== 13) {
          console.log('*** WARNING: Problematic control character at position 22! ***');
        }
      }

      // Test JSON parsing
      const parsed = JSON.parse(jsonString);
      console.log('JSON.parse SUCCESS');

      // Show first 50 characters of the JSON
      console.log('JSON preview:', jsonString.substring(0, 50) + '...');

    } catch (error) {
      console.log('ERROR:', error.message);

      if (error.message.includes('position 22')) {
        console.log('*** FOUND THE EXACT ERROR! ***');
        console.log('This combination causes the JSON parsing error at position 22');

        // Show what was being serialized
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

        console.log('Problematic data:', JSON.stringify(appointmentData, null, 2));
      }
    }

    console.log('');
  });
});

// Test some specific problematic characters that could cause position 22 issues
console.log("=== TESTING SPECIFIC PROBLEMATIC CHARACTERS ===");

const problematicChars = [
  '\0',   // Null byte
  '\u0001', // Start of heading
  '\b',   // Backspace
  '\f',   // Form feed
  '\n',   // Newline
  '\r',   // Carriage return
  '\t',   // Tab
  '\v',   // Vertical tab
  '\x0B', // Vertical tab alternative
];

problematicChars.forEach((char, index) => {
  console.log(`Testing char ${index}: ${JSON.stringify(char)} (code: ${char.charCodeAt(0)})`);

  const testData = {
    patientName: `John${char}Doe`,
    phone: "1234567890",
    doctor: {
      id: "dr_sarah",
      name: "Dr. Sarah Khan"
    },
    date: "2024-12-25",
    time: "10:00AM"
  };

  try {
    const jsonStr = JSON.stringify(testData);
    const parsed = JSON.parse(jsonStr);
    console.log('SUCCESS');

    if (jsonStr.length > 22) {
      console.log('Char 22:', jsonStr[22], `(${jsonStr.charCodeAt(22)})`);
    }
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.message.includes('position 22')) {
      console.log('*** FOUND MATCHING ERROR! ***');
    }
  }
  console.log('');
});