// Test the exact request as it would be made by the frontend
const testData = {
  // Case 1: Normal data
  normal: {
    patientName: "John Doe",
    phone: "1234567890",
    doctor: {
      id: "dr_sarah",
      name: "Dr. Sarah Khan",
      specialty: "Dermatologist",
      location: "Clifton, Floor 2",
      image: "https://picsum.photos/id/64/200/200"
    },
    date: "2024-12-25",
    time: "10:00AM",
    symptoms: "Headache"
  },
  // Case 2: Empty patient name (potential issue)
  emptyName: {
    patientName: "",
    phone: "1234567890",
    doctor: {
      id: "dr_sarah",
      name: "Dr. Sarah Khan",
      specialty: "Dermatologist",
      location: "Clifton, Floor 2",
      image: "https://picsum.photos/id/64/200/200"
    },
    date: "2024-12-25",
    time: "10:00AM",
    symptoms: "Headache"
  },
  // Case 3: Undefined doctor (potential issue)
  undefinedDoctor: {
    patientName: "John Doe",
    phone: "1234567890",
    doctor: undefined,
    date: "2024-12-25",
    time: "10:00AM",
    symptoms: "Headache"
  }
};

Object.entries(testData).forEach(([caseName, data]) => {
  console.log(`=== ${caseName.toUpperCase()} CASE ===`);

  try {
    // Simulate JSON.stringify
    const jsonString = JSON.stringify(data);
    console.log('JSON.stringify SUCCESS');
    console.log('Length:', jsonString.length);

    // Show first 50 characters
    console.log('First 50 chars:', jsonString.substring(0, 50));

    // Show character at position 22
    if (jsonString.length > 22) {
      console.log('Char 22:', jsonString[22], `(${jsonString.charCodeAt(22)})`);
    }

    // Test JSON.parse
    const parsed = JSON.parse(jsonString);
    console.log('JSON.parse SUCCESS');

    // Simulate the exact request structure
    const requestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonString
    };

    console.log('Request configuration would be valid');

  } catch (error) {
    console.log('ERROR:', error.message);

    // Check if this matches our target error
    if (error.message.includes('position 22')) {
      console.log('*** MATCHING ERROR FOUND! ***');
    }
  }

  console.log('');
});

// Test potential edge cases that could cause JSON corruption
console.log('=== EDGE CASES ===');

const edgeCases = [
  // Very long strings that might cause truncation
  { patientName: "A".repeat(1000), phone: "123" },
  // Unicode characters
  { patientName: "👨‍⚕️ Dr. José", phone: "123" },
  // Null bytes (can cause issues)
  { patientName: "John\u0000Doe", phone: "123" },
  // Control characters
  { patientName: "John\r\n\tDoe", phone: "123" }
];

edgeCases.forEach((testCase, index) => {
  console.log(`Edge case ${index + 1}:`);
  try {
    const jsonStr = JSON.stringify(testCase);
    console.log('SUCCESS - Length:', jsonStr.length);
    if (jsonStr.length > 22) {
      console.log('Char 22:', jsonStr[22], `(${jsonStr.charCodeAt(22)})`);
    }
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.message.includes('position 22')) {
      console.log('*** MATCHING ERROR FOUND! ***');
    }
  }
});