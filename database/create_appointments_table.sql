-- =====================================================
-- MediAI Pro - Appointments Table Schema
-- Database: PostgreSQL (Neon)
-- Created: 2025-11-22
-- =====================================================

-- Drop table if it exists (for fresh creation)
DROP TABLE IF EXISTS appointments CASCADE;

-- Create appointments table with comprehensive fields
CREATE TABLE appointments (
    -- Primary Identification
    id SERIAL PRIMARY KEY,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,  -- Format: APT-01, APT-02, etc.
    appointment_number INTEGER UNIQUE NOT NULL,

    -- User Information
    user_id VARCHAR(255),                        -- Clerk User ID
    patient_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT,

    -- Appointment Details
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,                   -- Format: "10:00AM", "2:30PM"

    -- Department & Doctor Information
    department VARCHAR(100) DEFAULT 'general',
    doctor_name VARCHAR(255) NOT NULL,
    doctor_specialty VARCHAR(100),
    doctor_location VARCHAR(255),

    -- Medical Information
    symptoms TEXT,
    reason TEXT,

    -- Appointment Status & Metadata
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Additional Fields
    reminder_sent BOOLEAN DEFAULT FALSE,
    notes TEXT,

    -- Constraints and Indexes
    CONSTRAINT appointments_date_time_unique UNIQUE (date, time) -- Prevent double bookings
);

-- Create indexes for better performance
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_name);
CREATE INDEX idx_appointments_appointment_id ON appointments(appointment_id);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a sequence for appointment numbers
CREATE SEQUENCE IF NOT EXISTS appointment_number_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO MAXVALUE
    CACHE 1;

-- Insert sample data for testing (optional)
INSERT INTO appointments (
    appointment_id,
    appointment_number,
    patient_name,
    email,
    phone,
    date,
    time,
    department,
    doctor_name,
    doctor_specialty,
    doctor_location,
    symptoms,
    address,
    status
) VALUES
(
    'APT-01',
    1,
    'John Doe',
    'john.doe@email.com',
    '03123456789',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00AM',
    'general',
    'Dr. Sarah Khan',
    'Dermatologist',
    'Clifton, Floor 2',
    'Skin rash and itching',
    '123 Main Street, Karachi',
    'scheduled'
),
(
    'APT-02',
    2,
    'Jane Smith',
    'jane.smith@email.com',
    '03298765432',
    CURRENT_DATE + INTERVAL '2 days',
    '2:00PM',
    'cardiology',
    'Dr. Ahmed Raza',
    'Cardiologist',
    'DHA Phase 6, Wing A',
    'Chest pain and shortness of breath',
    '456 Park Avenue, Karachi',
    'confirmed'
);

-- Grant permissions (adjust according to your setup)
-- GRANT ALL PRIVILEGES ON appointments TO your_database_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_database_user;

-- Output success message
SELECT 'Appointments table created successfully!' as message,
       (SELECT COUNT(*) FROM appointments) as sample_records_inserted;