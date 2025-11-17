export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

export interface Schedule {
  frequency: string;
  timesOfDay: TimeOfDay[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: Schedule;
  reminderTime: string | null;
}

export interface Dose {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  timestamp: Date;
}