/* ------------------------------------------------------------------ */
/* CareEcho core domain types                                          */
/* ------------------------------------------------------------------ */

export type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Night";

export type DoseStatus = "taken" | "pending" | "missed";

export type SupportedLang = "en-US" | "hi-IN" | "es-ES";

export interface DoseTime {
  id: string;
  /** 24h clock, e.g. "08:00" */
  time: string;
  period: TimeOfDay;
}

export interface Medication {
  id: string;
  name: string;
  /** e.g. "500 mg" */
  dosage: string;
  /** e.g. "1 tablet" */
  quantity: string;
  frequency: string;
  /** e.g. "After food, with a full glass of water" */
  instructions: string;
  times: DoseTime[];
  active: boolean;
  /** ISO date (yyyy-mm-dd) the medication was added */
  addedOn: string;
  source?: "manual" | "scan";
}

/** One scheduled intake for one day. */
export interface Dose {
  /** `${medicationId}-${doseTimeId}-${date}` */
  id: string;
  medicationId: string;
  /** yyyy-mm-dd */
  date: string;
  /** ISO timestamp of scheduled moment */
  scheduledAt: string;
  status: DoseStatus;
  /** ISO timestamp when actually taken */
  takenAt?: string;
}

export interface CheckInLog {
  id: string;
  timestamp: string;
  lang: SupportedLang;
  /** what the senior said */
  transcript: string;
  /** what CareEcho answered */
  response: string;
}

export type AlertType = "MISSED_DOSE" | "SOS";

export interface AlertEvent {
  id: string;
  type: AlertType;
  message: string;
  timestamp: string;
  channel: "whatsapp" | "sms";
  status: "sent" | "simulated";
}

export interface CaregiverSettings {
  caregiverName: string;
  patientName: string;
  /** E.164-ish display number */
  phone: string;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  /** automatically fire an alert when a dose goes missed */
  autoAlerts: boolean;
  /** minutes after the scheduled time a pending dose becomes "missed" */
  graceMinutes: number;
}

/** A medicine row returned by the prescription scanner API. */
export interface ScannedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  instructions: string;
}

export interface WeeklyDay {
  /** yyyy-mm-dd */
  date: string;
  /** 0–100 */
  adherence: number;
  taken: number;
  total: number;
}

/** Everything persisted in localStorage under one key. */
export interface AppState {
  version: number;
  medications: Medication[];
  /** doses keyed by yyyy-mm-dd */
  doses: Record<string, Dose[]>;
  checkIns: CheckInLog[];
  alerts: AlertEvent[];
  settings: CaregiverSettings;
  weekly: WeeklyDay[];
  highContrast: boolean;
  voiceLang: SupportedLang;
  /** last date the app generated a schedule for */
  lastScheduleDate: string;
}
