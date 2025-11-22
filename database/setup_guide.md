# Quick Database Setup Guide

## Step 1: Get Your Neon Database URL

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign in or create an account
3. Create a new project or select existing one
4. Go to the "Connection Details" tab
5. Copy the **Connection string** (it looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

## Step 2: Add to .env.local

Open your `.env.local` file and replace the placeholder:

**Before:**
```env
NEON_POSTGRES_URL=your_neon_connection_string_here
```

**After (example):**
```env
NEON_POSTGRES_URL=postgresql://user:password@ep-abc123.us-east-2.aws.neon.tech/mediadb?sslmode=require
```

## Step 3: Run the Database Setup

Once you've added your Neon URL, run:

```bash
npm run db:setup
```

**Expected Output:**
```
🔌 Connecting to Neon PostgreSQL...
✅ Connected successfully!
📋 Creating appointments table...
✅ Executed: CREATE TABLE appointments...
📊 Query Result: { message: 'Appointments table created successfully!', sample_records_inserted: 2 }

🎉 Database setup completed successfully!

🔍 Verifying table structure...

📋 Appointments Table Structure:
┌─────────────────────────┬─────────────────────┬──────────────┬─────────────────────────┐
│ Column Name            │ Data Type           │ Nullable     │ Default                 │
├─────────────────────────┼─────────────────────┼──────────────┼─────────────────────────┤
│ id                     │ integer             │ NO           │ nextval('appointments_
...
📊 Sample records inserted: 2

🔌 Database connection closed
```

## Step 4: Test the Application

Start the development server:
```bash
npm run dev
```

Test the appointment booking functionality!

## Troubleshooting

### ❌ "NEON_POSTGRES_URL environment variable is not set"
**Solution:** Make sure you added the connection string to `.env.local` and restarted your terminal.

### ❌ "password authentication failed"
**Solution:** Check that your username and password are correct in the connection string.

### ❌ "connection timeout"
**Solution:** Check your internet connection and that the Neon project is active.

### ❌ "permission denied"
**Solution:** Make sure you're using the correct database user with proper permissions.

## Alternative: Manual Setup

If the automated script doesn't work, you can use the SQL file directly:

```bash
# Install psql if needed (PostgreSQL client)
# Then run:
psql "your_neon_connection_string_here" -f database/create_appointments_table.sql
```