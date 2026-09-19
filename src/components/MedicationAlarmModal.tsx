'use client';

import React from 'react';
import { useCare } from '@/context/CareContext';
import { Bell, Check, Clock, X, AlertTriangle, Pill, Volume2 } from 'lucide-react';
import { speakText } from '@/lib/audio';

export const MedicationAlarmModal: React.FC = () => {
  const {
    activeAlarmMedication,
    takeMedicineFromAlarm,
    snoozeAlarm,
    dismissAlarm,
    patientName,
    language,
    voiceGender,
  } = useCare();

  if (!activeAlarmMedication) return null;

  const handleReadAloud = () => {
    let alertSpoken = `Attention ${patientName.split(' ')[0]}. It is time to take your ${activeAlarmMedication.name} ${activeAlarmMedication.dosage}. Scheduled for ${activeAlarmMedication.scheduledTime}. Instructions: ${activeAlarmMedication.instructions}`;
    if (language === 'hi-IN') {
      alertSpoken = `ध्यान दें ${patientName.split(' ')[0]}। आपकी दवा ${activeAlarmMedication.name} ${activeAlarmMedication.dosage} का समय हो चुका है। निर्देश: ${activeAlarmMedication.instructions}`;
    } else if (language === 'es-ES') {
      alertSpoken = `Atención ${patientName.split(' ')[0]}. Es hora de tomar su ${activeAlarmMedication.name} ${activeAlarmMedication.dosage}. Instrucciones: ${activeAlarmMedication.instructions}`;
    }
    speakText(alertSpoken, language, voiceGender).catch(() => {});
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alarm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-red-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="w-full max-w-lg bg-[#FFFFFF] border-4 border-red-500 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center max-h-[92vh] overflow-y-auto animate-scaleUp">
        
        {/* Animated Pulsing Alarm Bell */}
        <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-red-400/40 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-red-200/60 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
            <Bell className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Alarm Banner & Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider mb-2 border border-red-300">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Medication Alarm Ringing</span>
        </div>

        <h2 id="alarm-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
          Time is Over: Take Your Medicine!
        </h2>

        <p className="text-sm sm:text-base text-slate-600 mb-5">
          {patientName.split(' ')[0]}, your scheduled dose has passed and is not yet marked as taken.
        </p>

        {/* Medicine Details Card */}
        <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {activeAlarmMedication.name}{' '}
                  <span className="text-amber-800 font-bold text-lg">
                    {activeAlarmMedication.dosage}
                  </span>
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Scheduled for {activeAlarmMedication.scheduledTime} ({activeAlarmMedication.timeOfDay})</span>
                </div>
              </div>
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={handleReadAloud}
              title="Read alarm instructions aloud"
              className="p-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-amber-800 shrink-0 min-h-tap min-w-tap flex items-center justify-center"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-amber-200/80 text-sm text-slate-700 font-medium">
            <span className="font-bold text-slate-900">Instructions:</span>{' '}
            {activeAlarmMedication.instructions}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Take Medicine Button */}
          <button
            onClick={() => takeMedicineFromAlarm(activeAlarmMedication.id)}
            className="w-full min-h-tap-lg px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-xl shadow-lg border-2 border-emerald-700 flex items-center justify-center gap-3 transform active:scale-95 transition-all"
          >
            <Check className="w-7 h-7 stroke-[3]" />
            <span>I Have Taken It (Stop Alarm)</span>
          </button>

          {/* Snooze & Dismiss Row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => snoozeAlarm(activeAlarmMedication.id, 5)}
              className="min-h-tap px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-slate-800 border border-zinc-300 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
            >
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Snooze (5 Mins)</span>
            </button>

            <button
              onClick={() => dismissAlarm(activeAlarmMedication.id)}
              className="min-h-tap px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-slate-700 border border-zinc-300 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>Silence Alarm</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
