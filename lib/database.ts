import { Pool } from '@neondatabase/serverless';
import { Appointment, DatabaseAppointment } from '../types';

// Database connection pool
let pool: Pool | null = null;

// Initialize database connection pool
const getDatabasePool = (): Pool => {
  if (!pool) {
    const DB_URL = process.env.NEON_POSTGRES_URL;

    if (!DB_URL) {
      throw new Error("NEON_POSTGRES_URL environment variable is not set");
    }

    if (DB_URL.includes('your_neon_postgres') || DB_URL.includes('placeholder')) {
      throw new Error("Database URL contains placeholder text. Please set a real Neon PostgreSQL URL.");
    }

    pool = new Pool({
      connectionString: DB_URL,
      max: 10, // Maximum number of connections
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Timeout after 10s
    });
  }

  return pool;
};

// Enhanced database connection with retry logic
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${waitTime}ms:`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};

// Check appointments table structure with caching
let tableStructureCache: any = null;
let tableStructureCacheTime = 0;
const TABLE_STRUCTURE_CACHE_TTL = 60000; // 1 minute

const checkAppointmentsTableStructure = async (): Promise<any> => {
  const now = Date.now();

  // Return cached structure if still valid
  if (tableStructureCache && (now - tableStructureCacheTime) < TABLE_STRUCTURE_CACHE_TTL) {
    return tableStructureCache;
  }

  const pool = getDatabasePool();

  try {
    const client = await pool.connect();

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

      // Get column information
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        ORDER BY ordinal_position;
      `;
      const columnsResult = await client.query(columnsQuery);

      const structure = {
        exists: true,
        columns: columnsResult.rows,
        hasFullSchema: columnsResult.rows.some(row => row.column_name === 'doctor_name')
      };

      // Cache the structure
      tableStructureCache = structure;
      tableStructureCacheTime = now;

      return structure;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to check appointments table structure:", error);
    throw new Error("Failed to verify database table structure");
  }
};

// Optimized appointment saving function
export const saveAppointmentToDbOptimized = async (apt: {
  patientName?: string;
  phone?: string;
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
}): Promise<{success: boolean, message: string, appointmentId?: string}> => {
  return executeWithRetry(async () => {
    const pool = getDatabasePool();
    const client = await pool.connect();

    try {
      // Check table structure (cached)
      const tableStructure = await checkAppointmentsTableStructure();

      // Generate sequential appointment ID
      const nextIdQuery = `SELECT MAX(CAST(SUBSTRING(appointment_id FROM 5) AS INTEGER)) as max_id FROM appointments WHERE appointment_id ~ '^APT-[0-9]+$'`;
      const nextIdResult = await client.query(nextIdQuery);
      const maxId = nextIdResult.rows[0].max_id || 0;
      const nextId = maxId + 1;
      const appointmentId = `APT-${String(nextId).padStart(2, '0')}`;

      let insertQuery: string;
      let queryParams: any[];

      // Build dynamic insert query based on existing columns
      if (tableStructure.hasFullSchema) {
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
          nextId
        ];
      } else {
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

    } finally {
      client.release();
    }
  });
};

// Database health check
export const checkDatabaseHealth = async (): Promise<{healthy: boolean, message: string, details?: any}> => {
  try {
    const pool = getDatabasePool();
    const client = await pool.connect();

    try {
      const result = await client.query('SELECT 1 as health_check, NOW() as server_time');
      const structure = await checkAppointmentsTableStructure();

      return {
        healthy: true,
        message: "Database is healthy and connected",
        details: {
          serverTime: result.rows[0].server_time,
          tableStructure: structure
        }
      };
    } finally {
      client.release();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Database health check failed:", errorMessage);

    return {
      healthy: false,
      message: "Database connection failed: " + errorMessage
    };
  }
};

// Cleanup function for graceful shutdown
export const closeDatabaseConnections = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

// Handle process termination
process.on('SIGTERM', closeDatabaseConnections);
process.on('SIGINT', closeDatabaseConnections);