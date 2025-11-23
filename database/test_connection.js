import { Client } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DB_URL = process.env.NEON_POSTGRES_URL;

async function testConnection() {
  const client = new Client(DB_URL);

  try {
    console.log('🔌 Connecting to Neon PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Test the connection with a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('📊 Database Info:');
    console.log('   Current Time:', result.rows[0].current_time);
    console.log('   Version:', result.rows[0].version);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);

    if (error.message.includes('NEON_POSTGRES_URL')) {
      console.log('\n💡 Make sure to set NEON_POSTGRES_URL in your .env.local file');
      console.log('Example: NEON_POSTGRES_URL=postgresql://user:password@host/database');
    }

    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testConnection();