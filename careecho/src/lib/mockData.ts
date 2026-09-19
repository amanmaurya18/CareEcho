import type {
  AppState,
  CaregiverSettings,
  CheckInLog,
  Dose,
  Medication,
  WeeklyDay,
} from "./types";

/* ------------------------------------------------------------------ */
/* Date helpers (all local time — the senior's clock is what matters)  */
/* ------------------------------------------------------------------ */

export const STATE_VERSION = 1;

export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Combine a yyyy-mm-dd date and "HH:MM" into an ISO timestamp (local). */
export function isoAt(date: string, hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(`${date}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/* ------------------------------------------------------------------ */
/* Seed medications — a realistic regimen for "Sudha Devi, 74"         */
/* ------------------------------------------------------------------ */

export const SEED_MEDICATIONS: Medication[] = [
  {
    id: "med-metformin",
    name: "Metformin",
    dosage: "500 mg",
    quantity: "1 tablet",
    frequency: "Twice daily",
    instructions: "Take after food, with a full glass of water.",
    times: [
      { id: "t1", time: "08:00", period: "Morning" },
      { id: "t2", time: "20:00", period: "Evening" },
    ],
    active: true,
    addedOn: "2026-06-02",
    source: "scan",
  },
  {
    id: "med-telmisartan",
    name: "Telmisartan",
    dosage: "40 mg",
    quantity: "1 tablet",
    frequency: "Once daily",
    instructions: "Your heart tablet — take after breakfast.",
    times: [{ id: "t1", time: "09:00", period: "Morning" }],
    active: true,
    addedOn: "2026-06-02",
    source: "manual",
  },
  {
    id: "med-calcium",
    name: "Calcium + Vitamin D3",
    dosage: "500 mg / 60000 IU",
    quantity: "1 capsule",
    frequency: "Once daily",
    instructions: "Take after lunch.",
    times: [{ id: "t1", time: "13:00", period: "Afternoon" }],
    active: true,
    addedOn: "2026-07-18",
    source: "manual",
  },
  {
    id: "med-atorvastatin",
    name: "Atorvastatin",
    dosage: "10 mg",
    quantity: "1 tablet",
    frequency: "Once daily at bedtime",
    instructions: "Take at night, before sleeping.",
    times: [{ id: "t1", time: "21:30", period: "Night" }],
    active: true,
    addedOn: "2026-06-02",
    source: "manual",
  },
];

/* ------------------------------------------------------------------ */
/* Dose schedule generation                                            */
/* ------------------------------------------------------------------ */

/** Build all doses for one day from the active medication list. */
export function buildDayDoses(date: string, meds: Medication[]): Dose[] {
  const doses: Dose[] = [];
  for (const med of meds) {
    if (!med.active) continue;
    for (const t of med.times) {
      doses.push({
        id: `${med.id}-${t.id}-${date}`,
        medicationId: med.id,
        date,
        scheduledAt: isoAt(date, t.time),
        status: "pending",
      });
    }
  }
  return doses.sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
}

/**
 * First-run seeding: doses already in the past today are marked taken
 * (so the app looks lived-in), but exactly ONE — the most recent past
 * dose at least 90 minutes old — is left "missed" to demo the alert flow.
 */
export function buildSeedDoses(date: string, meds: Medication[]): Dose[] {
  const doses = buildDayDoses(date, meds);
  const now = Date.now();
  const past = doses.filter(
    (d) => new Date(d.scheduledAt).getTime() < now - 5 * 60 * 1000
  );

  // choose the missed one: a past dose ≥ 90 min old, prefer the latest such
  const missCandidate = past
    .filter((d) => now - new Date(d.scheduledAt).getTime() > 90 * 60 * 1000)
    .at(-1);

  for (const d of doses) {
    const sched = new Date(d.scheduledAt).getTime();
    if (sched >= now) continue;
    if (missCandidate && d.id === missCandidate.id) {
      d.status = "missed";
    } else {
      d.status = "taken";
      d.takenAt = new Date(sched + 4 * 60 * 1000).toISOString();
    }
  }
  return doses;
}

/* ------------------------------------------------------------------ */
/* Seed weekly adherence (past 6 days + today placeholder)             */
/* ------------------------------------------------------------------ */

export function buildSeedWeekly(): WeeklyDay[] {
  const rates = [92, 85, 100, 78, 88, 95]; // six days back … yesterday
  const days: WeeklyDay[] = [];
  for (let i = 6; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const adherence = rates[6 - i];
    const total = 5;
    days.push({
      date: todayStr(d),
      adherence,
      taken: Math.round((adherence / 100) * total),
      total,
    });
  }
  days.push({ date: todayStr(), adherence: 0, taken: 0, total: 5 });
  return days;
}

/* ------------------------------------------------------------------ */
/* Seed logs, alerts & settings                                        */
/* ------------------------------------------------------------------ */

export const DEFAULT_SETTINGS: CaregiverSettings = {
  caregiverName: "Anita (Daughter)",
  patientName: "Sudha Devi",
  phone: "+91 98765 43210",
  whatsappEnabled: true,
  smsEnabled: true,
  autoAlerts: true,
  graceMinutes: 20,
};

export function buildSeedCheckIns(): CheckInLog[] {
  const d1 = new Date();
  d1.setHours(d1.getHours() - 26);
  const d2 = new Date();
  d2.setHours(9, 12, 0, 0);
  if (d2.getTime() > Date.now()) d2.setDate(d2.getDate() - 1);
  return [
    {
      id: uid("checkin"),
      timestamp: d1.toISOString(),
      lang: "en-US",
      transcript: "I had my morning walk today.",
      response:
        "That is wonderful! A morning walk is great for your heart. Did you take your heart tablet after breakfast?",
    },
    {
      id: uid("checkin"),
      timestamp: d2.toISOString(),
      lang: "hi-IN",
      transcript: "मुझे थोड़ा सिरदर्द है।",
      response:
        "आप थोड़ा पानी पीजिए और आराम कीजिए। अगर दर्द बना रहे तो हम अनीता जी को बता देंगे।",
    },
  ];
}

export function buildSeedAlerts(): AppState["alerts"] {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  d.setHours(20, 34, 0, 0);
  return [
    {
      id: uid("alert"),
      type: "MISSED_DOSE",
      message:
        "Metformin 500 mg (Evening) was not marked as taken within the grace window.",
      timestamp: d.toISOString(),
      channel: "whatsapp",
      status: "sent",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Full initial state                                                  */
/* ------------------------------------------------------------------ */

export function createInitialState(): AppState {
  const date = todayStr();
  return {
    version: STATE_VERSION,
    medications: SEED_MEDICATIONS,
    doses: { [date]: buildSeedDoses(date, SEED_MEDICATIONS) },
    checkIns: buildSeedCheckIns(),
    alerts: buildSeedAlerts(),
    settings: DEFAULT_SETTINGS,
    weekly: buildSeedWeekly(),
    highContrast: false,
    voiceLang: "en-US",
    lastScheduleDate: date,
  };
}
