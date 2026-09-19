import { Medication, AdherenceLog, VoiceCheckIn, CaregiverAlert, PrescriptionScanResult } from './types';

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Lisinopril',
    dosage: '10mg',
    form: 'tablet',
    frequency: 'Once daily',
    timeOfDay: 'Morning',
    scheduledTime: '08:00 AM',
    instructions: 'Take 1 tablet with a full glass of water.',
    status: 'taken',
    takenAt: '08:05 AM',
    purpose: 'Blood Pressure & Heart Health',
    pillColor: '#388E67',
  },
  {
    id: 'med-2',
    name: 'Metformin',
    dosage: '500mg',
    form: 'tablet',
    frequency: 'Twice daily with meals',
    timeOfDay: 'Morning',
    scheduledTime: '10:00 AM',
    instructions: 'Take 1 tablet immediately after breakfast with water.',
    status: 'pending',
    purpose: 'Blood Sugar Regulation',
    pillColor: '#2D6A4F',
  },
  {
    id: 'med-3',
    name: 'Vitamin D3 & Calcium',
    dosage: '1000 IU / 500mg',
    form: 'capsule',
    frequency: 'Once daily',
    timeOfDay: 'Afternoon',
    scheduledTime: '01:00 PM',
    instructions: 'Take 1 capsule right after lunch.',
    status: 'pending',
    purpose: 'Bone Density & Vitality',
    pillColor: '#D97706',
  },
  {
    id: 'med-4',
    name: 'Atorvastatin',
    dosage: '20mg',
    form: 'tablet',
    frequency: 'Once daily at bedtime',
    timeOfDay: 'Evening',
    scheduledTime: '08:00 PM',
    instructions: 'Take 1 tablet with or after evening meal.',
    status: 'pending',
    purpose: 'Cholesterol Management',
    pillColor: '#4F46E5',
  },
  {
    id: 'med-5',
    name: 'Melatonin',
    dosage: '3mg',
    form: 'tablet',
    frequency: 'As needed for sleep',
    timeOfDay: 'Night',
    scheduledTime: '09:30 PM',
    instructions: 'Take 1 tablet 30 minutes before turning off lights.',
    status: 'pending',
    purpose: 'Restful Sleep',
    pillColor: '#6366F1',
  },
];

export const INITIAL_LOGS: AdherenceLog[] = [
  {
    id: 'log-1',
    medicationId: 'med-1',
    medicationName: 'Lisinopril 10mg',
    timestamp: 'Today, 08:05 AM',
    action: 'TAKEN',
    loggedBy: 'senior',
  },
  {
    id: 'log-2',
    medicationId: 'med-4',
    medicationName: 'Atorvastatin 20mg',
    timestamp: 'Yesterday, 08:12 PM',
    action: 'TAKEN',
    loggedBy: 'senior',
  },
  {
    id: 'log-3',
    medicationId: 'med-3',
    medicationName: 'Vitamin D3 & Calcium',
    timestamp: 'Yesterday, 01:20 PM',
    action: 'TAKEN',
    loggedBy: 'senior',
  },
  {
    id: 'log-4',
    medicationId: 'med-2',
    medicationName: 'Metformin 500mg',
    timestamp: 'Yesterday, 10:15 AM',
    action: 'TAKEN',
    loggedBy: 'senior',
  },
];

export const INITIAL_VOICE_CHECKINS: VoiceCheckIn[] = [
  {
    id: 'v-1',
    timestamp: 'Today, 08:10 AM',
    query: 'Good morning CareEcho, I just had my porridge and toast.',
    response: 'Good morning Grandma! Wonderful to hear you had breakfast. Don\'t forget your 10:00 AM Metformin tablet with a glass of water.',
    sentiment: 'good',
  },
  {
    id: 'v-2',
    timestamp: 'Yesterday, 03:45 PM',
    query: 'What time is my heart tablet due?',
    response: 'Your Lisinopril was safely taken at 8:05 AM yesterday morning. Your next tablet is scheduled for tomorrow at 8:00 AM.',
    sentiment: 'neutral',
  },
];

export const INITIAL_ALERTS: CaregiverAlert[] = [
  {
    id: 'alert-1',
    timestamp: 'Today, 08:06 AM',
    patientName: 'Margaret Vance',
    type: 'CHECK_IN',
    message: 'Margaret confirmed taking morning Lisinopril 10mg on time.',
    channel: 'WHATSAPP',
    status: 'DELIVERED',
    recipientContact: '+1 (555) 234-8901 (Sarah Vance)',
  },
];

export const SAMPLE_PRESCRIPTION_1: PrescriptionScanResult = {
  doctorName: 'Dr. Robert Chen, MD (Cardiology)',
  clinicName: 'Metropolitan Heart & Longevity Clinic',
  date: 'September 15, 2026',
  notes: 'Patient shows stable blood pressure. Continue morning medication with food.',
  isDemo: true,
  medicines: [
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      time: 'Morning',
      instructions: 'Take 1 tablet with breakfast and evening meal with a full glass of water.',
    },
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      time: 'Morning',
      instructions: 'Take 1 tablet every morning at 8:00 AM to maintain blood pressure.',
    },
    {
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      time: 'Evening',
      instructions: 'Take 1 tablet with dinner. Avoid grapefruit juice.',
    },
  ],
};

export const SAMPLE_PRESCRIPTION_2: PrescriptionScanResult = {
  doctorName: 'Dr. Elena Rostova, MD (Geriatric Care)',
  clinicName: 'Valley Senior Wellness & Orthopedics',
  date: 'September 18, 2026',
  notes: 'Maintain hydration. Joint mobility exercises recommended 15 mins daily.',
  isDemo: true,
  medicines: [
    {
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Once daily',
      time: 'Morning',
      instructions: 'Take 1 tablet with water after waking up.',
    },
    {
      name: 'Omeprazole',
      dosage: '20mg',
      frequency: 'Once daily',
      time: 'Morning',
      instructions: 'Take 1 capsule 30 minutes before breakfast.',
    },
    {
      name: 'Calcium + Vitamin D3',
      dosage: '500mg / 1000 IU',
      frequency: 'Once daily',
      time: 'Afternoon',
      instructions: 'Take 1 tablet after lunch for optimal bone absorption.',
    },
  ],
};
