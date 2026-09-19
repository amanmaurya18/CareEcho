'use client';

import React, { useState } from 'react';
import { useCare } from '@/context/CareContext';
import {
  Send,
  MessageCircle,
  Smartphone,
  AlertOctagon,
  Settings,
  CheckCircle,
  Clock,
  Shield,
} from 'lucide-react';

export const AlertSimulator: React.FC = () => {
  const {
    caregiverName,
    caregiverPhone,
    updateCaregiverContact,
    sendAlert,
    patientName,
  } = useCare();

  const [nameInput, setNameInput] = useState(caregiverName);
  const [phoneInput, setPhoneInput] = useState(caregiverPhone);
  const [isSaved, setIsSaved] = useState(false);
  const [sendingState, setSendingState] = useState<string | null>(null);
  const [lastDispatchedMessage, setLastDispatchedMessage] = useState<{
    type: string;
    channel: 'WHATSAPP' | 'SMS';
    text: string;
    time: string;
  } | null>(null);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateCaregiverContact(nameInput, phoneInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSimulate = async (
    type: 'MISSED_DOSE' | 'SOS' | 'CHECK_IN',
    channel: 'WHATSAPP' | 'SMS'
  ) => {
    setSendingState(`${type}-${channel}`);
    let customText = '';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (type === 'MISSED_DOSE') {
      customText = `⚠️ CareEcho Alert: ${patientName} has not logged their 10:00 AM Metformin 500mg. Please check in with them.`;
    } else if (type === 'SOS') {
      customText = `🚨 EMERGENCY SOS ALERT: ${patientName} pressed the Emergency SOS button at ${nowTime}. Immediate response requested!`;
    } else {
      customText = `✅ CareEcho Morning Update: ${patientName} had breakfast and logged morning blood pressure pills on time.`;
    }

    const res = await sendAlert(type, customText, channel);

    setLastDispatchedMessage({
      type,
      channel,
      text: customText,
      time: nowTime,
    });

    setSendingState(null);
  };

  return (
    <div className="bg-[#FFFFFF] border-2 border-zinc-200 card-contrast rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-sage-600" />
            Caregiver Alert & Notification Simulator
          </h3>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Simulate real-time WhatsApp & SMS notifications sent to family members when doses are taken or missed.
          </p>
        </div>
      </div>

      {/* Config Form */}
      <form
        onSubmit={handleSaveContact}
        className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5"
      >
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base mb-3">
          <Settings className="w-5 h-5 text-slate-600" />
          <span>Configured Caregiver Contact:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Caregiver Name / Relationship
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 font-medium text-base focus:ring-2 focus:ring-sage-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Phone Number (SMS / WhatsApp)
            </label>
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 font-medium text-base focus:ring-2 focus:ring-sage-600"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {isSaved ? (
            <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Contact settings saved!
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              Notification webhooks will target this contact.
            </span>
          )}

          <button
            type="submit"
            className="min-h-tap px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm"
          >
            Update Contact
          </button>
        </div>
      </form>

      {/* Simulator Action Buttons */}
      <div className="space-y-3">
        <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">
          Trigger Instant Test Notifications:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* WhatsApp Check-in */}
          <button
            onClick={() => handleSimulate('CHECK_IN', 'WHATSAPP')}
            disabled={!!sendingState}
            className="min-h-tap p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-bold text-base flex flex-col items-start gap-1 transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>WhatsApp Daily Sync</span>
            </div>
            <span className="text-xs font-normal text-emerald-700">
              Simulate morning routine update
            </span>
          </button>

          {/* Missed Dose SMS */}
          <button
            onClick={() => handleSimulate('MISSED_DOSE', 'SMS')}
            disabled={!!sendingState}
            className="min-h-tap p-4 rounded-2xl bg-amber-pendingBg hover:bg-amber-100 border-2 border-amber-pendingBorder text-amber-900 font-bold text-base flex flex-col items-start gap-1 transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-pending" />
              <span>SMS Missed Dose</span>
            </div>
            <span className="text-xs font-normal text-amber-800">
              Simulate overdue pill alert
            </span>
          </button>

          {/* Emergency SOS */}
          <button
            onClick={() => handleSimulate('SOS', 'SMS')}
            disabled={!!sendingState}
            className="min-h-tap p-4 rounded-2xl bg-sos-50 hover:bg-sos-100 border-2 border-sos-300 text-sos-900 font-bold text-base flex flex-col items-start gap-1 transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-sos-600" />
              <span>SOS Emergency Signal</span>
            </div>
            <span className="text-xs font-normal text-sos-700">
              Simulate high-priority alert
            </span>
          </button>
        </div>
      </div>

      {/* Live Phone Screen Message Preview */}
      {lastDispatchedMessage && (
        <div className="mt-6 p-5 rounded-2xl bg-zinc-900 text-white shadow-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 pb-2 border-b border-zinc-800">
            <span className="font-semibold text-zinc-300">
              Simulated {lastDispatchedMessage.channel} Message to {nameInput}
            </span>
            <span>{lastDispatchedMessage.time}</span>
          </div>

          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              lastDispatchedMessage.channel === 'WHATSAPP'
                ? 'bg-[#005c4b] text-white'
                : 'bg-zinc-800 text-zinc-100'
            }`}
          >
            <p>{lastDispatchedMessage.text}</p>
            <div className="mt-2 text-[11px] text-zinc-300 flex justify-end items-center gap-1">
              <span>{lastDispatchedMessage.time}</span>
              <span>✓✓ Delivered</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
