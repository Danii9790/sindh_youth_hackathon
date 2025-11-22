import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

console.log('🔍 Testing database configuration...');
console.log('NEON_POSTGRES_URL:', process.env.NEON_POSTGRES_URL ? '✅ Set' : '❌ Not set');

if (process.env.NEON_POSTGRES_URL) {
  // Mask the password for security
  const masked = process.env.NEON_POSTGRES_URL.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log('Database URL format:', masked);
} else {
  console.log('\n💡 To set up the database:');
  console.log('1. Go to your Neon dashboard');
  console.log('2. Copy the connection string');
  console.log('3. Add it to your .env.local file:');
  console.log('   NEON_POSTGRES_URL=postgresql://user:password@host/database');
}