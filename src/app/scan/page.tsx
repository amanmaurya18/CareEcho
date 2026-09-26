'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { PrescriptionUploader } from '@/components/PrescriptionUploader';
import { VoiceAssistantOrb } from '@/components/VoiceAssistantOrb';
import { SosModal } from '@/components/SosModal';

export default function PrescriptionScanPage() {
  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] pb-24">
      {/* Accessible Header */}
      <Header onOpenSos={() => setIsSosOpen(true)} />

      {/* Primary Navigation Tabs */}
      <Navigation />

      {/* Main Prescription Scanner Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <PrescriptionUploader />
      </main>

      {/* Voice Assistant Orb */}
      <VoiceAssistantOrb />

      {/* SOS Modal */}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
