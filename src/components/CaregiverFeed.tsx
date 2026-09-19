'use client';

import React, { useState } from 'react';
import { useCare } from '@/context/CareContext';
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  Award,
  TrendingUp,
  Activity,
  Printer,
  Filter,
} from 'lucide-react';

export const CaregiverFeed: React.FC = () => {
  const {
    adherenceLogs,
    voiceLogs,
    alerts,
    adherenceRate,
    streakDays,
    patientName,
    medications,
  } = useCare();

  const [activeFilter, setActiveFilter] = useState<'all' | 'meds' | 'voice' | 'alerts'>('all');

  const totalMeds = medications.length;
  const takenCount = medications.filter((m) => m.status === 'taken').length;
  const pendingCount = totalMeds - takenCount;

  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Adherence Scorecard */}
      <div className="bg-[#FFFFFF] border-2 border-zinc-200 card-contrast rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Adherence Percentage Circle */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-full bg-sage-50 border-4 border-sage-500 shadow-inner shrink-0">
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-sage-800">
                  {adherenceRate}%
                </span>
                <span className="block text-[11px] font-bold uppercase text-sage-700 tracking-wider">
                  Adherence
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-amber-pending" />
                <span className="text-sm font-bold text-amber-pending uppercase tracking-wider">
                  {streakDays}-Day Perfect Streak
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {patientName}&apos;s Health Scorecard
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Based on medication logging and daily voice check-ins over the past 7 days.
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid & Print Action */}
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <div className="p-3.5 rounded-2xl bg-sage-50 border border-sage-200 text-center">
                <span className="block text-2xl font-extrabold text-sage-700">
                  {takenCount}
                </span>
                <span className="text-xs font-bold text-slate-600 uppercase">
                  Doses Taken
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-pendingBg border border-amber-pendingBorder text-center">
                <span className="block text-2xl font-extrabold text-amber-pending">
                  {pendingCount}
                </span>
                <span className="text-xs font-bold text-slate-600 uppercase">
                  Pending Today
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-100 border border-zinc-200 text-center col-span-2 sm:col-span-1">
                <span className="block text-2xl font-extrabold text-slate-800">
                  {voiceLogs.length}
                </span>
                <span className="text-xs font-bold text-slate-600 uppercase">
                  Voice Check-ins
                </span>
              </div>
            </div>

            <button
              onClick={handlePrintSchedule}
              className="min-h-tap px-4 py-2 border border-zinc-300 hover:bg-zinc-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Print or Save Schedule PDF"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Today&apos;s Regimen</span>
            </button>
          </div>

        </div>
      </div>

      {/* Real-Time Live Feed */}
      <div className="bg-[#FFFFFF] border-2 border-zinc-200 card-contrast rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-sage-600" />
            <h3 className="text-2xl font-bold text-slate-900">
              Real-Time Activity Feed
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse self-start sm:self-auto">
            Live Stream
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-slate-700'
            }`}
          >
            All Activities ({adherenceLogs.length + voiceLogs.length + alerts.length})
          </button>
          <button
            onClick={() => setActiveFilter('meds')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeFilter === 'meds'
                ? 'bg-sage-600 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-slate-700'
            }`}
          >
            Doses Taken ({adherenceLogs.length})
          </button>
          <button
            onClick={() => setActiveFilter('voice')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeFilter === 'voice'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-slate-700'
            }`}
          >
            Voice Check-ins ({voiceLogs.length})
          </button>
          <button
            onClick={() => setActiveFilter('alerts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeFilter === 'alerts'
                ? 'bg-sos-600 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-slate-700'
            }`}
          >
            Alerts ({alerts.length})
          </button>
        </div>

        <div className="space-y-4">
          {/* Recent Medication Logs */}
          {(activeFilter === 'all' || activeFilter === 'meds') &&
            adherenceLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-slate-800"
              >
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-base sm:text-lg text-slate-900">
                      Dose Taken: {log.medicationName}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Confirmed taken by {patientName} via one-tap companion interface.
                  </p>
                </div>
              </div>
            ))}

          {/* Voice Check-in Logs */}
          {(activeFilter === 'all' || activeFilter === 'voice') &&
            voiceLogs.slice(0, 3).map((v) => (
              <div
                key={v.id}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 text-slate-800"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-base text-slate-900">
                      Voice Check-in
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {v.timestamp}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-1 italic">
                    &ldquo;{v.query}&rdquo;
                  </p>
                  <p className="text-xs text-indigo-900 mt-1 bg-white/70 p-2 rounded-lg border border-indigo-100">
                    <span className="font-bold">CareEcho Response:</span> {v.response}
                  </p>
                </div>
              </div>
            ))}

          {/* Caregiver Alerts Log */}
          {(activeFilter === 'all' || activeFilter === 'alerts') &&
            alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border ${
                  alert.type === 'SOS'
                    ? 'bg-sos-50 border-sos-300 text-sos-900'
                    : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.type === 'SOS'
                      ? 'bg-sos-200 text-sos-800'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {alert.type === 'SOS' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-base">
                      {alert.channel} Alert: {alert.type}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5">{alert.message}</p>
                  <div className="text-xs font-medium text-slate-500 mt-1">
                    Recipient: {alert.recipientContact}
                  </div>
                </div>
              </div>
            ))}
        </div>

      </div>

    </div>
  );
};
