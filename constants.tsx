
import { Clinic, AppointmentStatus, Appointment, DoctorSchedule, VisitRecord, Staff } from './types';

const DEFAULT_SCHEDULES: DoctorSchedule[] = [
  { day: 'Monday', enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
  { day: 'Tuesday', enabled: true, slots: [{ start: '10:00', end: '15:00' }] },
  { day: 'Wednesday', enabled: true, slots: [{ start: '09:00', end: '13:00' }] },
  { day: 'Thursday', enabled: false, slots: [] },
  { day: 'Friday', enabled: true, slots: [{ start: '09:00', end: '12:00' }] },
  { day: 'Saturday', enabled: false, slots: [] },
  { day: 'Sunday', enabled: false, slots: [] },
];

const MOCK_STAFF: Staff[] = [
  { id: 's1', name: 'Nurse Joy', role: 'NURSE', email: 'joy@evergreen.com', phone: '+123445566', avatar: 'https://i.pravatar.cc/150?u=s1' },
  { id: 's2', name: 'Alice Receptionist', role: 'RECEPTIONIST', email: 'alice@evergreen.com', phone: '+123445577', avatar: 'https://i.pravatar.cc/150?u=s2' }
];

export const MOCK_CLINICS: Clinic[] = [
  {
    id: 'c1',
    name: 'Evergreen Family Clinic',
    description: 'Specializing in comprehensive family care, wellness programs, and preventive medicine for all ages.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    location: '123 Pine St, Seattle',
    specialty: 'Family Medicine',
    rating: 4.8,
    reviews: 124,
    doctors: [
      { id: 'd1', name: 'Dr. Sarah Smith', specialty: 'General Practitioner', avatar: 'https://i.pravatar.cc/150?u=d1', availability: ['Mon', 'Tue', 'Wed'], schedules: DEFAULT_SCHEDULES },
      { id: 'd2', name: 'Dr. James Wilson', specialty: 'Pediatrician', avatar: 'https://i.pravatar.cc/150?u=d2', availability: ['Wed', 'Thu', 'Fri'], schedules: DEFAULT_SCHEDULES }
    ],
    staff: MOCK_STAFF
  },
  {
    id: 'c2',
    name: 'City Heart Specialists',
    description: 'Leading cardiac care with state-of-the-art diagnostic equipment and world-class specialists.',
    image: 'https://images.unsplash.com/photo-1504813184591-01592fd03cfd?auto=format&fit=crop&q=80&w=800',
    location: '456 Cardiac Ave, New York',
    specialty: 'Cardiology',
    rating: 4.9,
    reviews: 89,
    doctors: [
      { id: 'd3', name: 'Dr. Elena Rossi', specialty: 'Cardiologist', avatar: 'https://i.pravatar.cc/150?u=d3', availability: ['Mon', 'Wed', 'Fri'], schedules: DEFAULT_SCHEDULES },
      { id: 'd4', name: 'Dr. Mark Thompson', specialty: 'Cardiac Surgeon', avatar: 'https://i.pravatar.cc/150?u=d4', availability: ['Tue', 'Thu'], schedules: DEFAULT_SCHEDULES }
    ],
    staff: []
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    clinicId: 'c1',
    doctorId: 'd1',
    patientName: 'John Doe',
    patientPhone: '+1234567890',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    status: AppointmentStatus.CONFIRMED,
    reason: 'Annual Physical',
    createdAt: Date.now() - 86400000,
    source: 'WEB'
  },
  {
    id: 'a2',
    clinicId: 'c2',
    doctorId: 'd3',
    patientName: 'Jane Smith',
    patientPhone: '+1987654321',
    date: new Date().toISOString().split('T')[0],
    time: '02:30 PM',
    status: AppointmentStatus.PENDING,
    reason: 'Chest pain followup',
    createdAt: Date.now() - 43200000,
    source: 'WHATSAPP'
  }
];

export const INITIAL_VISITS: VisitRecord[] = [
  {
    id: 'v1',
    appointmentId: 'a1',
    patientName: 'John Doe',
    patientPhone: '+1234567890',
    doctorId: 'd1',
    clinicId: 'c1',
    date: '2023-11-15',
    diagnosis: 'Mild hypertension',
    notes: 'Patient feels better, BP slightly elevated.',
    treatment: 'Reduce sodium intake, review in 2 weeks.',
    vitals: { bp: '135/85', weight: '82kg', temp: '36.6C' }
  }
];
