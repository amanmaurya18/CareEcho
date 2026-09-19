"use client";

import { CheckCircle2, PartyPopper, Pill, Volume2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatTime12, periodIconHint } from "@/lib/utils";
import { speak } from "@/lib/speech";

/* ------------------------------------------------------------------ */
/* The hero banner: "what do I take next?" answered in huge type.      */
/* ------------------------------------------------------------------ */

export default function DoseHero() {
  const { nextDose, markTaken, todayStats, state, pushToast } = useApp();

  /* ---- all done for today ---- */
  if (!nextDose) {
    return (
      <section
        className="card-surface border-sage p-8 text-center"
        aria-label="Next medication"
      >
        <span
          aria-hidden
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-sage"
        >
          <PartyPopper size={34} />
        </span>
        <h2 className="text-4xl font-bold text-sage">All done for today!</h2>
        <p className="mt-2 text-xl text-soft">
          You have taken all {todayStats.total} of your doses. Wonderful job. 🌿
        </p>
      </section>
    );
  }

  const { dose, med } = nextDose;
  const time = dose.scheduledAt.slice(11, 16);
  const scheduled = new Date(dose.scheduledAt);
  const isDue = scheduled.getTime() <= Date.now();
  const t = med.times.find((x) => `${med.id}-${x.id}-${dose.date}` === dose.id);
  const period = t?.period ?? "Morning";

  const readAloudText = `It is time for your medicine. ${formatTime12(time)} — ${med.name} ${
    med.dosage
  }, ${med.quantity} with water. ${med.instructions}`;

  function onReadAloud() {
    speak(readAloudText, state.voiceLang, { rate: 0.85 });
    pushToast("Reading your dose aloud…", "info");
  }

  function onTaken() {
    markTaken(dose.id);
    speak(
      state.voiceLang === "hi-IN"
        ? "शाबाश! दवा ले ली गई है।"
        : state.voiceLang === "es-ES"
          ? "¡Muy bien! Medicina registrada."
          : "Well done! Your medicine is marked as taken.",
      state.voiceLang
    );
  }

  return (
    <section
      className={`card-surface p-6 sm:p-8 ${
        isDue ? "border-amberw ring-2 ring-amberw/20" : ""
      }`}
      aria-label="Next medication"
    >
      <p className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wide text-soft">
        <Pill size={20} aria-hidden className="text-sage" />
        {isDue ? "Due now" : "Next dose"} · {periodIconHint(period)} {period}
      </p>

      <p className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl" suppressHydrationWarning>
        {formatTime12(time)}
      </p>
      <h2 className="mt-2 text-4xl font-bold text-ink sm:text-5xl">
        {med.name} <span className="text-sage">{med.dosage}</span>
      </h2>
      <p className="mt-2 text-2xl text-soft">
        {med.quantity} with water
        {med.instructions ? ` — ${med.instructions}` : ""}
      </p>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={onTaken}
          className="btn-sage min-h-[72px] flex-1 text-2xl"
          aria-label={`Mark ${med.name} as taken`}
        >
          <CheckCircle2 size={32} aria-hidden />
          Mark as Taken
        </button>
        <button
          type="button"
          onClick={onReadAloud}
          className="btn-secondary min-h-[72px] flex-1 text-2xl"
          aria-label="Read this dose aloud"
        >
          <Volume2 size={30} aria-hidden />
          Read Aloud
        </button>
      </div>
    </section>
  );
}
