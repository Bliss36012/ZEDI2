export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export type AttendanceLocation = 'Hospital' | 'Seminar' | 'In-person';

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  notes: string;
  prescriptions: string[];
  doctor: string;
  location: AttendanceLocation;
}

export interface PatientStatistic {
  date: string;
  mood: number; // 1-10
  sleepHours: number;
  anxietyLevel: number; // 1-10
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: Gender;
  email: string;
  phone: string;
  address: string;
  medicalHistory: MedicalRecord[];
  statistics: PatientStatistic[];
  createdAt: string;
}

export interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'Consultation' | 'Therapy' | 'Follow-up' | 'Emergency';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface Reminder {
  id: string;
  patientId?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'Medication' | 'Appointment' | 'General';
  completed: boolean;
}
