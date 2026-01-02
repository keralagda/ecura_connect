
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT'
}

export type AppointmentSource = 'WEB' | 'WHATSAPP';

export interface TimeRange {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface DoctorSchedule {
  day: string;
  enabled: boolean;
  slots: TimeRange[];
}

export type StaffRole = 'NURSE' | 'RECEPTIONIST' | 'ADMIN_ASSISTANT';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  avatar: string;
}

export interface VisitRecord {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  clinicId: string;
  date: string;
  notes: string;
  diagnosis: string;
  treatment: string;
  vitals?: {
    bp: string;
    weight: string;
    temp: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  availability: string[]; // Keep for simple filtering
  schedules: DoctorSchedule[]; // New granular schedules
}

export interface Clinic {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  specialty: string;
  rating: number;
  reviews: number;
  doctors: Doctor[];
  staff: Staff[]; // New field for staff management
}

export interface Appointment {
  id: string;
  clinicId: string;
  doctorId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
  createdAt: number;
  source: AppointmentSource;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  status?: 'sent' | 'delivered' | 'read';
}
