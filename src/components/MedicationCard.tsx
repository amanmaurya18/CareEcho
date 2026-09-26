'use client';

import React, { useState } from 'react';
import { Medication } from '@/lib/types';
import { useCare } from '@/context/CareContext';
import { speakText, soundEffects } from '@/lib/audio';
import { Check, RotateCcw, Volume2, Pill, Clock, Info, Droplets, Wind, Syringe, Edit2 } from 'lucide-react';

interface MedicationCardProps {
  medication: Medication;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({ medication }) => {
  const { markAsTaken, markAsPending, language, voiceGender, openAddMedicine } = useCare();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isTaken = medication.status === 'taken';

  const handleSpeak = async () => {
    soundEffects.playTap();
    setIsSpeaking(true);
    let text = `${medication.name} ${medication.dosage}, scheduled for ${medication.scheduledTime}. ${medication.instructions}`;
    if (isTaken) {
      text += ` This was already marked as taken today.`;
    }
    await speakText(text, language, voiceGender);
    setIsSpeaking(false);
  };

  return (
    <div
      className={`rounded-2xl border-2 transition-all p-3.5 sm:p-6 card-contrast ${
        isTaken
          ? 'bg-sage-50/60 border-sage-200 opacity-95'
          : 'bg-[#FFFFFF] border-zinc-200 hover:border-zinc-300 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Medicine Info */}
        <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isTaken ? 'bg-sage-200 text-sage-800' : 'bg-zinc-100 text-slate-700'
            }`}
          >
            {medication.form === 'liquid' || medication.form === 'drops' ? (
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : medication.form === 'inhaler' ? (
              <Wind className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : medication.form === 'injection' ? (
              <Syringe className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Pill className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <h3 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {medication.name}{' '}
                <span className="text-sage-700 font-semibold text-sm sm:text-xl">
                  {medication.dosage}
                </span>
              </h3>

              {/* Status Badge */}
              <span
                className={`text-[10px] sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shrink-0 ${
                  isTaken
                    ? 'bg-sage-100 text-sage-800 border border-sage-300'
                    : 'bg-amber-pendingBg text-amber-pending border border-amber-pendingBorder'
                }`}
              >
                {isTaken ? `✓ Taken (${medication.takenAt || 'Today'})` : 'Pending'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 text-xs sm:text-base font-medium">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
                <span>{medication.scheduledTime} ({medication.timeOfDay})</span>
              </div>

              {medication.purpose && (
                <div className="flex items-center gap-1 text-slate-500 truncate">
                  <span>•</span>
                  <span className="truncate">{medication.purpose}</span>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-base text-slate-700 mt-2 bg-zinc-50 p-2 sm:p-2.5 rounded-lg border border-zinc-200 leading-relaxed">
              <span className="font-bold text-slate-900">Note:</span> {medication.instructions}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 sm:self-center shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
          {/* Edit details button */}
          <button
            onClick={() => openAddMedicine(medication)}
            aria-label={`Edit ${medication.name} details`}
            className="min-h-tap min-w-tap p-2.5 sm:p-3 rounded-xl border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-slate-700 flex items-center justify-center transition-colors shrink-0 active:scale-95"
            title="Edit medication info"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Read aloud button */}
          <button
            onClick={handleSpeak}
            aria-label={`Read aloud details for ${medication.name}`}
            className="min-h-tap min-w-tap p-2.5 sm:p-3 rounded-xl border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-slate-800 flex items-center justify-center transition-colors shrink-0 active:scale-95"
            title="Read aloud"
          >
            <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isSpeaking ? 'text-sage-600 animate-pulse' : ''}`} />
          </button>

          {/* Toggle Taken / Pending button */}
          {isTaken ? (
            <button
              onClick={() => markAsPending(medication.id)}
              aria-label={`Mark ${medication.name} as pending (undo)`}
              className="flex-1 sm:flex-initial min-h-tap px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-slate-700 font-bold text-xs sm:text-base flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Undo</span>
            </button>
          ) : (
            <button
              onClick={() => markAsTaken(medication.id)}
              aria-label={`Mark ${medication.name} as taken`}
              className="flex-1 sm:flex-initial min-h-tap px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs sm:text-base flex items-center justify-center gap-1.5 shadow-sm transition-colors active:scale-95"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Mark Taken</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
