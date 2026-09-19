"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  MessageCircle,
  Mic,
  Pill,
  RotateCcw,
  Send,
  Settings2,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import MedicineManager from "@/components/MedicineManager";
import { cn, formatClockTime, formatStamp, timeAgo } from "@/lib/utils";
import type { AlertType } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function WeeklyBars() {
  const { state, todayStats } = useApp();
  const days = state.weekly ?? [];
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xl font-bold">
        <CalendarDays size={20} aria-hidden className="text-sage" />
        Last 7 days
      </h3>
      <div className="mt-4 flex h-40 items-end gap-2 sm:gap-3" role="img"
        aria-label={`Daily adherence: ${days
          .map((d) => `${d.date.slice(5)} ${d.adherence}%`)
          .join(", ")}`}
      >
        {days.map((d, i) => {
          const isToday = i === days.length - 1;
          const pct = isToday ? todayStats.pct : d.adherence;
          const color = pct >= 85 ? "bg-sage" : pct >= 60 ? "bg-amberw" : "bg-danger";
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-base font-bold text-soft">{pct}%</span>
              <div className="flex h-28 w-full items-end rounded-lg bg-zinc-100">
                <div
                  className={cn("w-full rounded-lg transition-all duration-700", color)}
                  style={{ height: `${Math.max(pct, 3)}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-soft">
                {new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
                  weekday: "short",
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityFeed() {
  const { state, todayDoses, medById } = useApp();

  type Item = { key: string; at: string; icon: React.ReactNode; tone: string; title: string; body: string };
  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    for (const d of todayDoses) {
      const med = medById(d.medicationId);
      if (!med) continue;
      if (d.status === "taken" && d.takenAt) {
        out.push({
          key: `dose-${d.id}`,
          at: d.takenAt,
          tone: "text-sage bg-green-100",
          icon: <Pill size={18} aria-hidden />,
          title: `Dose taken — ${med.name} ${med.dosage}`,
          body: `Scheduled ${formatClockTime(d.scheduledAt)} · taken ${formatClockTime(d.takenAt)}`,
        });
      } else if (d.status === "missed") {
        out.push({
          key: `miss-${d.id}`,
          at: d.scheduledAt,
          tone: "text-danger bg-red-100",
          icon: <ShieldAlert size={18} aria-hidden />,
          title: `Missed dose — ${med.name} ${med.dosage}`,
          body: `Was scheduled for ${formatClockTime(d.scheduledAt)} · not marked as taken`,
        });
      }
    }
    for (const c of state.checkIns) {
      out.push({
        key: `checkin-${c.id}`,
        at: c.timestamp,
        tone: "text-amberw bg-amber-100",
        icon: <Mic size={18} aria-hidden />,
        title: `Voice check-in (${c.lang})`,
        body: `“${c.transcript}” → “${c.response}”`,
      });
    }
    for (const a of state.alerts) {
      out.push({
        key: `alert-${a.id}`,
        at: a.timestamp,
        tone: a.type === "SOS" ? "text-danger bg-red-100" : "text-amberw bg-amber-100",
        icon: a.type === "SOS" ? <Siren size={18} aria-hidden /> : <MessageCircle size={18} aria-hidden />,
        title: `${a.type === "SOS" ? "SOS" : "Missed-dose"} alert · ${a.channel.toUpperCase()} · ${a.status}`,
        body: a.message,
      });
    }
    return out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 24);
  }, [todayDoses, state.checkIns, state.alerts, medById]);

  return (
    <section className="card-surface p-6" aria-label="Activity feed">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <Activity size={24} aria-hidden className="text-sage" />
        Real-time activity
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it.key} className="flex items-start gap-3 rounded-xl border border-line p-4">
            <span className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", it.tone)}>
              {it.icon}
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-snug">{it.title}</p>
              <p className="mt-0.5 text-lg text-soft">{it.body}</p>
              <p className="mt-1 text-base text-soft/80" title={formatStamp(it.at)}>
                {timeAgo(it.at)}
              </p>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="text-xl text-soft">No activity yet today.</li>}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Alert simulator + settings                                          */
/* ------------------------------------------------------------------ */

function AlertSimulator() {
  const { state, updateSettings, sendAlert, pushToast } = useApp();
  const [sending, setSending] = useState<AlertType | null>(null);

  async function fire(type: AlertType) {
    setSending(type);
    await sendAlert(
      type,
      type === "SOS"
        ? `TEST SOS from ${state.settings.patientName}'s CareEcho device.`
        : `TEST missed-dose alert: Metformin 500 mg (Evening) for ${state.settings.patientName}.`
    );
    pushToast(
      `Alert dispatched to ${state.settings.phone} via ${
        state.settings.whatsappEnabled ? "WhatsApp" : "SMS"
      } (simulated).`,
      "warn"
    );
    setSending(null);
  }

  const s = state.settings;

  return (
    <section className="card-surface p-6" aria-label="Alerts and caregiver contact">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <Settings2 size={24} aria-hidden className="text-sage" />
        Alerts &amp; caregiver contact
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cg-name" className="mb-1 block text-lg font-semibold">Caregiver name</label>
          <input id="cg-name" className="input-lg" value={s.caregiverName}
            onChange={(e) => updateSettings({ caregiverName: e.target.value })} />
        </div>
        <div>
          <label htmlFor="pt-name" className="mb-1 block text-lg font-semibold">Patient name</label>
          <input id="pt-name" className="input-lg" value={s.patientName}
            onChange={(e) => updateSettings({ patientName: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cg-phone" className="mb-1 block text-lg font-semibold">
            Caregiver phone (WhatsApp / SMS)
          </label>
          <input id="cg-phone" className="input-lg" inputMode="tel" value={s.phone}
            onChange={(e) => updateSettings({ phone: e.target.value })} />
        </div>
        <div>
          <label htmlFor="grace" className="mb-1 block text-lg font-semibold">
            Missed-dose grace window (minutes)
          </label>
          <input id="grace" type="number" min={1} max={240} className="input-lg"
            value={s.graceMinutes}
            onChange={(e) => updateSettings({ graceMinutes: Math.max(1, Number(e.target.value) || 20) })} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {(
          [
            ["whatsappEnabled", "WhatsApp alerts"],
            ["smsEnabled", "SMS alerts"],
            ["autoAlerts", "Auto-alert when a dose is missed"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 text-lg font-semibold">
            <input
              type="checkbox"
              checked={s[key]}
              onChange={(e) => updateSettings({ [key]: e.target.checked })}
              className="h-6 w-6 accent-[#2D6A4F]"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
        <button type="button" className="btn-sage flex-1" disabled={sending !== null}
          onClick={() => void fire("MISSED_DOSE")}>
          {sending === "MISSED_DOSE" ? <RotateCcw size={22} className="animate-spin" aria-hidden /> : <Send size={22} aria-hidden />}
          Send test WhatsApp / SMS alert
        </button>
        <button type="button" className="btn-danger-outline flex-1" disabled={sending !== null}
          onClick={() => void fire("SOS")}>
          <Siren size={22} aria-hidden />
          Send test SOS
        </button>
      </div>
      <p className="mt-3 text-base text-soft">
        Alerts are dispatched through <code className="rounded bg-zinc-100 px-1.5 py-0.5">/api/send-alert</code>{" "}
        (simulated Twilio gateway). Every dispatch also appears as an on-screen banner and
        in the activity feed.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CaregiverPage() {
  const { hydrated, state, weekPct, todayStats, resetDemoData } = useApp();

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-busy>
        <p className="text-2xl text-soft">Loading dashboard…</p>
      </div>
    );
  }

  const pctColor = weekPct >= 85 ? "text-sage" : weekPct >= 60 ? "text-amberw" : "text-danger";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Caregiver Dashboard</h1>
          <p className="mt-1 text-xl text-soft">
            Caring for <strong className="text-ink">{state.settings.patientName}</strong> ·
            contact {state.settings.phone}
          </p>
        </div>
        <button type="button" onClick={resetDemoData} className="btn-secondary">
          <RotateCcw size={22} aria-hidden />
          Restore demo data
        </button>
      </div>

      {/* -------- Adherence scorecard -------- */}
      <section className="card-surface grid gap-6 p-6 lg:grid-cols-[auto_1fr]" aria-label="Adherence scorecard">
        <div className="flex items-center gap-5">
          <div className="relative flex h-36 w-36 items-center justify-center"
            role="img" aria-label={`Weekly adherence ${weekPct} percent`}>
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e4e4e7" strokeWidth="12" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor"
                className={pctColor} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(weekPct / 100) * 326.7} 326.7`} />
            </svg>
            <span className={cn("absolute text-4xl font-bold", pctColor)}>{weekPct}%</span>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <BadgeCheck size={24} aria-hidden className="text-sage" />
              Adherence this week
            </h2>
            <p className="mt-1 text-lg text-soft">
              Today: <strong className="text-ink">{todayStats.taken}/{todayStats.total}</strong> doses
              taken
              {todayStats.missed > 0 && (
                <> · <strong className="text-danger">{todayStats.missed} missed</strong></>
              )}
              {todayStats.pending > 0 && <> · {todayStats.pending} pending</>}
            </p>
            <p className="mt-1 text-lg text-soft">
              {state.alerts.length} alert{state.alerts.length === 1 ? "" : "s"} ·{" "}
              {state.checkIns.length} voice check-in{state.checkIns.length === 1 ? "" : "s"} logged
            </p>
          </div>
        </div>
        <WeeklyBars />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ActivityFeed />
        <AlertSimulator />
      </div>

      <MedicineManager />
    </div>
  );
}
