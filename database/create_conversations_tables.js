#!/usr/bin/env node

/**
 * Database Setup Script for Conversations and Messages
 * This script creates the conversations and messages tables in your Neon PostgreSQL database
 */

import { Client } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DB_URL = process.env.NEON_POSTGRES_URL;

async function setupConversationsDatabase() {
  const client = new Client(DB_URL);

  try {
    console.log('🔌 Connecting to Neon PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'create_conversations_tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 Creating conversations and messages tables...');

    // Split the SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue; // Skip comments
      }

      try {
        const result = await client.query(statement);

        // Only log results for SELECT statements
        if (statement.toLowerCase().trim().startsWith('select')) {
          if (result.rows.length > 0) {
            console.log('📊 Query Result:', result.rows[0]);
          }
        } else if (statement.toLowerCase().includes('create table') ||
                   statement.toLowerCase().includes('insert') ||
                   statement.toLowerCase().includes('create trigger') ||
                   statement.toLowerCase().includes('create function') ||
                   statement.toLowerCase().includes('create sequence')) {
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        }
      } catch (error) {
        // Ignore certain expected errors
        if (error.message.includes('does not exist') && statement.includes('DROP')) {
          console.log('ℹ️  Table did not exist (expected for fresh creation)');
        } else if (error.message.includes('already exists')) {
          console.log('ℹ️  Object already exists (expected for re-runs)');
        } else {
          console.error('❌ Error executing statement:', error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('\n🎉 Conversations database setup completed successfully!');

    // Verify table structure
    console.log('\n🔍 Verifying conversations table structure...');
    const conversationTableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Conversations Table Structure:');
    console.log('┌─────────────────────────┬─────────────────────┬──────────────┬─────────────────────────┐');
    console.log('│ Column Name            │ Data Type           │ Nullable     │ Default                 │');
    console.log('├─────────────────────────┼─────────────────────┼──────────────┼─────────────────────────┤');

    conversationTableInfo.rows.forEach(row => {
      const columnName = row.column_name.padEnd(23);
      const dataType = row.data_type.padEnd(19);
      const nullable = row.is_nullable.padEnd(12);
      const defaultValue = row.column_default || 'NULL';
      console.log(`│ ${columnName} │ ${dataType} │ ${nullable} │ ${defaultValue.padEnd(23)} │`);
    });

    console.log('└─────────────────────────┴─────────────────────┴──────────────┴─────────────────────────┘');

    // Verify messages table structure
    console.log('\n🔍 Verifying messages table structure...');
    const messageTableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Messages Table Structure:');
    console.log('┌─────────────────────────┬─────────────────────┬──────────────┬─────────────────────────┐');
    console.log('│ Column Name            │ Data Type           │ Nullable     │ Default                 │');
    console.log('├─────────────────────────┼─────────────────────┼──────────────┼─────────────────────────┤');

    messageTableInfo.rows.forEach(row => {
      const columnName = row.column_name.padEnd(23);
      const dataType = row.data_type.padEnd(19);
      const nullable = row.is_nullable.padEnd(12);
      const defaultValue = row.column_default || 'NULL';
      console.log(`│ ${columnName} │ ${dataType} │ ${nullable} │ ${defaultValue.padEnd(23)} │`);
    });

    console.log('└─────────────────────────┴─────────────────────┴──────────────┴─────────────────────────┘');

    // Check if sample data was inserted
    const conversationCount = await client.query('SELECT COUNT(*) as count FROM conversations');
    const messageCount = await client.query('SELECT COUNT(*) as count FROM messages');
    console.log(`\n📊 Sample records inserted:`);
    console.log(`   - Conversations: ${conversationCount.rows[0].count}`);
    console.log(`   - Messages: ${messageCount.rows[0].count}`);

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
if (import.meta.url === `file://${process.argv[1]}`) {
  setupConversationsDatabase().catch(console.error);
}

export { setupConversationsDatabase };