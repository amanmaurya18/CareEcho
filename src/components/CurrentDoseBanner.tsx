'use client';

import React, { useState } from 'react';
import { useCare } from '@/context/CareContext';
import { speakText, soundEffects } from '@/lib/audio';
import { Check, Volume2, Pill, Clock, Sparkles, AlertCircle, Droplets, Wind, Syringe, Bell } from 'lucide-react';

export const CurrentDoseBanner: React.FC = () => {
  const {
    medications,
    nextMedication,
    markAsTaken,
    language,
    patientName,
    voiceGender,
    testTriggerAlarm,
    openAddMedicine,
  } = useCare();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // If no medications are added yet (e.g. for new Google/GitHub user)
  if (medications.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-sage-50 to-emerald-50/50 border-2 border-sage-200 card-contrast rounded-3xl p-6 sm:p-8 shadow-sm text-center my-6">
        <div className="w-16 h-16 bg-sage-100 border border-sage-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sage-700 shadow-xs">
          <Pill className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Ready to Set Up Your Schedule
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
          {patientName.split(' ')[0]}, you don&apos;t have any medications scheduled yet. Click below to add your medicine, dosage, and times to start receiving automated spoken reminders.
        </p>
        <button
          onClick={() => openAddMedicine()}
          className="min-h-tap px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-bold text-base rounded-2xl shadow-md shadow-sage-600/20 inline-flex items-center gap-2.5 active:scale-95 transition-all"
        >
          <Pill className="w-5 h-5" />
          <span>+ Add Your First Medicine</span>
        </button>
      </div>
    );
  }

  // If all medications are taken
  if (!nextMedication) {
    return (
      <div className="w-full bg-sage-50 border-2 border-sage-200 card-contrast rounded-3xl p-6 sm:p-8 shadow-sm text-center my-6">
        <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-sage-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          All Medications Taken for Today!
        </h2>
        <p className="text-lg text-slate-700 max-w-xl mx-auto">
          Wonderful job, {patientName.split(' ')[0]}! You have completed all scheduled doses. Rest well and stay hydrated.
        </p>
      </div>
    );
  }

  const isTaken = nextMedication.status === 'taken';

  const parseTimeToMinutes = (timeStr: string): number | null => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const scheduledMinutes = parseTimeToMinutes(nextMedication.scheduledTime);
  const isOverdue = !isTaken && scheduledMinutes !== null && currentMinutes >= scheduledMinutes;

  const handleReadAloud = async () => {
    soundEffects.playTap();
    setIsSpeaking(true);
    let speechText = `Next medication: ${nextMedication.name}, dosage ${nextMedication.dosage}. Scheduled for ${nextMedication.scheduledTime}. Instructions: ${nextMedication.instructions}`;
    
    if (language === 'hi-IN') {
      speechText = `अगली दवा: ${nextMedication.name}, खुराक ${nextMedication.dosage}। समय: ${nextMedication.scheduledTime}। निर्देश: ${nextMedication.instructions}`;
    } else if (language === 'es-ES') {
      speechText = `Próximo medicamento: ${nextMedication.name}, dosis ${nextMedication.dosage}. Programado para las ${nextMedication.scheduledTime}. Instrucciones: ${nextMedication.instructions}`;
    }

    await speakText(speechText, language, voiceGender);
    setIsSpeaking(false);
  };

  return (
    <section aria-label="Current Dose Hero" className="w-full my-4 sm:my-6">
      <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 transition-all shadow-sm ${
        isTaken
          ? 'bg-sage-50 border-sage-300 card-contrast'
          : isOverdue
          ? 'bg-red-50/70 border-red-400 card-contrast ring-2 ring-red-300'
          : 'bg-[#FFFFFF] border-zinc-300 hover:border-sage-400 card-contrast'
      } p-4 sm:p-8`}>
        
        {/* Top meta badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 sm:mb-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full text-xs sm:text-base font-bold uppercase tracking-wider ${
              isTaken
                ? 'bg-sage-100 text-sage-800 border border-sage-300'
                : isOverdue
                ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                : 'bg-amber-pendingBg text-amber-pending border border-amber-pendingBorder'
            }`}>
              {isOverdue ? <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 shrink-0" /> : <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
              <span className="truncate">{isTaken ? 'Completed' : isOverdue ? `Time is Over (${nextMedication.scheduledTime})` : `Due at ${nextMedication.scheduledTime}`}</span>
            </span>

            {nextMedication.purpose && (
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 text-slate-700 border border-zinc-200">
                {nextMedication.purpose}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Test Alarm Ring Button */}
            {!isTaken && (
              <button
                onClick={() => testTriggerAlarm(nextMedication.id)}
                title="Test alarm ringing for this medication"
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] sm:text-xs font-bold transition-colors shadow-xs active:scale-95"
              >
                <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-bounce shrink-0" />
                <span>Test Alarm</span>
              </button>
            )}

            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              {nextMedication.timeOfDay}
            </span>
          </div>
        </div>

        {/* Big Legible Name & Dosage */}
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-sage-100 border border-sage-200 flex items-center justify-center shrink-0 mt-0.5 text-sage-700 shadow-xs">
            {nextMedication.form === 'liquid' || nextMedication.form === 'drops' ? (
              <Droplets className="w-6 h-6 sm:w-9 sm:h-9" />
            ) : nextMedication.form === 'inhaler' ? (
              <Wind className="w-6 h-6 sm:w-9 sm:h-9" />
            ) : nextMedication.form === 'injection' ? (
              <Syringe className="w-6 h-6 sm:w-9 sm:h-9" />
            ) : (
              <Pill className="w-6 h-6 sm:w-9 sm:h-9" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {nextMedication.name}{' '}
              <span className="text-sage-700 font-bold text-lg sm:text-3xl">{nextMedication.dosage}</span>
            </h2>

            <p className="text-xs sm:text-lg font-medium text-slate-700 mt-1.5 sm:mt-2 bg-zinc-50 p-2 sm:p-3 rounded-xl border border-zinc-200 leading-relaxed">
              💡 <span className="font-bold">Instructions:</span> {nextMedication.instructions}
            </p>
          </div>
        </div>

        {/* Action Buttons: Responsive for Phone & Tablet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mt-4 sm:mt-6">
          {/* Mark as Taken Button */}
          <button
            onClick={() => markAsTaken(nextMedication.id)}
            disabled={isTaken}
            aria-label={`Mark ${nextMedication.name} as taken`}
            className={`min-h-tap sm:min-h-tap-xl px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-md transform active:scale-98 ${
              isTaken
                ? 'bg-sage-200 text-sage-800 cursor-default border-2 border-sage-300'
                : 'bg-sage-600 hover:bg-sage-700 text-white border-2 border-sage-700 ring-2 ring-sage-600/30'
            }`}
          >
            <Check className="w-5 h-5 sm:w-7 sm:h-7 stroke-[3] shrink-0" />
            <span>{isTaken ? '✓ Taken Today' : 'Mark as Taken'}</span>
          </button>

          {/* Read Aloud Button */}
          <button
            onClick={handleReadAloud}
            aria-label="Read medicine details aloud"
            className={`min-h-tap sm:min-h-tap-xl px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-2xl font-bold flex items-center justify-center gap-2.5 transition-all border-2 border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-slate-900 shadow-sm transform active:scale-98 ${
              isSpeaking ? 'ring-2 ring-sage-600 animate-pulse' : ''
            }`}
          >
            <Volume2 className="w-5 h-5 sm:w-7 sm:h-7 text-slate-800 shrink-0" />
            <span>{isSpeaking ? 'Speaking...' : 'Read Aloud'}</span>
          </button>
        </div>

      </div>
    </section>
  );
};
