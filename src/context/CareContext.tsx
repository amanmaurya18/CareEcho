'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Medication,
  AdherenceLog,
  VoiceCheckIn,
  CaregiverAlert,
  SupportedLanguage,
  PrescriptionExtractedMedicine,
  TimeOfDay,
  VoiceGender,
} from '@/lib/types';
import {
  INITIAL_MEDICATIONS,
  INITIAL_LOGS,
  INITIAL_VOICE_CHECKINS,
  INITIAL_ALERTS,
} from '@/lib/mockData';
import { soundEffects, speakText } from '@/lib/audio';

interface CareContextType {
  medications: Medication[];
  adherenceLogs: AdherenceLog[];
  voiceLogs: VoiceCheckIn[];
  alerts: CaregiverAlert[];
  language: SupportedLanguage;
  highContrast: boolean;
  caregiverName: string;
  caregiverPhone: string;
  patientName: string;
  isSosActive: boolean;
  nextMedication: Medication | null;
  adherenceRate: number;
  streakDays: number;
  // Voice Settings
  voiceGender: VoiceGender;
  // Alarm State & Actions
  activeAlarmMedication: Medication | null;
  triggerAlarm: (med: Medication) => void;
  stopAlarm: () => void;
  snoozeAlarm: (medId: string, minutes?: number) => void;
  dismissAlarm: (medId: string) => void;
  testTriggerAlarm: (medId?: string) => void;
  takeMedicineFromAlarm: (medId: string) => void;
  // Actions
  setVoiceGender: (gender: VoiceGender) => void;
  markAsTaken: (id: string) => void;
  markAsPending: (id: string) => void;
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (med: Medication) => void;
  deleteMedication: (id: string) => void;
  addPrescriptionMedicines: (meds: PrescriptionExtractedMedicine[]) => void;
  addVoiceCheckIn: (query: string, response: string, sentiment?: 'good' | 'neutral' | 'needs_attention') => void;
  triggerSos: () => Promise<void>;
  dismissSos: () => void;
  sendAlert: (
    type: 'MISSED_DOSE' | 'SOS' | 'CHECK_IN',
    customMessage?: string,
    channel?: 'WHATSAPP' | 'SMS'
  ) => Promise<{ success: boolean; message: string }>;
  toggleHighContrast: () => void;
  setLanguage: (lang: SupportedLanguage) => void;
  updateCaregiverContact: (name: string, phone: string) => void;
  resetToDefaults: () => void;
}

const CareContext = createContext<CareContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MEDS: 'careecho_medications_v1',
  LOGS: 'careecho_logs_v1',
  VOICE: 'careecho_voice_v1',
  ALERTS: 'careecho_alerts_v1',
  SETTINGS: 'careecho_settings_v1',
};

export const CareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [adherenceLogs, setAdherenceLogs] = useState<AdherenceLog[]>(INITIAL_LOGS);
  const [voiceLogs, setVoiceLogs] = useState<VoiceCheckIn[]>(INITIAL_VOICE_CHECKINS);
  const [alerts, setAlerts] = useState<CaregiverAlert[]>(INITIAL_ALERTS);
  const [language, setLanguageState] = useState<SupportedLanguage>('en-US');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [caregiverName, setCaregiverName] = useState<string>('Sarah Vance (Daughter)');
  const [caregiverPhone, setCaregiverPhone] = useState<string>('+1 (555) 234-8901');
  const [patientName] = useState<string>('Margaret Vance');
  const [isSosActive, setIsSosActive] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  // Voice Settings State
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');

  // Alarm State
  const [activeAlarmMedication, setActiveAlarmMedication] = useState<Medication | null>(null);
  const [snoozedMeds, setSnoozedMeds] = useState<Record<string, number>>({});
  const [dismissedMeds, setDismissedMeds] = useState<Record<string, boolean>>({});

  // Helper to parse time string like "10:00 AM" into minutes from midnight
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

  // Trigger continuous alarm for an overdue / pending medication
  const triggerAlarm = (med: Medication) => {
    setActiveAlarmMedication(med);
    soundEffects.startAlarm();

    let spoken = `Attention ${patientName.split(' ')[0]}. It is time to take your ${med.name} ${med.dosage}. Please take your medicine now with water.`;
    if (language === 'hi-IN') {
      spoken = `ध्यान दें ${patientName.split(' ')[0]}। आपकी दवा ${med.name} ${med.dosage} का समय हो चुका है। कृपया अपनी दवा पानी के साथ लें।`;
    } else if (language === 'es-ES') {
      spoken = `Atención ${patientName.split(' ')[0]}. Es hora de tomar su ${med.name} ${med.dosage}. Por favor tome su medicina con agua.`;
    }
    speakText(spoken, language, voiceGender).catch(() => {});
  };

  const stopAlarm = () => {
    soundEffects.stopAlarm();
    setActiveAlarmMedication(null);
  };

  const snoozeAlarm = (medId: string, minutes: number = 5) => {
    soundEffects.stopAlarm();
    setSnoozedMeds((prev) => ({
      ...prev,
      [medId]: Date.now() + minutes * 60 * 1000,
    }));
    setActiveAlarmMedication(null);
  };

  const dismissAlarm = (medId: string) => {
    soundEffects.stopAlarm();
    setDismissedMeds((prev) => ({
      ...prev,
      [medId]: true,
    }));
    setActiveAlarmMedication(null);
  };

  const takeMedicineFromAlarm = (medId: string) => {
    soundEffects.stopAlarm();
    setActiveAlarmMedication(null);
    markAsTaken(medId);
  };

  const testTriggerAlarm = (medId?: string) => {
    const target = medId
      ? medications.find((m) => m.id === medId)
      : medications.find((m) => m.status === 'pending') || medications[0];
    if (target) {
      triggerAlarm(target);
    }
  };

  // Overdue Medicine Checker: Rings alarm when time is over and medicine is not taken
  useEffect(() => {
    if (!isLoaded) return;

    const checkOverdue = () => {
      if (activeAlarmMedication) return;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const med of medications) {
        if (med.status !== 'pending') continue;
        const scheduledMin = parseTimeToMinutes(med.scheduledTime);
        if (scheduledMin === null) continue;

        // Is time over?
        if (currentMinutes >= scheduledMin) {
          if (snoozedMeds[med.id] && Date.now() < snoozedMeds[med.id]) {
            continue;
          }
          if (dismissedMeds[med.id]) {
            continue;
          }

          // TIME IS OVER AND MEDICINE NOT TAKEN -> RING ALARM!
          triggerAlarm(med);
          break;
        }
      }
    };

    checkOverdue();
    const timer = setInterval(checkOverdue, 10000);
    return () => clearInterval(timer);
  }, [medications, activeAlarmMedication, snoozedMeds, dismissedMeds, isLoaded, language, voiceGender]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedMeds = localStorage.getItem(STORAGE_KEYS.MEDS);
      if (storedMeds) setMedications(JSON.parse(storedMeds));

      const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (storedLogs) setAdherenceLogs(JSON.parse(storedLogs));

      const storedVoice = localStorage.getItem(STORAGE_KEYS.VOICE);
      if (storedVoice) setVoiceLogs(JSON.parse(storedVoice));

      const storedAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (storedAlerts) setAlerts(JSON.parse(storedAlerts));

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.language) setLanguageState(parsed.language);
        if (typeof parsed.highContrast === 'boolean') {
          setHighContrast(parsed.highContrast);
          if (parsed.highContrast) {
            document.documentElement.classList.add('high-contrast');
          }
        }
        if (parsed.caregiverName) setCaregiverName(parsed.caregiverName);
        if (parsed.caregiverPhone) setCaregiverPhone(parsed.caregiverPhone);
        if (parsed.voiceGender) setVoiceGender(parsed.voiceGender);
      }
    } catch (e) {
      console.error('Failed to load CareEcho persistence:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MEDS, JSON.stringify(medications));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(adherenceLogs));
      localStorage.setItem(STORAGE_KEYS.VOICE, JSON.stringify(voiceLogs));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({
          language,
          highContrast,
          caregiverName,
          caregiverPhone,
          voiceGender,
        })
      );
    } catch (e) {
      console.error('Failed to save CareEcho persistence:', e);
    }
  }, [
    medications,
    adherenceLogs,
    voiceLogs,
    alerts,
    language,
    highContrast,
    caregiverName,
    caregiverPhone,
    voiceGender,
    isLoaded,
  ]);

  // Handle High Contrast Class on HTML element
  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      return next;
    });
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  const updateCaregiverContact = (name: string, phone: string) => {
    setCaregiverName(name);
    setCaregiverPhone(phone);
  };

  // Mark medication as taken with audio chime & confetti
  const markAsTaken = (id: string) => {
    const med = medications.find((m) => m.id === id);
    if (!med) return;

    soundEffects.playSuccessChime();

    // If alarm was ringing for this medicine, stop it immediately
    if (activeAlarmMedication && activeAlarmMedication.id === id) {
      soundEffects.stopAlarm();
      setActiveAlarmMedication(null);
    }

    // Fire gentle celebration confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#2D6A4F', '#40916C', '#D8F3DC', '#FDE68A'],
      });
    } catch {
      // Confetti fallback if window/canvas is restricted
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMedications((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: 'taken', takenAt: nowStr } : m
      )
    );

    const newLog: AdherenceLog = {
      id: `log-${Date.now()}`,
      medicationId: id,
      medicationName: `${med.name} ${med.dosage}`,
      timestamp: `Today, ${nowStr}`,
      action: 'TAKEN',
      loggedBy: 'senior',
    };

    setAdherenceLogs((prev) => [newLog, ...prev]);

    // Send automatic caregiver update
    const autoAlert: CaregiverAlert = {
      id: `alert-${Date.now()}`,
      timestamp: `Today, ${nowStr}`,
      patientName,
      type: 'CHECK_IN',
      message: `${patientName} marked ${med.name} (${med.dosage}) as taken.`,
      channel: 'WHATSAPP',
      status: 'DELIVERED',
      recipientContact: `${caregiverPhone} (${caregiverName})`,
    };
    setAlerts((prev) => [autoAlert, ...prev]);
  };

  // Mark medication as pending (undo)
  const markAsPending = (id: string) => {
    soundEffects.playTap();
    setMedications((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: 'pending', takenAt: undefined } : m
      )
    );
  };

  // Add medication
  const addMedication = (med: Omit<Medication, 'id'>) => {
    soundEffects.playTap();
    const newMed: Medication = {
      ...med,
      id: `med-${Date.now()}`,
    };
    setMedications((prev) => [...prev, newMed]);
  };

  // Update medication
  const updateMedication = (med: Medication) => {
    soundEffects.playTap();
    setMedications((prev) => prev.map((m) => (m.id === med.id ? med : m)));
  };

  // Delete medication
  const deleteMedication = (id: string) => {
    soundEffects.playTap();
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  // Add extracted prescription medicines
  const addPrescriptionMedicines = (meds: PrescriptionExtractedMedicine[]) => {
    soundEffects.playSuccessChime();
    const mapped: Medication[] = meds.map((m, idx) => {
      let timeOfDay: TimeOfDay = 'Morning';
      const t = (m.time || '').toLowerCase();
      if (t.includes('afternoon') || t.includes('noon')) timeOfDay = 'Afternoon';
      else if (t.includes('evening') || t.includes('dinner')) timeOfDay = 'Evening';
      else if (t.includes('night') || t.includes('bedtime')) timeOfDay = 'Night';

      const defaultTimes: Record<TimeOfDay, string> = {
        Morning: '08:00 AM',
        Afternoon: '01:00 PM',
        Evening: '07:30 PM',
        Night: '09:30 PM',
      };

      return {
        id: `rx-${Date.now()}-${idx}`,
        name: m.name,
        dosage: m.dosage || 'As prescribed',
        form: 'tablet',
        frequency: m.frequency || 'Once daily',
        timeOfDay,
        scheduledTime: defaultTimes[timeOfDay],
        instructions: m.instructions || 'Take with a glass of water.',
        status: 'pending',
        purpose: 'Prescription Follow-up',
        pillColor: '#2D6A4F',
      };
    });

    setMedications((prev) => [...prev, ...mapped]);
  };

  // Add voice check-in log
  const addVoiceCheckIn = (
    query: string,
    response: string,
    sentiment: 'good' | 'neutral' | 'needs_attention' = 'good'
  ) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const checkIn: VoiceCheckIn = {
      id: `v-${Date.now()}`,
      timestamp: `Today, ${nowStr}`,
      query,
      response,
      sentiment,
    };
    setVoiceLogs((prev) => [checkIn, ...prev]);
  };

  // Trigger SOS alert
  const triggerSos = async () => {
    soundEffects.playSosAlert();
    setIsSosActive(true);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sosAlert: CaregiverAlert = {
      id: `alert-${Date.now()}`,
      timestamp: `Today, ${nowStr}`,
      patientName,
      type: 'SOS',
      message: `EMERGENCY SOS: ${patientName} pressed the Emergency SOS button at ${nowStr}. Immediate assistance requested!`,
      channel: 'SMS',
      status: 'DELIVERED',
      recipientContact: `${caregiverPhone} (${caregiverName})`,
    };

    setAlerts((prev) => [sosAlert, ...prev]);

    // Dispatch to server API route
    try {
      await fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          type: 'SOS',
          missedMedication: 'Emergency SOS Signal',
          timestamp: nowStr,
          caregiverContact: caregiverPhone,
        }),
      });
    } catch (e) {
      console.error('Failed to notify backend of SOS:', e);
    }
  };

  const dismissSos = () => {
    setIsSosActive(false);
  };

  // Send Alert Simulator
  const sendAlert = async (
    type: 'MISSED_DOSE' | 'SOS' | 'CHECK_IN',
    customMessage?: string,
    channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP'
  ): Promise<{ success: boolean; message: string }> => {
    soundEffects.playTap();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let messageText = customMessage;
    if (!messageText) {
      if (type === 'MISSED_DOSE') {
        messageText = `CareEcho Alert: ${patientName} has not taken their scheduled morning Metformin 500mg. Scheduled for 10:00 AM.`;
      } else if (type === 'SOS') {
        messageText = `EMERGENCY ALERT: ${patientName} triggered SOS assistance!`;
      } else {
        messageText = `CareEcho Daily Check-in: ${patientName} is active and feeling good today.`;
      }
    }

    try {
      const res = await fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          type,
          missedMedication: type === 'MISSED_DOSE' ? 'Metformin 500mg' : 'Routine',
          timestamp: nowStr,
          caregiverContact: caregiverPhone,
          channel,
          customMessage: messageText,
        }),
      });

      const data = await res.json();

      const newAlert: CaregiverAlert = {
        id: `alert-${Date.now()}`,
        timestamp: `Today, ${nowStr}`,
        patientName,
        type,
        message: messageText,
        channel,
        status: 'DELIVERED',
        recipientContact: `${caregiverPhone} (${caregiverName})`,
      };

      setAlerts((prev) => [newAlert, ...prev]);

      return {
        success: true,
        message: data.message || `Simulated ${channel} alert sent to ${caregiverName}!`,
      };
    } catch {
      // Fallback
      const newAlert: CaregiverAlert = {
        id: `alert-${Date.now()}`,
        timestamp: `Today, ${nowStr}`,
        patientName,
        type,
        message: messageText,
        channel,
        status: 'DELIVERED',
        recipientContact: `${caregiverPhone} (${caregiverName})`,
      };
      setAlerts((prev) => [newAlert, ...prev]);

      return {
        success: true,
        message: `Simulated ${channel} alert recorded for ${caregiverName}.`,
      };
    }
  };

  const resetToDefaults = () => {
    setMedications(INITIAL_MEDICATIONS);
    setAdherenceLogs(INITIAL_LOGS);
    setVoiceLogs(INITIAL_VOICE_CHECKINS);
    setAlerts(INITIAL_ALERTS);
    soundEffects.playTap();
  };

  // Find next pending medication
  const nextMedication =
    medications.find((m) => m.status === 'pending') || null;

  // Calculate adherence rate
  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.status === 'taken').length;
  const adherenceRate = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;
  const streakDays = 5; // Realistic streak

  return (
    <CareContext.Provider
      value={{
        medications,
        adherenceLogs,
        voiceLogs,
        alerts,
        language,
        highContrast,
        caregiverName,
        caregiverPhone,
        patientName,
        isSosActive,
        nextMedication,
        adherenceRate,
        streakDays,
        voiceGender,
        setVoiceGender,
        activeAlarmMedication,
        triggerAlarm,
        stopAlarm,
        snoozeAlarm,
        dismissAlarm,
        testTriggerAlarm,
        takeMedicineFromAlarm,
        markAsTaken,
        markAsPending,
        addMedication,
        updateMedication,
        deleteMedication,
        addPrescriptionMedicines,
        addVoiceCheckIn,
        triggerSos,
        dismissSos,
        sendAlert,
        toggleHighContrast,
        setLanguage,
        updateCaregiverContact,
        resetToDefaults,
      }}
    >
      {children}
    </CareContext.Provider>
  );
};

export const useCare = () => {
  const context = useContext(CareContext);
  if (!context) {
    throw new Error('useCare must be used within a CareProvider');
  }
  return context;
};
