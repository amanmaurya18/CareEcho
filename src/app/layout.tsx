import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CareProvider } from '@/context/CareContext';
import { MedicationAlarmModal } from '@/components/MedicationAlarmModal';
import AuthProvider from '@/components/AuthProvider';
import { AuthGate } from '@/components/AuthGate';
import { AddMedicineModal } from '@/components/AddMedicineModal';
import { NewUserOnboardingModal } from '@/components/NewUserOnboardingModal';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

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
    'voice assistant',
    'PWA',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CareEcho',
  },
  applicationName: 'CareEcho',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#388E67',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#388E67" />
      </head>
      <body className="min-h-screen bg-[#FBFBFA] text-slate-900 selection:bg-sage-200 selection:text-sage-900 antialiased overflow-x-hidden">
        <ServiceWorkerRegister />
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
