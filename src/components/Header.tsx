'use client';

import React, { useState, useEffect } from 'react';
import { useCare } from '@/context/CareContext';
import { SupportedLanguage } from '@/lib/types';
import {
  Clock,
  Battery,
  Wifi,
  AlertTriangle,
  Eye,
  Globe,
  Heart,
} from 'lucide-react';

interface HeaderProps {
  onOpenSos: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSos }) => {
  const {
    language,
    setLanguage,
    highContrast,
    toggleHighContrast,
    caregiverName,
  } = useCare();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number>(88);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Battery API if supported
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number }> })
        .getBattery()
        .then((battery) => {
          setBatteryLevel(Math.round(battery.level * 100));
        })
        .catch(() => {});
    }

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full bg-[#FFFFFF] border-b border-zinc-200 card-contrast px-3 py-3 sm:px-6 sm:py-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        
        {/* Top Row on Mobile / Left on Desktop: Branding + Quick SOS on Mobile */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center text-sage-600 shadow-sm shrink-0">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-sage-600 text-sage-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
                  CareEcho
                </h1>
                <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-sage-100 text-sage-700 border border-sage-200">
                  Companion
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Connected to {caregiverName.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Emergency SOS Button for Mobile screens (top-right, easy reach) */}
          <button
            onClick={onOpenSos}
            aria-label="Emergency SOS button"
            className="md:hidden min-h-tap px-3.5 py-1.5 bg-sos-50 hover:bg-sos-100 text-sos-700 hover:text-sos-800 border-2 border-sos-600 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
          >
            <AlertTriangle className="w-4 h-4 text-sos-600 fill-sos-600" />
            <span>SOS</span>
          </button>
        </div>

        {/* Center: Large Reassuring Date & Time */}
        <div className="text-center w-full md:w-auto py-1 md:py-0 border-y md:border-y-0 border-zinc-100">
          <div className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-sage-600" />
            <span>{currentTime || '10:00 AM'}</span>
          </div>
          <div className="text-xs sm:text-base font-medium text-slate-600">
            {currentDate || 'Saturday, September 19'}
          </div>
        </div>

        {/* Right Controls: Contrast, Language, Desktop SOS */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end flex-wrap">
          {/* Battery & Status (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
            <Wifi className="w-4 h-4 text-emerald-600" />
            <Battery className="w-4 h-4 text-slate-700" />
            <span className="font-semibold">{batteryLevel}%</span>
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={toggleHighContrast}
            aria-label="Toggle high contrast accessibility mode"
            className={`min-h-tap px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all border ${
              highContrast
                ? 'bg-black text-white border-black ring-2 ring-yellow-400'
                : 'bg-zinc-100 hover:bg-zinc-200 text-slate-800 border-zinc-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Contrast</span>
          </button>

          {/* Language Switcher */}
          <div className="relative inline-block">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              aria-label="Select spoken and display language"
              className="min-h-tap bg-zinc-100 hover:bg-zinc-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl px-2.5 py-1.5 border border-zinc-300 cursor-pointer focus:ring-2 focus:ring-sage-600"
            >
              <option value="en-US">🇺🇸 EN</option>
              <option value="hi-IN">🇮🇳 हिंदी</option>
              <option value="es-ES">🇪🇸 ES</option>
            </select>
          </div>

          {/* Emergency SOS Button for Desktop screens */}
          <button
            onClick={onOpenSos}
            aria-label="Emergency SOS button"
            className="hidden md:flex min-h-tap min-w-tap px-4 py-2 bg-sos-50 hover:bg-sos-100 text-sos-700 hover:text-sos-800 border-2 border-sos-600 rounded-xl font-bold text-base sm:text-lg items-center gap-2 shadow-sm transition-all transform active:scale-95"
          >
            <AlertTriangle className="w-5 h-5 text-sos-600 fill-sos-600" />
            <span>SOS</span>
          </button>
        </div>

      </div>
    </header>
  );
};
