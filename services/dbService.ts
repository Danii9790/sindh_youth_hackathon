'use server';

import { Client } from '@neondatabase/serverless';
import { Appointment } from '../types';

// Database appointment interface
export interface DatabaseAppointment {
  id?: string;
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

const DB_URL = process.env.NEON_POSTGRES_URL;

// Enhanced validation for database URL
const validateDatabaseUrl = (): string => {
  if (!DB_URL) {
    throw new Error("NEON_POSTGRES_URL environment variable is not set");
  }

  if (DB_URL.includes('your_neon_postgres') || DB_URL.includes('placeholder')) {
    throw new Error("Database URL contains placeholder text. Please set a real Neon PostgreSQL URL.");
  }

  return DB_URL;
};

// Test database connection
const testDatabaseConnection = async (client: Client): Promise<boolean> => {
  try {
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
};

// Check appointments table structure
const checkAppointmentsTable = async (client: Client): Promise<void> => {
  try {
    // Check if table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'appointments'
      );
    `;
    const tableExistsResult = await client.query(tableExistsQuery);
    const tableExists = tableExistsResult.rows[0].exists;

    if (!tableExists) {
      throw new Error("Appointments table does not exist. Please create the table with the proper schema.");
    }
    console.log("Appointments table is ready");
  } catch (error) {
    console.error("Failed to check appointments table:", error);
    throw new Error("Failed to verify database table");
  }
};

export const saveAppointmentToDb = async (apt: Partial<Appointment> & {
  patientName?: string;
  phone?: string;
  doctor: {
    name: string;
    specialty: string;
    location: string;
  };
  date: string;
  time: string;
  symptoms?: string;
}): Promise<{success: boolean, message: string, appointmentId?: string}> => {
  let client: Client | null = null;

  try {
    // Validate database URL
    const dbUrl = validateDatabaseUrl();
    console.log("Attempting to connect to Neon PostgreSQL...");

    // Create database client
    client = new Client(dbUrl);

    // Connect to database
    await client.connect();
    console.log("Successfully connected to Neon PostgreSQL");

    // Test connection
    const isConnectionValid = await testDatabaseConnection(client);
    if (!isConnectionValid) {
      throw new Error("Database connection test failed");
    }

    // Check table structure
    await checkAppointmentsTable(client);

    // Generate sequential appointment ID
    const nextIdQuery = `SELECT MAX(CAST(SUBSTRING(appointment_id FROM 5) AS INTEGER)) as max_id FROM appointments WHERE appointment_id ~ '^APT-[0-9]+$'`;
    const nextIdResult = await client.query(nextIdQuery);
    const maxId = nextIdResult.rows[0].max_id || 0;
    const nextId = maxId + 1;
    const appointmentId = `APT-${String(nextId).padStart(2, '0')}`;

    // Check if legacy columns exist and need to be populated
    const columnsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'appointments'
      ORDER BY ordinal_position;
    `;
    const columnsResult = await client.query(columnsQuery);
    const existingColumns = columnsResult.rows.map(row => row.column_name);

    let insertQuery: string;
    let queryParams: any[];

    // Build dynamic insert query based on existing columns
    if (existingColumns.includes('doctor_name') && existingColumns.includes('doctor_specialty') && existingColumns.includes('doctor_location')) {
      // Use full schema matching the Neon database
      insertQuery = `
        INSERT INTO appointments (patient_name, phone, doctor_name, doctor_specialty, doctor_location, date, time, symptoms, appointment_id, appointment_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, appointment_id, booked_at
      `;
      queryParams = [
        apt.patientName?.trim() || 'Unknown',
        apt.phone?.trim() || 'Not provided',
        apt.doctor.name,
        apt.doctor.specialty,
        apt.doctor.location,
        apt.date,
        apt.time,
        apt.symptoms || 'General consultation',
        appointmentId,
        nextId // Use the generated sequential number
      ];
    } else {
      // Use simplified schema
      insertQuery = `
        INSERT INTO appointments (patient_name, phone, doctor, date, time, symptoms, appointment_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, appointment_id, booked_at
      `;
      queryParams = [
        apt.patientName?.trim() || 'Unknown',
        apt.phone?.trim() || 'Not provided',
        `${apt.doctor.name} (${apt.doctor.specialty})`,
        apt.date,
        apt.time,
        apt.symptoms || 'General consultation',
        appointmentId
      ];
    }

    const result = await client.query(insertQuery, queryParams);

    if (result.rows.length > 0) {
      const savedAppointment = result.rows[0];
      console.log(`✅ Appointment saved successfully! ID: ${savedAppointment.appointment_id}, DB ID: ${savedAppointment.id}`);

      return {
        success: true,
        message: "Appointment successfully saved to database",
        appointmentId: savedAppointment.appointment_id
      };
    } else {
      throw new Error("No data returned from database insert operation");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    console.error("❌ Failed to save appointment to database:", {
      error: errorMessage,
      appointment: {
        patientName: apt.patientName,
        doctor: apt.doctor.name,
        date: apt.date,
        time: apt.time
      }
    });

    // Provide specific error messages
    if (errorMessage.includes('environment variable')) {
      return {
        success: false,
        message: "Database configuration error: " + errorMessage
      };
    } else if (errorMessage.includes('connection')) {
      return {
        success: false,
        message: "Unable to connect to database. Please try again later."
      };
    } else if (errorMessage.includes('duplicate key')) {
      return {
        success: false,
        message: "This appointment slot appears to be already booked. Please choose a different time."
      };
    } else {
      return {
        success: false,
        message: "Database error: " + errorMessage
      };
    }
  } finally {
    // Always close the connection
    if (client) {
      try {
        await client.end();
        console.log("Database connection closed");
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
};

// Check if appointment slot is available
export const checkAppointmentAvailability = async (date: string, time: string): Promise<{available: boolean, message: string}> => {
  let client: Client | null = null;

  try {
    const dbUrl = validateDatabaseUrl();
    client = new Client(dbUrl);
    await client.connect();

    // Check if any appointment exists at the same date and time
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM appointments
      WHERE date = $1 AND time = $2
    `;

    const result = await client.query(checkQuery, [date, time]);
    const existingAppointments = parseInt(result.rows[0].count);

    if (existingAppointments > 0) {
      return {
        available: false,
        message: `This time slot is already booked. Please select a different date or time.`
      };
    }

    return {
      available: true,
      message: "Time slot is available"
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Appointment availability check failed:", errorMessage);

    return {
      available: false,
      message: "Unable to check appointment availability. Please try again."
    };
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error("Error closing availability check connection:", closeError);
      }
    }
  }
};

// Validate appointment date and time
export const validateAppointmentDateTime = async (date: string, time: string): Promise<{valid: boolean, message: string}> => {
  try {
    // Check if time is provided
    if (!time || time === "") {
      return {
        valid: false,
        message: "Please select an appointment time."
      };
    }

    const appointmentDate = new Date(date);
    const now = new Date();

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return {
        valid: false,
        message: "Cannot book appointments in the past. Please select a future date."
      };
    }

    // Check if it's Monday to Friday (0-4, where 0 is Sunday)
    const dayOfWeek = appointmentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        valid: false,
        message: "Appointments are only available Monday to Friday."
      };
    }

    return {
      valid: true,
      message: "Appointment time is valid"
    };

  } catch (error) {
    return {
      valid: false,
      message: "Invalid date format."
    };
  }
};

// Get user appointments
export const getUserAppointments = async (userId: string): Promise<DatabaseAppointment[]> => {
  let client: Client | null = null;

  try {
    const dbUrl = validateDatabaseUrl();
    client = new Client(dbUrl);
    await client.connect();

    // First check what columns exist in the table
    const columnsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'appointments'
      ORDER BY ordinal_position;
    `;
    const columnsResult = await client.query(columnsQuery);
    const existingColumns = columnsResult.rows.map(row => row.column_name);

    let query: string;

    // Build query based on existing columns
    if (existingColumns.includes('doctor_name') && existingColumns.includes('doctor_specialty')) {
      // Table has full schema with separate doctor columns
      query = `
        SELECT id, patient_name as "fullName", email, phone,
               date, time, department, doctor_name, doctor_specialty, doctor_location, reason, symptoms, address, status,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM appointments
        ORDER BY date DESC, time DESC
        LIMIT 10
      `;
    } else if (existingColumns.includes('doctor')) {
      // Table has simplified schema with single doctor column
      query = `
        SELECT id, patient_name as "fullName", email, phone,
               date, time, department, doctor, reason, symptoms, address, status,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM appointments
        ORDER BY date DESC, time DESC
        LIMIT 10
      `;
    } else {
      // Table has basic schema
      query = `
        SELECT id, patient_name as "fullName", phone, date, time, symptoms,
               booked_at as "createdAt"
        FROM appointments
        ORDER BY date DESC, time DESC
        LIMIT 10
      `;
    }

    const result = await client.query(query);

    // Transform results to match DatabaseAppointment interface
    return result.rows.map(row => {
      // Handle different doctor column formats
      let doctor = 'General Doctor';
      if (row.doctor_name) {
        // Format: "Dr. Name (Specialty)"
        doctor = row.doctor_name;
        if (row.doctor_specialty) {
          doctor += ` (${row.doctor_specialty})`;
        }
      } else if (row.doctor) {
        // Single doctor column
        doctor = row.doctor;
      }

      return {
        id: row.id,
        userId: userId, // Add userId since it's not in database
        fullName: row.fullName || row.patient_name || 'Unknown',
        email: row.email || '',
        phone: row.phone || '',
        date: row.date,
        time: row.time,
        department: row.department || 'general',
        doctor: doctor,
        reason: row.reason || row.symptoms || 'General consultation',
        symptoms: row.symptoms || '',
        address: row.address || '',
        status: row.status || 'scheduled',
        createdAt: row.createdAt || row.booked_at || new Date().toISOString(),
        updatedAt: row.updatedAt || row.createdAt || row.booked_at || new Date().toISOString()
      };
    });
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    return [];
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error("Error closing user appointments connection:", closeError);
      }
    }
  }
};

// New function to check database health
export const checkDatabaseHealth = async (): Promise<{healthy: boolean, message: string}> => {
  let client: Client | null = null;

  try {
    const dbUrl = validateDatabaseUrl();
    client = new Client(dbUrl);

    await client.connect();
    const result = await client.query('SELECT 1 as health_check, NOW() as server_time');

    return {
      healthy: true,
      message: "Database is healthy and connected"
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Database health check failed:", errorMessage);

    return {
      healthy: false,
      message: "Database connection failed: " + errorMessage
    };
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error("Error closing health check connection:", closeError);
      }
    }
  }
};