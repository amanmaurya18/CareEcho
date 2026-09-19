"use client";

import { useState } from "react";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";
import type { DoseTime, Medication, TimeOfDay } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import Modal from "@/components/Modal";
import { cn, formatTime12 } from "@/lib/utils";
import { todayStr, uid } from "@/lib/mockData";

const PERIODS: TimeOfDay[] = ["Morning", "Afternoon", "Evening", "Night"];

interface FormState {
  id: string | null;
  name: string;
  dosage: string;
  quantity: string;
  frequency: string;
  instructions: string;
  active: boolean;
  times: DoseTime[];
}

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  dosage: "",
  quantity: "1 tablet",
  frequency: "Once daily",
  instructions: "",
  active: true,
  times: [{ id: uid("t"), time: "08:00", period: "Morning" }],
};

/* ------------------------------------------------------------------ */
/* Medicine Manager: table + add/edit modal + pause/delete             */
/* ------------------------------------------------------------------ */

export default function MedicineManager() {
  const { state, addMedications, updateMedication, deleteMedication, toggleMedicationActive, pushToast } =
    useApp();
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Medication | null>(null);

  function openAdd() {
    setForm({ ...EMPTY_FORM, times: [{ id: uid("t"), time: "08:00", period: "Morning" }] });
  }

  function openEdit(m: Medication) {
    setForm({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      quantity: m.quantity,
      frequency: m.frequency,
      instructions: m.instructions,
      active: m.active,
      times: m.times.map((t) => ({ ...t })),
    });
  }

  function save() {
    if (!form) return;
    if (!form.name.trim()) {
      pushToast("Please enter the medicine name.", "warn");
      return;
    }
    if (form.times.length === 0) {
      pushToast("Add at least one daily time.", "warn");
      return;
    }
    if (form.id) {
      updateMedication({
        id: form.id,
        name: form.name.trim(),
        dosage: form.dosage.trim(),
        quantity: form.quantity.trim() || "1 tablet",
        frequency: form.frequency.trim() || "Once daily",
        instructions: form.instructions.trim(),
        active: form.active,
        times: form.times,
        addedOn:
          state.medications.find((m) => m.id === form.id)?.addedOn ?? todayStr(),
        source: state.medications.find((m) => m.id === form.id)?.source ?? "manual",
      });
      pushToast(`${form.name} updated.`, "success");
    } else {
      addMedications([
        {
          id: uid("med"),
          name: form.name.trim(),
          dosage: form.dosage.trim(),
          quantity: form.quantity.trim() || "1 tablet",
          frequency: form.frequency.trim() || "Once daily",
          instructions: form.instructions.trim(),
          active: form.active,
          times: form.times,
          addedOn: todayStr(),
          source: "manual",
        },
      ]);
      pushToast(`${form.name} added to the schedule.`, "success");
    }
    setForm(null);
  }

  return (
    <section className="card-surface p-6" aria-label="Medicine manager">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Medicine Manager</h2>
        <button type="button" onClick={openAdd} className="btn-primary">
          <Plus size={24} aria-hidden />
          Add medicine
        </button>
      </div>

      {/* Table (desktop) / cards (mobile) */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-line text-base uppercase tracking-wide text-soft">
              <th scope="col" className="px-3 py-3">Medicine</th>
              <th scope="col" className="px-3 py-3">Dosage</th>
              <th scope="col" className="px-3 py-3">Daily times</th>
              <th scope="col" className="px-3 py-3">Frequency</th>
              <th scope="col" className="px-3 py-3">Status</th>
              <th scope="col" className="px-3 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {state.medications.map((m) => (
              <tr
                key={m.id}
                className={cn("border-b border-line align-top", !m.active && "opacity-50")}
              >
                <td className="px-3 py-4">
                  <p className="text-xl font-bold">{m.name}</p>
                  {m.instructions && (
                    <p className="mt-0.5 max-w-xs text-base text-soft italic">
                      {m.instructions}
                    </p>
                  )}
                </td>
                <td className="px-3 py-4 text-lg">{m.dosage || "—"}</td>
                <td className="px-3 py-4 text-lg">
                  {m.times.map((t) => formatTime12(t.time)).join(", ") || "—"}
                </td>
                <td className="px-3 py-4 text-lg">{m.frequency}</td>
                <td className="px-3 py-4">
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-base font-bold",
                      m.active
                        ? "border-sage/40 bg-green-100 text-sage"
                        : "border-line bg-zinc-100 text-soft"
                    )}
                  >
                    {m.active ? "Active" : "Paused"}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      aria-label={`Edit ${m.name}`}
                      title="Edit"
                      className="tap-target inline-flex items-center justify-center rounded-xl border border-line p-2.5 hover:border-ink"
                    >
                      <Pencil size={20} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleMedicationActive(m.id)}
                      aria-label={m.active ? `Pause ${m.name}` : `Resume ${m.name}`}
                      aria-pressed={m.active}
                      title={m.active ? "Pause" : "Resume"}
                      className="tap-target inline-flex items-center justify-center rounded-xl border border-line p-2.5 hover:border-ink"
                    >
                      <Power size={20} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(m)}
                      aria-label={`Remove ${m.name}`}
                      title="Remove"
                      className="tap-target inline-flex items-center justify-center rounded-xl border border-danger/40 p-2.5 text-danger hover:bg-red-50"
                    >
                      <Trash2 size={20} aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {state.medications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-xl text-soft">
                  No medicines yet — add one, or scan a prescription.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- add / edit modal ---------------- */}
      <Modal
        open={form !== null}
        title={form?.id ? "Edit medicine" : "Add medicine"}
        onClose={() => setForm(null)}
      >
        {form && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="med-name" className="mb-1 block text-lg font-semibold">
                  Medicine name *
                </label>
                <input
                  id="med-name"
                  className="input-lg"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Metformin"
                />
              </div>
              <div>
                <label htmlFor="med-dosage" className="mb-1 block text-lg font-semibold">
                  Dosage
                </label>
                <input
                  id="med-dosage"
                  className="input-lg"
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                  placeholder="e.g. 500 mg"
                />
              </div>
              <div>
                <label htmlFor="med-qty" className="mb-1 block text-lg font-semibold">
                  Quantity per dose
                </label>
                <input
                  id="med-qty"
                  className="input-lg"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="e.g. 1 tablet"
                />
              </div>
              <div>
                <label htmlFor="med-freq" className="mb-1 block text-lg font-semibold">
                  Frequency
                </label>
                <input
                  id="med-freq"
                  className="input-lg"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  placeholder="e.g. Twice daily"
                />
              </div>
            </div>

            <div>
              <label htmlFor="med-instr" className="mb-1 block text-lg font-semibold">
                Instructions
              </label>
              <input
                id="med-instr"
                className="input-lg"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="e.g. After food, with water"
              />
            </div>

            {/* times editor */}
            <fieldset>
              <legend className="mb-2 text-lg font-semibold">Daily times</legend>
              <ul className="space-y-2">
                {form.times.map((t, i) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-2">
                    <label htmlFor={`t-time-${t.id}`} className="sr-only">
                      Time {i + 1}
                    </label>
                    <input
                      id={`t-time-${t.id}`}
                      type="time"
                      className="tap-target rounded-xl border-2 border-line bg-card px-3 py-2 text-lg"
                      value={t.time}
                      onChange={(e) => {
                        const times = form.times.map((x) =>
                          x.id === t.id ? { ...x, time: e.target.value } : x
                        );
                        setForm({ ...form, times });
                      }}
                    />
                    <label htmlFor={`t-period-${t.id}`} className="sr-only">
                      Period {i + 1}
                    </label>
                    <select
                      id={`t-period-${t.id}`}
                      className="tap-target rounded-xl border-2 border-line bg-card px-3 py-2 text-lg"
                      value={t.period}
                      onChange={(e) => {
                        const times = form.times.map((x) =>
                          x.id === t.id ? { ...x, period: e.target.value as TimeOfDay } : x
                        );
                        setForm({ ...form, times });
                      }}
                    >
                      {PERIODS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, times: form.times.filter((x) => x.id !== t.id) })
                      }
                      aria-label={`Remove time ${formatTime12(t.time)}`}
                      className="tap-target inline-flex items-center justify-center rounded-xl border border-danger/40 p-2.5 text-danger hover:bg-red-50"
                    >
                      <Trash2 size={20} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    times: [...form.times, { id: uid("t"), time: "20:00", period: "Evening" }],
                  })
                }
                className="btn-secondary mt-3"
              >
                <Plus size={22} aria-hidden />
                Add another time
              </button>
            </fieldset>

            <label className="flex items-center gap-3 text-lg font-semibold">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-6 w-6 accent-[#2D6A4F]"
              />
              Active (include in daily schedule)
            </label>

            <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
              <button type="button" onClick={save} className="btn-sage flex-1">
                {form.id ? "Save changes" : "Add to schedule"}
              </button>
              <button type="button" onClick={() => setForm(null)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------- delete confirmation ---------------- */}
      <Modal
        open={confirmDelete !== null}
        title="Remove medicine?"
        onClose={() => setConfirmDelete(null)}
      >
        {confirmDelete && (
          <div>
            <p className="text-xl text-soft">
              <strong className="text-ink">
                {confirmDelete.name} {confirmDelete.dosage}
              </strong>{" "}
              will be removed from the schedule. This cannot be undone.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="btn-danger-outline flex-1"
                onClick={() => {
                  deleteMedication(confirmDelete.id);
                  pushToast(`${confirmDelete.name} removed.`, "success");
                  setConfirmDelete(null);
                }}
              >
                <Trash2 size={22} aria-hidden />
                Yes, remove
              </button>
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => setConfirmDelete(null)}
              >
                Keep it
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
