export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export type MedicationStatus = 'taken' | 'pending' | 'missed';

export type MedicineForm = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'inhaler' | 'drops';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  form: MedicineForm;
  frequency: string;
  timeOfDay: TimeOfDay;
  scheduledTime: string; // e.g. "08:00 AM"
  instructions: string; // e.g. "1 tablet with food and water"
  status: MedicationStatus;
  takenAt?: string;
  purpose?: string;
  pillColor?: string; // Hex or color name for visual cue
}

export interface AdherenceLog {
  id: string;
  medicationId: string;
  medicationName: string;
  timestamp: string;
  action: 'TAKEN' | 'MISSED' | 'SKIPPED' | 'REMINDED';
  loggedBy: 'senior' | 'caregiver' | 'system';
}

export interface VoiceCheckIn {
  id: string;
  timestamp: string;
  query: string;
  response: string;
  sentiment?: 'good' | 'neutral' | 'needs_attention';
}

export interface CaregiverAlert {
  id: string;
  timestamp: string;
  patientName: string;
  type: 'MISSED_DOSE' | 'SOS' | 'CHECK_IN';
  message: string;
  channel: 'WHATSAPP' | 'SMS' | 'IN_APP';
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  recipientContact: string;
}

export interface PrescriptionExtractedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  time: TimeOfDay | string;
  instructions: string;
}

export interface PrescriptionScanResult {
  medicines: PrescriptionExtractedMedicine[];
  doctorName?: string;
  clinicName?: string;
  date?: string;
  notes?: string;
  isDemo?: boolean;
}

export type SupportedLanguage =
  | 'en-US'
  | 'hi-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'bn-IN'
  | 'mr-IN'
  | 'gu-IN'
  | 'kn-IN'
  | 'ml-IN'
  | 'pa-IN'
  | 'es-ES';

export type VoiceGender = 'female' | 'male';

