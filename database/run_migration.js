import { Client } from '@neondatabase/serverless';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client(process.env.NEON_POSTGRES_URL);

async function runMigration() {
  try {
    console.log('🔌 Connecting to Neon PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('📋 Running database migration...');

    // Read the SQL migration file
    const sql = fs.readFileSync('database/create_conversations_tables.sql', 'utf8');

    // Execute the migration
    await client.query(sql);
    console.log('✅ Migration completed successfully!');

    // Verify tables were created and check for existing data
    const convResult = await client.query('SELECT COUNT(*) as count FROM conversations');
    const msgResult = await client.query('SELECT COUNT(*) as count FROM messages');

    console.log('📊 Migration Results:');
    console.log('   - Conversations table created with', convResult.rows[0].count, 'records');
    console.log('   - Messages table created with', msgResult.rows[0].count, 'records');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    if (error.message.includes('does not exist')) {
      console.log('\n💡 This might be the first time running the migration.');
      console.log('   The error might be expected if the tables don\'t exist yet.');
    } else if (error.message.includes('already exists')) {
      console.log('\n💡 Tables already exist - this is normal for re-runs.');
    }

    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
runMigration();