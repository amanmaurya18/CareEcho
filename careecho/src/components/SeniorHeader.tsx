"use client";

import { useEffect, useState } from "react";
import { BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Wifi, WifiOff, Siren } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { chimeSos } from "@/lib/audio";
import SosDialog from "@/components/SosDialog";

/* ------------------------------------------------------------------ */
/* Live clock + battery/connection + SOS                               */
/* ------------------------------------------------------------------ */

export default function SeniorHeader() {
  const { state, sendAlert, pushToast } = useApp();
  const [now, setNow] = useState<Date | null>(null);
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [online, setOnline] = useState(true);
  const [sosOpen, setSosOpen] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setNow(new Date());
    setOnline(navigator.onLine);
    const iv = window.setInterval(() => setNow(new Date()), 1000);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.clearInterval(iv);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    type BatteryManager = {
      level: number;
      charging: boolean;
      addEventListener: (t: string, cb: () => void) => void;
    };
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    let bm: BatteryManager | null = null;
    const update = () => bm && setBattery({ level: bm.level, charging: bm.charging });
    nav
      .getBattery?.()
      .then((b) => {
        bm = b;
        update();
        b.addEventListener("levelchange", update);
        b.addEventListener("chargingchange", update);
      })
      .catch(() => setBattery(null));
  }, []);

  const dateText = now
    ? now.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "\u00A0";
  const timeText = now
    ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : "\u00A0";

  const BatIcon = !battery
    ? BatteryCharging
    : battery.level > 0.6
      ? BatteryFull
      : battery.level > 0.25
        ? BatteryMedium
        : BatteryLow;

  async function confirmSos() {
    setSosOpen(false);
    setSending(true);
    chimeSos();
    await sendAlert(
      "SOS",
      `${state.settings.patientName} pressed the emergency SOS button. Please call immediately.`
    );
    pushToast("SOS sent to your caregiver.", "error");
    setSending(false);
  }

  return (
    <section className="card-surface p-5 sm:p-6" aria-label="Date, time and status">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Date & time — large and reassuring */}
        <div>
          <p className="text-xl font-semibold text-soft" suppressHydrationWarning>
            {dateText}
          </p>
          <p
            className="mt-1 text-5xl font-bold tracking-tight sm:text-6xl"
            aria-live="off"
            suppressHydrationWarning
          >
            {timeText}
          </p>
          <p className="mt-2 text-lg text-soft">
            Hello {state.settings.patientName.split(" ")[0]} — you are doing great. 💚
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection + battery indicators */}
          <div
            className="flex items-center gap-4 rounded-xl border border-line px-4 py-3"
            aria-label={`Connection: ${online ? "online" : "offline"}`}
          >
            {online ? (
              <span className="flex items-center gap-1.5 text-sage">
                <Wifi size={24} aria-hidden />
                <span className="text-base font-semibold">Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-danger">
                <WifiOff size={24} aria-hidden />
                <span className="text-base font-semibold">Offline</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-ink">
              <BatIcon size={26} aria-hidden />
              <span className="text-base font-semibold">
                {battery ? `${Math.round(battery.level * 100)}%` : "—"}
              </span>
            </span>
          </div>

          {/* Emergency SOS — big red outline, huge tap target */}
          <button
            type="button"
            onClick={() => setSosOpen(true)}
            disabled={sending}
            className="btn-danger-outline min-h-[72px] min-w-[120px] text-xl disabled:opacity-60"
            aria-label="Emergency SOS — send alert to caregiver"
          >
            <Siren size={28} aria-hidden />
            SOS
          </button>
        </div>
      </div>

      <SosDialog open={sosOpen} onClose={() => setSosOpen(false)} onConfirm={confirmSos} />
    </section>
  );
}
