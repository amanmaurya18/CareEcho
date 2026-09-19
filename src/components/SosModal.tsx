'use client';

import React, { useState } from 'react';
import { useCare } from '@/context/CareContext';
import { AlertTriangle, Phone, ShieldAlert, X, CheckCircle2 } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const { triggerSos, caregiverName, caregiverPhone, patientName } = useCare();
  const [sosSent, setSosSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleConfirmSos = async () => {
    setIsSending(true);
    await triggerSos();
    setIsSending(false);
    setSosSent(true);
  };

  const handleClose = () => {
    setSosSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sos-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#FFFFFF] border-4 border-sos-600 card-contrast rounded-3xl p-5 sm:p-8 shadow-2xl relative text-center max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close emergency modal"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-zinc-100 min-h-tap min-w-tap flex items-center justify-center"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Big Alert Icon */}
        <div className="w-20 h-20 rounded-full bg-sos-100 border-2 border-sos-300 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <AlertTriangle className="w-12 h-12 text-sos-600 fill-sos-600" />
        </div>

        {sosSent ? (
          <div>
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <CheckCircle2 className="w-8 h-8" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Help is on the Way!
              </h2>
            </div>

            <p className="text-lg text-slate-700 font-medium mb-6">
              An urgent SMS and WhatsApp notification has been broadcast to{' '}
              <span className="font-bold text-slate-900">{caregiverName}</span> at{' '}
              <span className="font-bold text-slate-900">{caregiverPhone}</span>.
            </p>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-slate-600 mb-1">Direct Call:</p>
              <a
                href={`tel:${caregiverPhone.replace(/[^\d+]/g, '')}`}
                className="min-h-tap px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                <span>Call {caregiverName.split(' ')[0]} Now</span>
              </a>
            </div>

            <button
              onClick={handleClose}
              className="min-h-tap w-full px-6 py-3 bg-zinc-200 hover:bg-zinc-300 text-slate-800 rounded-xl font-bold text-lg"
            >
              I am Safe Now (Dismiss)
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Emergency SOS Assistance
            </h2>
            <p className="text-lg text-slate-700 mb-6">
              Do you need immediate help, {patientName.split(' ')[0]}? Pressing confirm will sound an audible alarm and alert {caregiverName} instantly.
            </p>

            <div className="space-y-3">
              {/* Primary Big Red Confirm Button */}
              <button
                onClick={handleConfirmSos}
                disabled={isSending}
                className="min-h-tap-lg w-full px-6 py-4 bg-sos-600 hover:bg-sos-700 text-white rounded-2xl font-extrabold text-xl sm:text-2xl shadow-lg border-2 border-sos-700 flex items-center justify-center gap-3 transform active:scale-95"
              >
                <ShieldAlert className="w-7 h-7" />
                <span>{isSending ? 'Sending Alert...' : 'Yes, Send Emergency Alert'}</span>
              </button>

              {/* Call 911 Direct Option */}
              <a
                href="tel:911"
                className="min-h-tap w-full px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-slate-900 border border-zinc-300 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5 text-sos-600" />
                <span>Call Emergency Services (911)</span>
              </a>

              {/* Cancel Button */}
              <button
                onClick={handleClose}
                className="min-h-tap w-full px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold text-base"
              >
                Cancel / False Alarm
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
