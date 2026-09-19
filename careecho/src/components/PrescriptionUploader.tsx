"use client";

import { useCallback, useRef, useState } from "react";
import {
  Camera,
  CheckSquare,
  FileImage,
  ImagePlus,
  Loader2,
  ScanLine,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import type { ScannedMedicine, TimeOfDay } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { todayStr, uid } from "@/lib/mockData";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const PERIOD_DEFAULTS: Record<TimeOfDay, string> = {
  Morning: "08:00",
  Afternoon: "13:00",
  Evening: "20:00",
  Night: "21:30",
};

function normalizePeriod(raw: string): TimeOfDay {
  const t = raw.toLowerCase();
  if (t.includes("afternoon") || t.includes("lunch")) return "Afternoon";
  if (t.includes("evening") || t.includes("dinner")) return "Evening";
  if (t.includes("night") || t.includes("bed")) return "Night";
  return "Morning";
}

const SAMPLES = [
  {
    id: "rx-sample-1",
    label: "Sample 1 — Sunrise Clinic (3 medicines)",
    src: "/samples/rx-sample-1.svg",
  },
  {
    id: "rx-sample-2",
    label: "Sample 2 — Heart & Diabetes Care (4 medicines)",
    src: "/samples/rx-sample-2.svg",
  },
];

interface RowState extends ScannedMedicine {
  include: boolean;
  period: TimeOfDay;
  hhmm: string;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PrescriptionUploader() {
  const { addMedications, pushToast } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/png");
  const [sampleId, setSampleId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [rows, setRows] = useState<RowState[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const acceptFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        pushToast("Please choose an image file (photo of the prescription).", "error");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        pushToast("That image is larger than 8 MB. Please try a smaller photo.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        setPreviewUrl(dataUrl);
        setImageBase64(dataUrl.split(",")[1] ?? null);
        setMimeType(file.type || "image/png");
        setSampleId(null);
        setRows(null);
      };
      reader.readAsDataURL(file);
    },
    [pushToast]
  );

  async function loadSample(sample: (typeof SAMPLES)[number]) {
    setPreviewUrl(sample.src);
    setSampleId(sample.id);
    setRows(null);
    try {
      const res = await fetch(sample.src);
      const text = await res.text();
      setImageBase64(btoa(unescape(encodeURIComponent(text))));
      setMimeType("image/svg+xml");
    } catch {
      setImageBase64(null); // API still works in demo mode without bytes
    }
  }

  async function scan() {
    setScanning(true);
    try {
      const res = await fetch("/api/scan-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType, sampleId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        demo?: boolean;
        medicines?: ScannedMedicine[];
      };
      if (!data.ok || !data.medicines?.length) {
        pushToast("Could not read that prescription. Please try a clearer photo.", "error");
        return;
      }
      if (data.demo) pushToast("Demo Mode: Sample prescription extracted.", "info");
      setRows(
        data.medicines.map((m) => {
          const period = normalizePeriod(m.time);
          const hhmm = m.time.match(/\d{1,2}:\d{2}/)?.[0] ?? PERIOD_DEFAULTS[period];
          return { ...m, include: true, period, hhmm };
        })
      );
    } catch {
      pushToast("Scanner service unreachable — please try again.", "error");
    } finally {
      setScanning(false);
    }
  }

  function reset() {
    setPreviewUrl(null);
    setImageBase64(null);
    setSampleId(null);
    setRows(null);
  }

  function addToSchedule() {
    if (!rows) return;
    const chosen = rows.filter((r) => r.include);
    if (chosen.length === 0) {
      pushToast("Select at least one medicine to add.", "warn");
      return;
    }
    const meds = chosen.map((r) => ({
      id: uid("med"),
      name: r.name,
      dosage: r.dosage,
      quantity: "1 tablet",
      frequency: r.frequency,
      instructions: r.instructions,
      times: [{ id: "t1", time: r.hhmm, period: r.period }],
      active: true,
      addedOn: todayStr(),
      source: "scan" as const,
    }));
    addMedications(meds);
    pushToast(`${meds.length} medicine${meds.length > 1 ? "s" : ""} added to the schedule.`, "success");
    setRows(null);
    reset();
  }

  const selectedCount = rows ? rows.filter((r) => r.include).length : 0;

  return (
    <div className="space-y-6">
      {/* ---------- Step 1: get an image ---------- */}
      <section className="card-surface p-6" aria-label="Upload a prescription">
        <h2 className="text-2xl font-bold">
          <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-sage text-lg text-white">
            1
          </span>
          Add a prescription photo
        </h2>

        {!previewUrl ? (
          <>
            <div
              role="button"
              tabIndex={0}
              aria-label="Drop an image here, or press Enter to choose a file"
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                acceptFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "tap-target mt-5 flex min-h-[14rem] cursor-pointer flex-col items-center justify-center rounded-2xl border-4 border-dashed p-8 text-center transition",
                dragOver ? "border-sage bg-green-50" : "border-line hover:border-sage"
              )}
            >
              <ImagePlus size={48} aria-hidden className="text-sage" />
              <p className="mt-3 text-2xl font-semibold">
                Drag &amp; drop a prescription slip here
              </p>
              <p className="mt-1 text-lg text-soft">or tap to choose a photo / use your camera</p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => cameraRef.current?.click()} className="btn-primary flex-1">
                <Camera size={24} aria-hidden />
                Use camera
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary flex-1">
                <Upload size={24} aria-hidden />
                Choose file
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />

            {/* Sample presets */}
            <div className="mt-6 border-t border-line pt-5">
              <p className="flex items-center gap-2 text-lg font-semibold text-soft">
                <FileImage size={20} aria-hidden /> No photo handy? Try a sample:
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => void loadSample(s)}
                    className="card-surface tap-target flex items-center gap-3 p-3 text-left transition hover:border-sage"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.src}
                      alt={`Preview of ${s.label}`}
                      className="h-20 w-16 shrink-0 rounded-md border border-line object-cover"
                    />
                    <span className="text-lg font-semibold leading-snug">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 flex flex-col gap-5 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Selected prescription"
              className="max-h-96 w-full rounded-xl border border-line object-contain sm:w-72"
            />
            <div className="flex flex-1 flex-col gap-3">
              <p className="text-lg text-soft">
                {sampleId ? "Sample prescription loaded." : "Your image is ready to scan."}
              </p>
              <button
                type="button"
                onClick={() => void scan()}
                disabled={scanning}
                className="btn-sage min-h-[64px] text-xl disabled:opacity-60"
              >
                {scanning ? (
                  <Loader2 size={28} className="animate-spin" aria-hidden />
                ) : (
                  <ScanLine size={28} aria-hidden />
                )}
                {scanning ? "Reading prescription…" : "Scan prescription"}
              </button>
              <button type="button" onClick={reset} className="btn-secondary">
                <Trash2 size={22} aria-hidden />
                Remove image
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ---------- Step 2: review & add ---------- */}
      {rows && (
        <section className="card-surface animate-fadeUp p-6" aria-label="Extracted medicines">
          <h2 className="text-2xl font-bold">
            <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-sage text-lg text-white">
              2
            </span>
            Review extracted medicines
          </h2>
          <p className="mt-1 text-lg text-soft">
            Tap a card to include or exclude it. Adjust the time if needed, then add to the
            schedule.
          </p>

          <ul className="mt-5 space-y-3">
            {rows.map((r, i) => (
              <li
                key={i}
                className={cn(
                  "card-surface p-4 transition",
                  r.include ? "border-sage/60 bg-green-50/40" : "opacity-60"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setRows((rs) =>
                        rs?.map((x, j) => (j === i ? { ...x, include: !x.include } : x)) ?? null
                      )
                    }
                    aria-pressed={r.include}
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    {r.include ? (
                      <CheckSquare size={26} aria-hidden className="text-sage" />
                    ) : (
                      <Square size={26} aria-hidden className="text-soft" />
                    )}
                    {r.name} <span className="font-semibold text-sage">{r.dosage}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <label htmlFor={`period-${i}`} className="sr-only">
                      Time of day for {r.name}
                    </label>
                    <select
                      id={`period-${i}`}
                      className="tap-target rounded-xl border-2 border-line bg-card px-3 py-2 text-base font-semibold"
                      value={r.period}
                      onChange={(e) => {
                        const period = e.target.value as TimeOfDay;
                        setRows((rs) =>
                          rs?.map((x, j) =>
                            j === i ? { ...x, period, hhmm: PERIOD_DEFAULTS[period] } : x
                          ) ?? null
                        );
                      }}
                    >
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                      <option>Night</option>
                    </select>
                    <label htmlFor={`hhmm-${i}`} className="sr-only">
                      Clock time for {r.name}
                    </label>
                    <input
                      id={`hhmm-${i}`}
                      type="time"
                      className="tap-target rounded-xl border-2 border-line bg-card px-3 py-2 text-base font-semibold"
                      value={r.hhmm}
                      onChange={(e) =>
                        setRows((rs) =>
                          rs?.map((x, j) => (j === i ? { ...x, hhmm: e.target.value } : x)) ?? null
                        )
                      }
                    />
                  </div>
                </div>
                <p className="mt-2 text-lg text-soft">
                  {r.frequency}
                  {r.instructions ? ` · ${r.instructions}` : ""}
                </p>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={addToSchedule}
            disabled={selectedCount === 0}
            className="btn-sage mt-6 w-full min-h-[64px] text-xl disabled:opacity-50"
          >
            <CheckSquare size={26} aria-hidden />
            Add {selectedCount > 0 ? `${selectedCount} ` : ""}to Schedule
          </button>
        </section>
      )}
    </div>
  );
}
