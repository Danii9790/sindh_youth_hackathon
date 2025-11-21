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
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  image: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  doctor: Doctor;
  date: string;
  time: string;
  symptoms: string;
}

export interface AnalysisResult {
  condition: string;
  urgency: 'Low' | 'Moderate' | 'High' | 'Emergency';
  recommendation: string;
  specialist: string;
}