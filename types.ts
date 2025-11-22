export enum Sender {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  attachment?: string; // Base64 string for images
  isThinking?: boolean;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: string;
  isArchived: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  image: string;
  email?: string;
  phone?: string;
  availableDays?: string[]; // ['Monday', 'Tuesday', etc.]
  availableTimeSlots?: string[]; // ['10:00AM', '10:30AM', etc.]
  clinicId?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Appointment {
  id: string;
  userId: string;
  patientName: string;
  phone: string;
  doctor: Doctor;
  clinic: Clinic;
  date: string;
  time: string;
  symptoms: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  reminderSent?: boolean;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  startTime: string;
  endTime: string;
  slotDuration: number; // minutes
  maxPatients: number;
  isAvailable: boolean;
}

export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface AnalysisResult {
  condition: string;
  urgency: 'Low' | 'Moderate' | 'High' | 'Emergency';
  recommendation: string;
  specialist: string;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailReminders: boolean;
  smsReminders: boolean;
  language: string;
  timezone: string;
}