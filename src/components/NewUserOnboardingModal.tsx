'use client';

import React, { useState } from 'react';
import { useCare } from '@/context/CareContext';
import { useSession } from 'next-auth/react';
import { Heart, Sparkles, User, ShieldCheck, ArrowRight } from 'lucide-react';

interface NewUserOnboardingModalProps {
  isOpen?: boolean;
  onComplete?: () => void;
}

export const NewUserOnboardingModal: React.FC<NewUserOnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const { data: session } = useSession();
  const {
    isOnboardingOpen,
    closeOnboarding,
    setPatientName,
    patientName,
    openAddMedicine,
    updateCaregiverContact,
    caregiverPhone,
  } = useCare();

  const isModalOpen = isOpen !== undefined ? isOpen : isOnboardingOpen;
  const initialName = session?.user?.name || patientName || 'Friend';
  const [chosenRole, setChosenRole] = useState<'senior' | 'caregiver'>('senior');
  const [companionName, setCompanionName] = useState(initialName);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = companionName.trim() || initialName;
    if (chosenRole === 'caregiver') {
      updateCaregiverContact(session?.user?.name || 'Caregiver', caregiverPhone);
      setPatientName(finalName);
    } else {
      setPatientName(finalName);
    }

    // Save onboarding completion for this user
    const userIdentifier = session?.user?.email || (session?.user as any)?.id;
    if (userIdentifier) {
      const safeKey = userIdentifier.replace(/[^a-zA-Z0-9_-]/g, '_');
      try {
        localStorage.setItem(`careecho_onboarded_${safeKey}`, 'true');
        localStorage.setItem(`careecho_role_${safeKey}`, chosenRole);
      } catch {}
    }

    if (onComplete) {
      onComplete();
    } else {
      closeOnboarding();
    }
    // Open the Add Medicine interface immediately
    openAddMedicine();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn"
    >
      <div className="w-full max-w-lg bg-white border-2 border-zinc-200 card-contrast rounded-3xl p-4 sm:p-8 shadow-2xl relative text-left max-h-[90dvh] overflow-y-auto">
        
        {/* Welcome Branding */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sage-600 text-white flex items-center justify-center shadow-md shadow-sage-600/20 shrink-0">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 text-[10px] sm:text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-sage-600" />
              <span>New Account Setup</span>
            </div>
            <h2 id="onboarding-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome to CareEcho!
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 font-medium mb-4 sm:mb-5 leading-relaxed">
          Let&apos;s personalize your care companion in 1 quick step. Who will be using CareEcho?
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          
          {/* Question 1: Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Your Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Senior Option */}
              <button
                type="button"
                onClick={() => setChosenRole('senior')}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-2.5 sm:gap-3 ${
                  chosenRole === 'senior'
                    ? 'border-sage-600 bg-sage-50 text-sage-900 shadow-xs'
                    : 'border-zinc-200 text-slate-700 hover:bg-zinc-50'
                }`}
              >
                <span className="text-2xl shrink-0 mt-0.5">👵</span>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Senior Companion</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    For myself: voice reminders, large touch controls, emergency SOS
                  </p>
                </div>
              </button>

              {/* Caregiver Option */}
              <button
                type="button"
                onClick={() => setChosenRole('caregiver')}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-2.5 sm:gap-3 ${
                  chosenRole === 'caregiver'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                    : 'border-zinc-200 text-slate-700 hover:bg-zinc-50'
                }`}
              >
                <span className="text-2xl shrink-0 mt-0.5">👩‍⚕️</span>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Family Caregiver</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    For a loved one: adherence tracking, SMS alerts, prescription scan
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Question 2: Companion Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {chosenRole === 'caregiver' ? 'Senior / Patient Name' : 'Your Companion Name'}
            </label>
            <input
              type="text"
              required
              value={companionName}
              onChange={(e) => setCompanionName(e.target.value)}
              placeholder="e.g. Margaret or Mom"
              className="w-full min-h-tap px-3.5 sm:px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 text-slate-900 text-sm sm:text-base font-semibold focus:bg-white focus:ring-2 focus:ring-sage-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              CareEcho will use this name for friendly voice greetings and reminders.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-tap-lg bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs sm:text-base rounded-2xl shadow-md shadow-sage-600/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all px-4 py-3"
            >
              <span>Continue to Add Medications</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default NewUserOnboardingModal;
