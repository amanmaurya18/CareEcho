"use client";

import { useEffect } from "react";
import { MessageCircle, Siren, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

/**
 * Full-width alert banner — the visual fallback for the SMS/WhatsApp
 * channel. Auto-dismisses after 14 seconds.
 */
export default function AlertBanner() {
  const { liveAlert, dismissLiveAlert } = useApp();

  useEffect(() => {
    if (!liveAlert) return;
    const t = window.setTimeout(dismissLiveAlert, 14_000);
    return () => window.clearTimeout(t);
  }, [liveAlert, dismissLiveAlert]);

  if (!liveAlert) return null;

  const isSos = liveAlert.type === "SOS";
  const Channel = isSos ? Siren : MessageCircle;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed inset-x-0 bottom-0 z-[95] border-t-4 px-4 pb-5 pt-4 sm:px-6 ${
        isSos ? "border-danger bg-red-50" : "border-amberw bg-amber-50"
      }`}
    >
      <div className="mx-auto flex w-full max-w-5xl items-start gap-4">
        <span
          aria-hidden
          className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${
            isSos ? "bg-danger" : "bg-amberw"
          }`}
        >
          <Channel size={26} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-lg font-bold ${isSos ? "text-danger" : "text-amberw"}`}>
            {isSos
              ? "SOS alert sent to caregiver"
              : liveAlert.channel === "whatsapp"
                ? "WhatsApp alert sent to caregiver"
                : "SMS alert sent to caregiver"}
          </p>
          <p className="mt-1 text-lg text-ink">{liveAlert.message}</p>
          <p className="mt-1 text-base text-soft">
            {liveAlert.status === "sent"
              ? "Delivery confirmed by gateway (simulated)."
              : "Gateway unavailable — showing on-screen alert instead."}
          </p>
        </div>
        <button
          type="button"
          onClick={dismissLiveAlert}
          aria-label="Dismiss alert"
          className="tap-target inline-flex items-center justify-center rounded-xl border-2 border-line bg-card p-2.5 hover:border-ink"
        >
          <X size={22} aria-hidden />
        </button>
      </div>
    </div>
  );
}
