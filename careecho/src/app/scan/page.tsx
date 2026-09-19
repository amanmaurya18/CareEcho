"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import PrescriptionUploader from "@/components/PrescriptionUploader";
import { useApp } from "@/context/AppContext";

export default function ScanPage() {
  const { hydrated } = useApp();
  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-busy>
        <p className="text-2xl text-soft">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="px-1">
        <h1 className="flex items-center gap-3 text-3xl font-bold sm:text-4xl">
          <Sparkles size={32} aria-hidden className="text-sage" />
          Prescription Scanner
        </h1>
        <p className="mt-2 max-w-3xl text-xl text-soft">
          Take a photo of a prescription slip or medicine bottle. CareEcho reads the
          medicines, dosages and timings, and adds them to the daily schedule in one tap.
        </p>
      </section>

      <PrescriptionUploader />

      <p className="flex items-start gap-2 px-2 text-base text-soft">
        <ShieldCheck size={20} aria-hidden className="mt-0.5 shrink-0 text-sage" />
        Images are processed only to extract the schedule and are never stored on our
        servers. Always confirm extracted medicines with your doctor or pharmacist.
      </p>
    </div>
  );
}
