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
import { Sun, CloudSun, Sunset, Moon, Heart, Sparkles, CheckCircle2, Pencil, Check, Plus, Pill } from 'lucide-react';

export default function SeniorCompanionPage() {
  const { medications, patientName, setPatientName, openAddMedicine } = useCare();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(patientName);

  // Group medications by time of day
  const timeSlots: { time: TimeOfDay; icon: React.ReactNode; label: string }[] = [
    { time: 'Morning', icon: <Sun className="w-6 h-6 text-amber-500" />, label: 'Morning Medications' },
    { time: 'Afternoon', icon: <CloudSun className="w-6 h-6 text-orange-500" />, label: 'Afternoon Medications' },
    { time: 'Evening', icon: <Sunset className="w-6 h-6 text-indigo-500" />, label: 'Evening Medications' },
    { time: 'Night', icon: <Moon className="w-6 h-6 text-blue-500" />, label: 'Bedtime & Night' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] pb-28 sm:pb-24">
      {/* Top Accessible Header */}
      <Header onOpenSos={() => setIsSosOpen(true)} />

      {/* Primary Navigation Tabs */}
      <Navigation />

      {/* Main Companion Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6">

        {/* Welcome Reassurance Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-xl sm:text-3xl font-extrabold text-slate-900 border-b-2 border-sage-600 bg-white px-2 py-0.5 rounded-lg focus:outline-hidden ring-2 ring-sage-300"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setPatientName(tempName);
                        setIsEditingName(false);
                      } else if (e.key === 'Escape') {
                        setIsEditingName(false);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      setPatientName(tempName);
                      setIsEditingName(false);
                    }}
                    aria-label="Save name"
                    className="px-3 py-1.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Good day, {patientName.split(' ')[0]} 👋
                  </h1>
                  <button
                    onClick={() => {
                      setTempName(patientName);
                      setIsEditingName(true);
                    }}
                    title="Change companion name"
                    aria-label="Edit companion name"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-zinc-200/60 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-base text-slate-600 font-medium mt-0.5">
              Here is your daily care schedule. Tap any button to mark your medicine as taken.
            </p>
          </div>
        </div>

        {/* Hero Section: Current Next Scheduled Dose */}
        <CurrentDoseBanner />

        {/* Daily Schedule Timeline Section */}
        <div className="mt-5 sm:mt-8 space-y-6 sm:space-y-8">
          <div className="border-b border-zinc-200 pb-3 flex items-center justify-between gap-2.5">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                Today&apos;s Medication Timeline
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-slate-500">
                {medications.filter((m) => m.status === 'taken').length} of {medications.length} taken
              </span>
            </div>

            <button
              onClick={() => openAddMedicine()}
              className="min-h-tap px-3 sm:px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Medication</span>
              <span className="sm:hidden">Add Med</span>
            </button>
          </div>

          {/* If no medications exist yet */}
          {medications.length === 0 && (
            <div className="p-5 sm:p-8 text-center bg-white border-2 border-dashed border-zinc-300 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-sage-50 text-sage-600 rounded-2xl flex items-center justify-center mx-auto border border-sage-200">
                <Pill className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">No Medications Scheduled Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Add your morning, afternoon, or bedtime medicines to enable spoken voice reminders and dosage tracking.
                </p>
              </div>
              <button
                onClick={() => openAddMedicine()}
                className="min-h-tap px-4 sm:px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Your First Medicine</span>
              </button>
            </div>
          )}

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
