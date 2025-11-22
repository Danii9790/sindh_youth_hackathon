#!/usr/bin/env node

/**
 * Improved Database Setup Script for MediAI Pro
 * This script properly handles multi-line SQL statements
 */

import { Client } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const DB_URL = process.env.NEON_POSTGRES_URL;

async function setupDatabase() {
  const client = new Client(DB_URL);

  try {
    console.log('🔌 Connecting to Neon PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'database/create_appointments_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 Creating appointments table...');

    // Execute the complete SQL file at once
    await client.query(sqlContent);
    console.log('✅ Database setup completed successfully!');

    // Verify table structure
    console.log('\n🔍 Verifying table structure...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'appointments'
      ORDER BY ordinal_position
    `);

    if (tableInfo.rows.length > 0) {
      console.log('\n📋 Appointments Table Structure:');
      console.log('┌─────────────────────────┬─────────────────────┬──────────────┬─────────────────────────┐');
      console.log('│ Column Name            │ Data Type           │ Nullable     │ Default                 │');
      console.log('├─────────────────────────┼─────────────────────┼──────────────┼─────────────────────────┤');

      tableInfo.rows.forEach(row => {
        const columnName = row.column_name.padEnd(23);
        const dataType = row.data_type.padEnd(19);
        const nullable = row.is_nullable.padEnd(12);
        const defaultValue = row.column_default || 'NULL';
        console.log(`│ ${columnName} │ ${dataType} │ ${nullable} │ ${defaultValue.padEnd(23)} │`);
      });

      console.log('└─────────────────────────┴─────────────────────┴──────────────┴─────────────────────────┘');

      // Check if sample data was inserted
      const sampleCount = await client.query('SELECT COUNT(*) as count FROM appointments');
      console.log(`\n📊 Sample records inserted: ${sampleCount.rows[0].count}`);

      // Show sample data
      const sampleData = await client.query('SELECT appointment_id, patient_name, email, date, time, department, doctor_name, status FROM appointments LIMIT 5');
      if (sampleData.rows.length > 0) {
        console.log('\n📋 Sample Data:');
        console.log('┌──────────────┬─────────────────┬─────────────────────────┬──────────────┬──────────┬─────────────┬─────────────────┬────────────┐');
        console.log('│ Appointment  │ Full Name       │ Email                  │ Date         │ Time     │ Department  │ Doctor          │ Status     │');
        console.log('├──────────────┼─────────────────┼─────────────────────────┼──────────────┼──────────┼─────────────┼─────────────────┼────────────┤');

        sampleData.rows.forEach(row => {
          const aptId = row.appointment_id.padEnd(12);
          const name = (row.patient_name || '').substring(0, 15).padEnd(15);
          const email = (row.email || '').substring(0, 23).padEnd(23);
          const date = row.date.toISOString().split('T')[0].padEnd(12);
          const time = row.time.padEnd(8);
          const dept = (row.department || '').substring(0, 11).padEnd(11);
          const doctor = (row.doctor_name || '').substring(0, 15).padEnd(15);
          const status = row.status.padEnd(10);
          console.log(`│ ${aptId} │ ${name} │ ${email} │ ${date} │ ${time} │ ${dept} │ ${doctor} │ ${status} │`);
        });

        console.log('└──────────────┴─────────────────┴─────────────────────────┴──────────────┴──────────┴─────────────┴─────────────────┴────────────┘');
      }
    } else {
      console.log('❌ Table not found');
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);

    if (error.message.includes('NEON_POSTGRES_URL')) {
      console.log('\n💡 Make sure to set NEON_POSTGRES_URL in your .env.local file');
      console.log('Example: NEON_POSTGRES_URL=postgresql://user:password@host/database');
    }

    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the setup
setupDatabase().catch(console.error);