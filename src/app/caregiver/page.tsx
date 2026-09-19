'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { CaregiverFeed } from '@/components/CaregiverFeed';
import { AlertSimulator } from '@/components/AlertSimulator';
import { MedicineManagerModal } from '@/components/MedicineManagerModal';
import { VoiceAssistantOrb } from '@/components/VoiceAssistantOrb';
import { SosModal } from '@/components/SosModal';
import { useCare } from '@/context/CareContext';
import { ShieldCheck, Heart, Users } from 'lucide-react';

export default function CaregiverPortalPage() {
  const { caregiverName, patientName } = useCare();
  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] pb-24">
      {/* Accessible Header */}
      <Header onOpenSos={() => setIsSosOpen(true)} />

      {/* Primary Navigation */}
      <Navigation />

      {/* Main Caregiver Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Welcome Caregiver Header */}
        <div className="bg-[#FFFFFF] border-2 border-zinc-200 card-contrast rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-sage-100 border border-sage-200 flex items-center justify-center text-sage-700 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Caregiver Monitoring Portal
                </h1>
              </div>
              <p className="text-sm sm:text-base text-slate-600 font-medium mt-0.5">
                Monitoring <span className="font-bold text-slate-900">{patientName}</span> • Logged in as <span className="font-bold text-slate-900">{caregiverName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 1. Daily Adherence Scorecard & Live Feed */}
        <CaregiverFeed />

        {/* 2. Emergency & Missed Dose Alert Simulator */}
        <AlertSimulator />

        {/* 3. Recurring Medicine Manager */}
        <MedicineManagerModal />

      </main>

      {/* Voice Assistant Orb */}
      <VoiceAssistantOrb />

      {/* Emergency SOS Confirmation Modal */}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
