"use client";

import { CalendarCheck2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import SeniorHeader from "@/components/SeniorHeader";
import DoseHero from "@/components/DoseHero";
import MedicationCard from "@/components/MedicationCard";
import VoiceAssistantOrb from "@/components/VoiceAssistantOrb";

export default function SeniorHome() {
  const { hydrated, todayDoses, medById, todayStats, weekPct } = useApp();

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-busy>
        <p className="text-2xl text-soft">Loading your CareEcho…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SeniorHeader />
      <DoseHero />

      {/* Progress summary strip */}
      <section
        className="card-surface flex flex-wrap items-center justify-between gap-4 px-6 py-4"
        aria-label="Today's progress"
      >
        <p className="flex items-center gap-2 text-xl font-semibold">
          <CalendarCheck2 size={24} aria-hidden className="text-sage" />
          Today: {todayStats.taken} of {todayStats.total} doses taken
          {todayStats.missed > 0 && (
            <span className="font-bold text-danger">· {todayStats.missed} missed</span>
          )}
        </p>
        <div
          className="h-4 w-full max-w-xs overflow-hidden rounded-full bg-zinc-200"
          role="progressbar"
          aria-valuenow={todayStats.pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Today's adherence"
        >
          <div
            className="h-full rounded-full bg-sage transition-all duration-700"
            style={{ width: `${todayStats.pct}%` }}
          />
        </div>
        <p className="text-lg text-soft">
          This week: <strong className="text-sage">{weekPct}%</strong>
        </p>
      </section>

      {/* Today's full schedule */}
      <section aria-label="Today's medication schedule">
        <h2 className="mb-3 px-1 text-2xl font-bold">Today&rsquo;s schedule</h2>
        {todayDoses.length === 0 ? (
          <p className="card-surface p-6 text-xl text-soft">
            No medicines scheduled for today. Ask a caregiver to add some, or scan a
            prescription.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {todayDoses.map((d) => {
              const med = medById(d.medicationId);
              return med ? <MedicationCard key={d.id} dose={d} med={med} /> : null;
            })}
          </div>
        )}
      </section>

      <VoiceAssistantOrb />
    </div>
  );
}
