"use client";

import { AlertTriangle, CheckCircle2, Clock3, MessageCircle, RotateCcw, Volume2 } from "lucide-react";
import type { Dose, Medication } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { cn, formatClockTime, formatTime12, periodIconHint } from "@/lib/utils";
import { speak } from "@/lib/speech";

interface Props {
  dose: Dose;
  med: Medication;
}

const STATUS_META = {
  taken: {
    label: "Taken",
    chip: "bg-green-100 text-sage border-sage/40",
    dot: "bg-sage",
    Icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    chip: "bg-amber-100 text-amberw border-amberw/40",
    dot: "bg-amberw",
    Icon: Clock3,
  },
  missed: {
    label: "Missed",
    chip: "bg-red-100 text-danger border-danger/40",
    dot: "bg-danger",
    Icon: AlertTriangle,
  },
} as const;

/* ------------------------------------------------------------------ */
/* One accessible pill card per scheduled dose                         */
/* ------------------------------------------------------------------ */

export default function MedicationCard({ dose, med }: Props) {
  const { markTaken, undoTaken, sendAlert, state, pushToast } = useApp();
  const meta = STATUS_META[dose.status];
  const time = dose.scheduledAt.slice(11, 16);
  const t = med.times.find((x) => `${med.id}-${x.id}-${dose.date}` === dose.id);
  const isOverduePending =
    dose.status === "pending" && new Date(dose.scheduledAt).getTime() < Date.now();

  function readAloud() {
    const line = `${formatTime12(time)}: ${med.name} ${med.dosage}. ${med.quantity}. ${med.instructions}`;
    speak(line, state.voiceLang, { rate: 0.85 });
  }

  return (
    <article
      className={cn(
        "card-surface flex flex-col gap-4 p-5",
        dose.status === "missed" && "border-danger/60",
        isOverduePending && "border-amberw/60"
      )}
      aria-label={`${med.name} ${med.dosage} at ${formatTime12(time)} — ${meta.label}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={cn("mt-1.5 h-4 w-4 shrink-0 rounded-full", meta.dot)}
          />
          <div>
            <h3 className="text-2xl font-bold leading-tight text-ink">
              {med.name} <span className="font-semibold text-sage">{med.dosage}</span>
            </h3>
            <p className="mt-0.5 text-lg text-soft">
              {med.quantity} · {periodIconHint(t?.period ?? "")} {formatTime12(time)} ·{" "}
              {med.frequency}
            </p>
            {med.instructions && (
              <p className="mt-1 text-lg text-soft italic">{med.instructions}</p>
            )}
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-base font-bold",
            meta.chip
          )}
        >
          {meta.label}
          {dose.status === "taken" && dose.takenAt ? ` · ${formatClockTime(dose.takenAt)}` : ""}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-line pt-4">
        {dose.status === "pending" && (
          <button
            type="button"
            onClick={() => markTaken(dose.id)}
            className="btn-sage flex-1"
            aria-label={`Mark ${med.name} as taken`}
          >
            <CheckCircle2 size={24} aria-hidden />
            Mark as Taken
          </button>
        )}

        {dose.status === "taken" && (
          <button
            type="button"
            onClick={() => undoTaken(dose.id)}
            className="btn-secondary flex-1"
            aria-label={`Undo — ${med.name} was not taken`}
          >
            <RotateCcw size={22} aria-hidden />
            Oops, undo
          </button>
        )}

        {dose.status === "missed" && (
          <>
            <button
              type="button"
              onClick={() => markTaken(dose.id)}
              className="btn-sage flex-1"
              aria-label={`Mark ${med.name} as taken now (late)`}
            >
              <CheckCircle2 size={24} aria-hidden />
              Taken (late)
            </button>
            <button
              type="button"
              onClick={async () => {
                await sendAlert(
                  "MISSED_DOSE",
                  `${med.name} ${med.dosage} (${formatTime12(time)}) was missed.`
                );
                pushToast("Caregiver alerted about this missed dose.", "warn");
              }}
              className="btn-danger-outline flex-1"
              aria-label="Alert caregiver about this missed dose"
            >
              <MessageCircle size={24} aria-hidden />
              Alert caregiver
            </button>
          </>
        )}

        <button
          type="button"
          onClick={readAloud}
          className="btn-secondary"
          aria-label={`Read ${med.name} details aloud`}
          title="Read aloud"
        >
          <Volume2 size={22} aria-hidden />
          <span className="sr-only sm:not-sr-only">Read aloud</span>
        </button>
      </div>
    </article>
  );
}
