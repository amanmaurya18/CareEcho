"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AlertEvent,
  AlertType,
  AppState,
  CaregiverSettings,
  CheckInLog,
  Dose,
  Medication,
  SupportedLang,
} from "@/lib/types";
import {
  STATE_VERSION,
  buildDayDoses,
  buildSeedWeekly,
  createInitialState,
  todayStr,
  uid,
} from "@/lib/mockData";
import { chimeAlert, chimeSos, chimeTaken } from "@/lib/audio";

const STORAGE_KEY = "careecho-state-v1";

export interface Toast {
  id: string;
  message: string;
  kind: "info" | "success" | "warn" | "error";
}

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  /** today's doses, sorted by scheduled time */
  todayDoses: Dose[];
  medById: (id: string) => Medication | undefined;
  /** the next pending dose today (or null when all done) */
  nextDose: { dose: Dose; med: Medication } | null;
  todayStats: { taken: number; total: number; missed: number; pending: number; pct: number };
  weekPct: number;
  liveAlert: AlertEvent | null;
  dismissLiveAlert: () => void;
  toasts: Toast[];
  pushToast: (message: string, kind?: Toast["kind"]) => void;
  /* actions */
  markTaken: (doseId: string) => void;
  undoTaken: (doseId: string) => void;
  markMissedNow: (doseId: string) => void;
  addMedications: (meds: Medication[]) => void;
  updateMedication: (med: Medication) => void;
  deleteMedication: (medId: string) => void;
  toggleMedicationActive: (medId: string) => void;
  addCheckIn: (log: Omit<CheckInLog, "id" | "timestamp">) => void;
  sendAlert: (type: AlertType, message: string) => Promise<void>;
  updateSettings: (patch: Partial<CaregiverSettings>) => void;
  setHighContrast: (on: boolean) => void;
  setVoiceLang: (lang: SupportedLang) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ------------------------------------------------------------------ */

function loadState(): AppState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== STATE_VERSION || !Array.isArray(parsed.medications)) {
      return createInitialState();
    }
    return parsed;
  } catch {
    return createInitialState();
  }
}

/** Roll the schedule into a new day and refresh weekly adherence. */
function rollDayForward(s: AppState): AppState {
  const date = todayStr();
  if (s.lastScheduleDate === date) return s;

  const next: AppState = { ...s, doses: { ...s.doses } };

  // finalise yesterday's adherence into the weekly series
  const weekly = [...(s.weekly ?? [])];
  for (let i = 0; i < weekly.length; i++) {
    const day = weekly[i];
    const doses = next.doses[day.date];
    if (doses && doses.length > 0) {
      const taken = doses.filter((d) => d.status === "taken").length;
      weekly[i] = {
        ...day,
        taken,
        total: doses.length,
        adherence: Math.round((taken / doses.length) * 100),
      };
    }
  }
  // drop days older than 7 and make sure today exists
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  let trimmed = weekly.filter((d) => new Date(`${d.date}T00:00:00`) >= cutoff);
  if (!trimmed.some((d) => d.date === date)) {
    const total = buildDayDoses(date, s.medications).length;
    trimmed = [...trimmed, { date, adherence: 0, taken: 0, total }];
  }
  if (trimmed.length === 0) trimmed = buildSeedWeekly();

  next.weekly = trimmed;
  next.doses[date] = buildDayDoses(date, s.medications);
  next.lastScheduleDate = date;
  return next;
}

/* ------------------------------------------------------------------ */

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [liveAlert, setLiveAlert] = useState<AlertEvent | null>(null);
  const alertingRef = useRef<Set<string>>(new Set());

  /* ---- hydrate once from localStorage ---- */
  useEffect(() => {
    setState((prev) => {
      const loaded = rollDayForward(loadState());
      return loaded ?? prev;
    });
    setHydrated(true);
  }, []);

  /* ---- persist on every change ---- */
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / private mode — keep running in memory */
    }
  }, [state, hydrated]);

  /* ---- high-contrast class on <html> ---- */
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("hc", state.highContrast);
  }, [state.highContrast]);

  /* ---- toasts ---- */
  const pushToast = useCallback((message: string, kind: Toast["kind"] = "info") => {
    const id = uid("toast");
    setToasts((t) => [...t, { id, message, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const dismissLiveAlert = useCallback(() => setLiveAlert(null), []);

  /* ---- missed-dose watcher (runs every 30s) ---- */
  const fireMissedAlert = useCallback(
    async (dose: Dose, med: Medication | undefined) => {
      if (alertingRef.current.has(dose.id)) return;
      alertingRef.current.add(dose.id);
      const message = `${med?.name ?? "A medication"} ${med?.dosage ?? ""} (${dose.id
        .split("-")
        .slice(-2, -1)[0]}) was not taken on time.`;
      chimeAlert();
      const event: AlertEvent = {
        id: uid("alert"),
        type: "MISSED_DOSE",
        message: `${med?.name ?? "Medication"} ${
          med?.dosage ?? ""
        } — scheduled dose missed at ${new Date(dose.scheduledAt).toLocaleTimeString(
          undefined,
          { hour: "numeric", minute: "2-digit" }
        )}.`,
        timestamp: new Date().toISOString(),
        channel: "whatsapp",
        status: "simulated",
      };
      setState((s) => ({ ...s, alerts: [event, ...s.alerts].slice(0, 50) }));
      setLiveAlert(event);
      try {
        await fetch("/api/send-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName: state.settings.patientName,
            missedMedication: `${med?.name ?? "Medication"} ${med?.dosage ?? ""}`,
            timestamp: event.timestamp,
            caregiverContact: state.settings.phone,
            type: "MISSED_DOSE",
          }),
        });
        setState((s) => ({
          ...s,
          alerts: s.alerts.map((a) => (a.id === event.id ? { ...a, status: "sent" } : a)),
        }));
      } catch {
        /* stays "simulated" — on-screen banner + chime already fired */
      }
      void message;
    },
    [state.settings.patientName, state.settings.phone]
  );

  useEffect(() => {
    if (!hydrated) return;
    const tick = () => {
      const date = todayStr();
      const now = Date.now();
      const grace = state.settings.graceMinutes * 60 * 1000;
      const todays = state.doses[date] ?? [];
      const newlyMissed = todays.filter(
        (d) =>
          d.status === "pending" &&
          now - new Date(d.scheduledAt).getTime() > grace &&
          !alertingRef.current.has(d.id)
      );
      if (newlyMissed.length === 0) return;

      setState((s) => {
        const list = s.doses[date] ?? [];
        const updated = list.map((d) =>
          newlyMissed.some((m) => m.id === d.id) ? { ...d, status: "missed" as const } : d
        );
        return { ...s, doses: { ...s.doses, [date]: updated } };
      });

      if (state.settings.autoAlerts) {
        for (const d of newlyMissed) {
          void fireMissedAlert(d, state.medications.find((m) => m.id === d.medicationId));
        }
      } else {
        for (const d of newlyMissed) alertingRef.current.add(d.id);
      }
    };
    tick();
    const iv = window.setInterval(tick, 30_000);
    return () => window.clearInterval(iv);
  }, [hydrated, state.doses, state.medications, state.settings, fireMissedAlert]);

  /* ---- derived ---- */
  const date = todayStr();
  const todayDoses = useMemo(
    () =>
      [...(state.doses[date] ?? [])].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      ),
    [state.doses, date]
  );

  const medById = useCallback(
    (id: string) => state.medications.find((m) => m.id === id),
    [state.medications]
  );

  const nextDose = useMemo(() => {
    const now = Date.now();
    // prefer pending doses (earliest first, but upcoming before long-overdue)
    const pending = todayDoses.filter((d) => d.status === "pending");
    const overdue = pending.find((d) => new Date(d.scheduledAt).getTime() < now);
    const upcoming = pending.find((d) => new Date(d.scheduledAt).getTime() >= now);
    const dose = overdue ?? upcoming ?? null;
    if (!dose) return null;
    const med = state.medications.find((m) => m.id === dose.medicationId);
    return med ? { dose, med } : null;
  }, [todayDoses, state.medications]);

  const todayStats = useMemo(() => {
    const total = todayDoses.length;
    const taken = todayDoses.filter((d) => d.status === "taken").length;
    const missed = todayDoses.filter((d) => d.status === "missed").length;
    return {
      taken,
      total,
      missed,
      pending: total - taken - missed,
      pct: total ? Math.round((taken / total) * 100) : 0,
    };
  }, [todayDoses]);

  const weekPct = useMemo(() => {
    const days = state.weekly ?? [];
    if (days.length === 0) return 0;
    // replace today's entry with live numbers
    const sum = days.reduce((acc, d) => {
      if (d.date === date) return acc + todayStats.pct;
      return acc + d.adherence;
    }, 0);
    return Math.round(sum / days.length);
  }, [state.weekly, todayStats.pct, date]);

  /* ---- actions ---- */
  const markTaken = useCallback((doseId: string) => {
    chimeTaken();
    setState((s) => {
      const out: AppState["doses"] = {};
      for (const [k, list] of Object.entries(s.doses)) {
        out[k] = list.map((d) =>
          d.id === doseId
            ? { ...d, status: "taken" as const, takenAt: new Date().toISOString() }
            : d
        );
      }
      return { ...s, doses: out };
    });
    alertingRef.current.delete(doseId);
  }, []);

  const undoTaken = useCallback((doseId: string) => {
    setState((s) => {
      const out: AppState["doses"] = {};
      for (const [k, list] of Object.entries(s.doses)) {
        out[k] = list.map((d) =>
          d.id === doseId ? { ...d, status: "pending" as const, takenAt: undefined } : d
        );
      }
      return { ...s, doses: out };
    });
  }, []);

  const markMissedNow = useCallback(
    (doseId: string) => {
      let target: Dose | undefined;
      setState((s) => {
        const out: AppState["doses"] = {};
        for (const [k, list] of Object.entries(s.doses)) {
          out[k] = list.map((d) => {
            if (d.id === doseId) {
              target = d;
              return { ...d, status: "missed" as const };
            }
            return d;
          });
        }
        return { ...s, doses: out };
      });
      if (target) {
        const d = target;
        void fireMissedAlert(d, state.medications.find((m) => m.id === d.medicationId));
      }
    },
    [fireMissedAlert, state.medications]
  );

  const regenerateToday = (meds: Medication[], existing: Dose[]): Dose[] => {
    const fresh = buildDayDoses(date, meds);
    // keep statuses of doses that still exist
    const byId = new Map(existing.map((d) => [d.id, d]));
    return fresh.map((d) => byId.get(d.id) ?? d);
  };

  const addMedications = useCallback(
    (meds: Medication[]) => {
      setState((s) => {
        const medications = [...s.medications, ...meds];
        const doses = {
          ...s.doses,
          [date]: regenerateToday(medications, s.doses[date] ?? []),
        };
        return { ...s, medications, doses };
      });
    },
    [date]
  );

  const updateMedication = useCallback(
    (med: Medication) => {
      setState((s) => {
        const medications = s.medications.map((m) => (m.id === med.id ? med : m));
        const doses = {
          ...s.doses,
          [date]: regenerateToday(medications, s.doses[date] ?? []),
        };
        return { ...s, medications, doses };
      });
    },
    [date]
  );

  const deleteMedication = useCallback(
    (medId: string) => {
      setState((s) => {
        const medications = s.medications.filter((m) => m.id !== medId);
        const existing = (s.doses[date] ?? []).filter((d) => d.medicationId !== medId);
        return { ...s, medications, doses: { ...s.doses, [date]: existing } };
      });
    },
    [date]
  );

  const toggleMedicationActive = useCallback(
    (medId: string) => {
      setState((s) => {
        const medications = s.medications.map((m) =>
          m.id === medId ? { ...m, active: !m.active } : m
        );
        const doses = {
          ...s.doses,
          [date]: regenerateToday(medications, s.doses[date] ?? []),
        };
        return { ...s, medications, doses };
      });
    },
    [date]
  );

  const addCheckIn = useCallback((log: Omit<CheckInLog, "id" | "timestamp">) => {
    const entry: CheckInLog = { ...log, id: uid("checkin"), timestamp: new Date().toISOString() };
    setState((s) => ({ ...s, checkIns: [entry, ...s.checkIns].slice(0, 60) }));
  }, []);

  const sendAlert = useCallback(
    async (type: AlertType, message: string) => {
      if (type === "SOS") chimeSos();
      else chimeAlert();
      const event: AlertEvent = {
        id: uid("alert"),
        type,
        message,
        timestamp: new Date().toISOString(),
        channel: state.settings.whatsappEnabled ? "whatsapp" : "sms",
        status: "simulated",
      };
      setState((s) => ({ ...s, alerts: [event, ...s.alerts].slice(0, 50) }));
      setLiveAlert(event);
      try {
        await fetch("/api/send-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName: state.settings.patientName,
            missedMedication: type === "SOS" ? "EMERGENCY SOS" : message,
            timestamp: event.timestamp,
            caregiverContact: state.settings.phone,
            type,
          }),
        });
        setState((s) => ({
          ...s,
          alerts: s.alerts.map((a) => (a.id === event.id ? { ...a, status: "sent" } : a)),
        }));
      } catch {
        /* on-screen fallback already active */
      }
    },
    [state.settings]
  );

  const updateSettings = useCallback((patch: Partial<CaregiverSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const setHighContrast = useCallback((on: boolean) => {
    setState((s) => ({ ...s, highContrast: on }));
  }, []);

  const setVoiceLang = useCallback((lang: SupportedLang) => {
    setState((s) => ({ ...s, voiceLang: lang }));
  }, []);

  const resetDemoData = useCallback(() => {
    alertingRef.current.clear();
    setState(createInitialState());
    pushToast("Demo data restored.", "success");
  }, [pushToast]);

  const value: AppContextValue = {
    state,
    hydrated,
    todayDoses,
    medById,
    nextDose,
    todayStats,
    weekPct,
    liveAlert,
    dismissLiveAlert,
    toasts,
    pushToast,
    markTaken,
    undoTaken,
    markMissedNow,
    addMedications,
    updateMedication,
    deleteMedication,
    toggleMedicationActive,
    addCheckIn,
    sendAlert,
    updateSettings,
    setHighContrast,
    setVoiceLang,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
