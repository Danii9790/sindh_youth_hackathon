# Appointments Table Fields

| Field Name | Data Type | Size | Nullable | Default | Description | Example |
|------------|-----------|------|----------|---------|-------------|---------|
| **id** | SERIAL | - | NO | Auto-increment | Primary key identifier | 1, 2, 3... |
| **appointment_id** | VARCHAR | 20 | NO | Generated | Human-readable appointment ID | APT-01, APT-02 |
| **appointment_number** | INTEGER | - | NO | Auto-increment | Sequential appointment number | 1, 2, 3... |
| **user_id** | VARCHAR | 255 | YES | NULL | Clerk authentication user ID | user_2abc3def... |
| **patient_name** | VARCHAR | 255 | NO | - | Patient's complete name | "John Doe" |
| **email** | VARCHAR | 255 | YES | NULL | Patient's email address | "john@email.com" |
| **phone** | VARCHAR | 20 | NO | - | Patient's contact number | "03123456789" |
| **address** | TEXT | - | YES | NULL | Patient's home address | "123 Main Street, Karachi" |
| **date** | DATE | - | NO | - | Appointment date | "2025-11-23" |
| **time** | VARCHAR | 10 | NO | - | Appointment time slot | "10:00AM", "2:30PM" |
| **department** | VARCHAR | 100 | NO | "general" | Medical department | "cardiology", "dermatology" |
| **doctor_name** | VARCHAR | 255 | NO | - | Doctor's full name | "Dr. Sarah Khan" |
| **doctor_specialty** | VARCHAR | 100 | YES | NULL | Doctor's medical specialty | "Dermatologist" |
| **doctor_location** | VARCHAR | 255 | YES | NULL | Clinic location | "Clifton, Floor 2" |
| **symptoms** | TEXT | - | YES | NULL | Patient's symptoms description | "Skin rash and itching" |
| **reason** | TEXT | - | YES | NULL | Reason for visit | "Follow-up consultation" |
| **status** | VARCHAR | 20 | NO | "scheduled" | Current appointment status | "scheduled", "confirmed", "completed", "cancelled", "no-show" |
| **created_at** | TIMESTAMPTZ | - | NO | CURRENT_TIMESTAMP | Record creation timestamp | "2025-11-22 10:30:00+05" |
| **updated_at** | TIMESTAMPTZ | - | NO | CURRENT_TIMESTAMP | Last update timestamp | "2025-11-22 10:30:00+05" |
| **booked_at** | TIMESTAMPTZ | - | NO | CURRENT_TIMESTAMP | Booking timestamp | "2025-11-22 10:30:00+05" |
| **reminder_sent** | BOOLEAN | - | NO | FALSE | Email/SMS reminder sent status | true, false |
| **notes** | TEXT | - | YES | NULL | Additional notes | "Patient allergic to penicillin" |

## Constraints & Indexes

### Primary Keys
- `id` - Auto-increment primary key

### Unique Constraints
- `appointment_id` - Unique appointment identifier
- `appointment_number` - Unique sequential number
- `(date, time)` - Prevents double booking for same time slot

### Foreign Keys
- `user_id` - References Clerk user authentication (soft relationship)

### Indexes for Performance
- `idx_appointments_user_id` on `user_id` - Fast user appointment queries
- `idx_appointments_date` on `date` - Quick date-based filtering
- `idx_appointments_status` on `status` - Status-based filtering
- `idx_appointments_doctor` on `doctor_name` - Doctor-specific queries
- `idx_appointments_appointment_id` on `appointment_id` - Fast appointment lookup

### Triggers
- `update_appointments_updated_at` - Automatically updates `updated_at` on record changes

### Sequences
- `appointment_number_seq` - Generates sequential appointment numbers

## Status Values
The `status` field accepts only these values:
- `scheduled` - Appointment is scheduled
- `confirmed` - Appointment is confirmed
- `completed` - Appointment has been completed
- `cancelled` - Appointment was cancelled
- `no-show` - Patient did not show up

## Department Options
Common departments include:
- `general` - General Practice
- `cardiology` - Heart specialist
- `dermatology` - Skin specialist
- `neurology` - Nerve/brain specialist
- `pediatrics` - Children's medicine
- `orthopedics` - Bone/joint specialist
- `gynecology` - Women's health
- `psychiatry` - Mental health

## Time Format
The `time` field uses 12-hour format with AM/PM:
- Format: "HH:MMAM" or "HH:MMPM"
- Examples: "10:00AM", "2:30PM", "9:00PM"
- Valid slots: 10:00AM to 9:00PM in 30-minute intervals