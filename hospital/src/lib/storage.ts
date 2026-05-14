import { Patient, Booking, Reminder } from '../types';

const STORAGE_KEYS = {
  PATIENTS: 'siha_angavu_patients',
  BOOKINGS: 'siha_angavu_bookings',
  REMINDERS: 'siha_angavu_reminders',
};

// Mock Data
const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Shania MORAISA',
    dob: '1995-12-10',
    gender: 'Female',
    email: 'shania.m@example.com',
    phone: '555-0201',
    address: '789 Highlands St, Arusha',
    medicalHistory: [
      {
        id: 'm1',
        date: '2024-03-10',
        diagnosis: 'Wellness Check',
        notes: 'Attended at Seminar. Shared insights on mental resilience.',
        prescriptions: [],
        doctor: 'Dr. Paschal',
        location: 'Seminar',
      },
      {
        id: 'm2',
        date: '2024-03-25',
        diagnosis: 'Stress Management',
        notes: 'Meeting at coffee shop for informal follow-up.',
        prescriptions: [],
        doctor: 'Dr. Paschal',
        location: 'In-person',
      },
      {
        id: 'm4',
        date: '2024-04-10',
        diagnosis: 'Follow-up',
        notes: 'Session at hospital. Patient showing good progress.',
        prescriptions: [],
        doctor: 'Dr. Paschal',
        location: 'Hospital',
      },
      {
        id: 'm5',
        date: '2024-04-20',
        diagnosis: 'Group Therapy',
        notes: 'Clinical group session.',
        prescriptions: [],
        doctor: 'Dr. Paschal',
        location: 'Hospital',
      }
    ],
    statistics: [
      { date: '2024-03-01', mood: 8, sleepHours: 8, anxietyLevel: 2 },
      { date: '2024-03-15', mood: 7, sleepHours: 7, anxietyLevel: 3 },
      { date: '2024-04-01', mood: 9, sleepHours: 8.5, anxietyLevel: 1 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Bariki Samwel',
    dob: '1988-04-05',
    gender: 'Male',
    email: 'bariki.s@example.com',
    phone: '555-0302',
    address: '321 Uhuru Rd, Dar es Salaam',
    medicalHistory: [
      {
        id: 'm3',
        date: '2024-04-05',
        diagnosis: 'Acute Anxiety',
        notes: 'Clinical session at hospital. Prescribed medication and rest.',
        prescriptions: ['Alprazolam 0.25mg'],
        doctor: 'Dr. Paschal',
        location: 'Hospital',
      },
      {
        id: 'm6',
        date: '2024-04-15',
        diagnosis: 'Community Mental Health',
        notes: 'Attended at Seminar for public awareness.',
        prescriptions: [],
        doctor: 'Dr. Paschal',
        location: 'Seminar',
      },
      {
        id: 'm7',
        date: '2024-04-21',
        diagnosis: 'Psychiatric Review',
        notes: 'Informal checkup at a quiet restaurant.',
        prescriptions: [],
        doctor: 'Dr. Paschal',
        location: 'In-person',
      }
    ],
    statistics: [
      { date: '2024-03-01', mood: 4, sleepHours: 5, anxietyLevel: 7 },
      { date: '2024-03-20', mood: 5, sleepHours: 6, anxietyLevel: 6 },
      { date: '2024-04-10', mood: 6, sleepHours: 7, anxietyLevel: 4 },
    ],
    createdAt: new Date().toISOString(),
  }
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    patientId: '1',
    patientName: 'Shania MORAISA',
    date: '2024-04-30',
    time: '14:30',
    type: 'Consultation',
    status: 'Scheduled',
  }
];

const MOCK_REMINDERS: Reminder[] = [
  {
    id: 'r1',
    title: 'Follow-up with Bariki',
    description: 'Check clinical progress after hospital visit',
    date: '2024-04-25',
    time: '09:00',
    type: 'Appointment',
    completed: false,
  }
];

export const storage = {
  getPatients: async (): Promise<Patient[]> => {
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      if (data && data.length > 0) return data;
      
      // Fallback to mock data if empty
      return MOCK_PATIENTS;
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      return MOCK_PATIENTS;
    }
  },
  savePatients: async (patients: Patient[]) => {
    try {
      await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patients),
      });
    } catch (error) {
      console.error("Failed to save patients:", error);
    }
  },
  
  getBookings: async (): Promise<Booking[]> => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      if (data && data.length > 0) return data;
      return MOCK_BOOKINGS;
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      return MOCK_BOOKINGS;
    }
  },
  saveBookings: async (bookings: Booking[]) => {
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookings),
      });
    } catch (error) {
      console.error("Failed to save bookings:", error);
    }
  },

  getReminders: async (): Promise<Reminder[]> => {
    try {
      const response = await fetch('/api/reminders');
      const data = await response.json();
      if (data && data.length > 0) return data;
      return MOCK_REMINDERS;
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
      return MOCK_REMINDERS;
    }
  },
  saveReminders: async (reminders: Reminder[]) => {
    try {
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminders),
      });
    } catch (error) {
      console.error("Failed to save reminders:", error);
    }
  },
  
  exportData: async () => {
    try {
      window.location.href = '/api/export';
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  },

  downloadReport: async () => {
    try {
      window.location.href = '/api/report';
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  },

  restoreData: async (data: any) => {
    try {
      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to restore data:", error);
      throw error;
    }
  },
};
