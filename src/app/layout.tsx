import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CareProvider } from '@/context/CareContext';
import { MedicationAlarmModal } from '@/components/MedicationAlarmModal';
import AuthProvider from '@/components/AuthProvider';
import { AuthGate } from '@/components/AuthGate';
import { AddMedicineModal } from '@/components/AddMedicineModal';
import { NewUserOnboardingModal } from '@/components/NewUserOnboardingModal';

export const metadata: Metadata = {
  title: 'CareEcho — Real-Time Multimodal Health Companion',
  description:
    'An accessible, warm-minimalist multimodal health companion for the elderly and their caregivers with real-time voice, vision, and alerts.',
  keywords: [
    'elderly care',
    'health companion',
    'medication reminder',
    'accessibility',
    'multimodal AI',
    'caregiver alerts',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2D6A4F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FBFBFA] text-slate-900 selection:bg-sage-200 selection:text-sage-900 antialiased overflow-x-hidden">
        <AuthProvider>
          <CareProvider>
            <AuthGate>
              {children}
              <MedicationAlarmModal />
              <AddMedicineModal />
              <NewUserOnboardingModal />
            </AuthGate>
          </CareProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
