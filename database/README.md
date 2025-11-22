# MediAI Pro Database Setup

## Overview
This directory contains the database schema and setup scripts for the MediAI Pro application.

## Database Schema

### Appointments Table

The appointments table contains the following fields:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | SERIAL | Primary key (auto-increment) | 1, 2, 3... |
| `appointment_id` | VARCHAR(20) | Unique appointment ID | APT-01, APT-02 |
| `appointment_number` | INTEGER | Sequential appointment number | 1, 2, 3... |
| `user_id` | VARCHAR(255) | Clerk authentication user ID | user_123456... |
| `patient_name` | VARCHAR(255) | Patient's full name | "John Doe" |
| `email` | VARCHAR(255) | Patient's email address | "john@email.com" |
| `phone` | VARCHAR(20) | Patient's phone number | "03123456789" |
| `address` | TEXT | Patient's address | "123 Main Street" |
| `date` | DATE | Appointment date | "2025-11-23" |
| `time` | VARCHAR(10) | Appointment time | "10:00AM", "2:30PM" |
| `department` | VARCHAR(100) | Medical department | "general", "cardiology" |
| `doctor_name` | VARCHAR(255) | Doctor's name | "Dr. Sarah Khan" |
| `doctor_specialty` | VARCHAR(100) | Doctor's specialty | "Dermatologist" |
| `doctor_location` | VARCHAR(255) | Doctor's location/clinic | "Clifton, Floor 2" |
| `symptoms` | TEXT | Patient's symptoms | "Skin rash and itching" |
| `reason` | TEXT | Reason for visit | "Follow-up consultation" |
| `status` | VARCHAR(20) | Appointment status | "scheduled", "confirmed" |
| `created_at` | TIMESTAMP | Record creation time | Auto-generated |
| `updated_at` | TIMESTAMP | Last update time | Auto-generated |
| `booked_at` | TIMESTAMP | Booking timestamp | Auto-generated |
| `reminder_sent` | BOOLEAN | Email/SMS reminder sent | false/true |
| `notes` | TEXT | Additional notes | "Patient allergic to penicillin" |

## Setup Instructions

### Prerequisites
1. Neon PostgreSQL database
2. Database connection URL in `.env.local`

### Environment Variables
Make sure your `.env.local` file contains:
```env
NEON_POSTGRES_URL=postgresql://user:password@host/database
```

### Quick Setup

#### Method 1: Using npm scripts
```bash
# Create the appointments table
npm run db:setup

# Alternative command
npm run db:create
```

#### Method 2: Direct execution
```bash
# Run the setup script directly
node database/setup_database.js
```

#### Method 3: Manual SQL execution
```bash
# Execute SQL file directly with psql (if installed)
psql $NEON_POSTGRES_URL -f database/create_appointments_table.sql
```

### Database Features

#### Constraints
- **Primary Key**: `id` (auto-increment)
- **Unique Keys**: `appointment_id`, `appointment_number`
- **Date/Time Constraint**: Prevents double bookings for same date/time
- **Status Check**: Valid status values only

#### Indexes
- `user_id` - Fast user appointment queries
- `date` - Quick date-based filtering
- `status` - Status-based filtering
- `doctor_name` - Doctor-specific queries
- `appointment_id` - Fast appointment lookup

#### Triggers
- **Auto-update timestamp**: `updated_at` automatically updates on record changes

#### Sequences
- **Appointment numbers**: Auto-generates sequential appointment numbers

## Sample Data
The setup script creates 2 sample appointments for testing:

1. **John Doe** - Dermatology appointment with Dr. Sarah Khan
2. **Jane Smith** - Cardiology appointment with Dr. Ahmed Raza

## Verification
After setup, the script will display:
- Table structure with all columns
- Number of sample records inserted
- Success confirmation message

## Troubleshooting

### Common Issues
1. **Connection Error**: Check `NEON_POSTGRES_URL` in `.env.local`
2. **Permission Error**: Ensure database user has CREATE TABLE privileges
3. **Table Exists Error**: Normal for re-running setup (table will be dropped/recreated)

### Error Messages
- `NEON_POSTGRES_URL environment variable is not set` → Add database URL to `.env.local`
- `permission denied for relation appointments` → Check database user permissions
- `relation "appointments" does not exist` → Run setup script first

## Integration with Application

The application uses the following database services:
- `saveAppointmentToDb()` - Creates new appointments
- `getUserAppointments()` - Retrieves user's appointments
- `checkAppointmentAvailability()` - Checks time slot availability
- `validateAppointmentDateTime()` - Validates booking date/time

All database operations are handled through the `/services/dbService.ts` file.

## Schema Evolution

To modify the schema:
1. Update `create_appointments_table.sql`
2. Add migration logic if needed
3. Update TypeScript interfaces in `types.ts`
4. Test with `npm run db:setup`

## Security Notes

- Database connection uses environment variables
- SQL injection protection through parameterized queries
- No sensitive data logged in production
- User authentication handled through Clerk