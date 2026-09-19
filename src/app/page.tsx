'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { CurrentDoseBanner } from '@/components/CurrentDoseBanner';
import { MedicationCard } from '@/components/MedicationCard';
import { VoiceAssistantOrb } from '@/components/VoiceAssistantOrb';
import { SosModal } from '@/components/SosModal';
import { useCare } from '@/context/CareContext';
import { TimeOfDay } from '@/lib/types';
import { Sun, CloudSun, Sunset, Moon, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SeniorCompanionPage() {
  const { medications, patientName } = useCare();
  const [isSosOpen, setIsSosOpen] = useState(false);

  // Group medications by time of day
  const timeSlots: { time: TimeOfDay; icon: React.ReactNode; label: string }[] = [
    { time: 'Morning', icon: <Sun className="w-6 h-6 text-amber-500" />, label: 'Morning Medications' },
    { time: 'Afternoon', icon: <CloudSun className="w-6 h-6 text-orange-500" />, label: 'Afternoon Medications' },
    { time: 'Evening', icon: <Sunset className="w-6 h-6 text-indigo-500" />, label: 'Evening Medications' },
    { time: 'Night', icon: <Moon className="w-6 h-6 text-blue-500" />, label: 'Bedtime & Night' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] pb-24">
      {/* Top Accessible Header */}
      <Header onOpenSos={() => setIsSosOpen(true)} />

      {/* Primary Navigation Tabs */}
      <Navigation />

      {/* Main Companion Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Reassurance Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good day, {patientName.split(' ')[0]} 👋
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Here is your daily care schedule. Tap any button to mark your medicine as taken.
            </p>
          </div>
        </div>

        {/* Hero Section: Current Next Scheduled Dose */}
        <CurrentDoseBanner />

        {/* Daily Schedule Timeline Section */}
        <div className="mt-8 space-y-8">
          <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Today&apos;s Medication Timeline
            </h2>
            <span className="text-sm font-semibold text-slate-500">
              {medications.filter((m) => m.status === 'taken').length} of {medications.length} taken
            </span>
          </div>

          {timeSlots.map(({ time, icon, label }) => {
            const slotMeds = medications.filter((m) => m.timeOfDay === time);
            if (slotMeds.length === 0) return null;

            return (
              <section key={time} aria-label={label} className="space-y-3">
                <div className="flex items-center gap-2.5 text-slate-800">
                  <div className="p-2 rounded-xl bg-zinc-100 border border-zinc-200">
                    {icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold">{label}</h3>
                </div>

                <div className="space-y-3">
                  {slotMeds.map((med) => (
                    <MedicationCard key={med.id} medication={med} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

      </main>

      {/* Pulsing Voice Assistant Floating Orb */}
      <VoiceAssistantOrb />

      {/* Emergency SOS Confirmation Modal */}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
