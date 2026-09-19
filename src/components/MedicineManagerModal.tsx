'use client';

import React, { useState } from 'react';
import { useCare } from '@/context/CareContext';
import { Medication, TimeOfDay, MedicineForm } from '@/lib/types';
import {
  Plus,
  Trash2,
  Edit2,
  Pill,
  Clock,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';

export const MedicineManagerModal: React.FC = () => {
  const {
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    resetToDefaults,
  } = useCare();

  const [isOpen, setIsOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [frequency, setFrequency] = useState('Once daily');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('Morning');
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');
  const [instructions, setInstructions] = useState('');
  const [purpose, setPurpose] = useState('');

  const openNewForm = () => {
    setEditingMed(null);
    setName('');
    setDosage('');
    setForm('tablet');
    setFrequency('Once daily');
    setTimeOfDay('Morning');
    setScheduledTime('08:00 AM');
    setInstructions('Take with water after food.');
    setPurpose('');
    setIsOpen(true);
  };

  const openEditForm = (med: Medication) => {
    setEditingMed(med);
    setName(med.name);
    setDosage(med.dosage);
    setForm(med.form);
    setFrequency(med.frequency);
    setTimeOfDay(med.timeOfDay);
    setScheduledTime(med.scheduledTime);
    setInstructions(med.instructions);
    setPurpose(med.purpose || '');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMed) {
      updateMedication({
        ...editingMed,
        name: name.trim(),
        dosage: dosage.trim(),
        form,
        frequency,
        timeOfDay,
        scheduledTime,
        instructions: instructions.trim(),
        purpose: purpose.trim(),
      });
    } else {
      addMedication({
        name: name.trim(),
        dosage: dosage.trim() || 'Standard Dose',
        form,
        frequency,
        timeOfDay,
        scheduledTime,
        instructions: instructions.trim() || 'Take with water.',
        status: 'pending',
        purpose: purpose.trim() || 'Health maintenance',
        pillColor: '#2D6A4F',
      });
    }

    setIsOpen(false);
  };

  return (
    <div className="bg-[#FFFFFF] border-2 border-zinc-200 card-contrast rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-sage-600" />
            Recurring Medication Manager
          </h3>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Maintain the elder&apos;s daily medication regimen. Add new doctor prescriptions or remove outdated pills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            title="Reset sample data to initial state"
            className="min-h-tap px-3.5 py-2 border border-zinc-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-zinc-100 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={openNewForm}
            className="min-h-tap px-4 py-2.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-bold text-base flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Medication List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Medication</th>
              <th className="py-3 px-4">Dosage</th>
              <th className="py-3 px-4">Schedule</th>
              <th className="py-3 px-4 hidden md:table-cell">Instructions</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-sm sm:text-base">
            {medications.map((med) => (
              <tr key={med.id} className="hover:bg-zinc-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{med.name}</div>
                  <div className="text-xs text-slate-500 capitalize">
                    {med.form || 'tablet'}{med.purpose ? ` • ${med.purpose}` : ''}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-sage-700">
                  {med.dosage}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800">
                    {med.scheduledTime}
                  </div>
                  <div className="text-xs text-slate-500">{med.timeOfDay}</div>
                </td>
                <td className="py-3.5 px-4 hidden md:table-cell text-slate-600 text-sm max-w-xs">
                  {med.instructions}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditForm(med)}
                      aria-label={`Edit ${med.name}`}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-zinc-200 rounded-lg min-h-tap min-w-tap flex items-center justify-center"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMedication(med.id)}
                      aria-label={`Delete ${med.name}`}
                      className="p-2 text-sos-600 hover:text-sos-700 hover:bg-sos-50 rounded-lg min-h-tap min-w-tap flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Medication Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#FFFFFF] border-2 border-zinc-300 card-contrast rounded-3xl p-5 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close dialog"
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-zinc-100 min-h-tap min-w-tap flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {editingMed ? 'Edit Medication' : 'Add New Medication'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lisinopril"
                    className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-base focus:ring-2 focus:ring-sage-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 10mg, 1 tablet"
                    className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-base focus:ring-2 focus:ring-sage-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Form
                  </label>
                  <select
                    value={form}
                    onChange={(e) => setForm(e.target.value as MedicineForm)}
                    className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-base focus:ring-2 focus:ring-sage-600"
                  >
                    <option value="tablet">💊 Tablet</option>
                    <option value="capsule">💊 Capsule</option>
                    <option value="liquid">🧪 Liquid / Syrup</option>
                    <option value="drops">💧 Drops</option>
                    <option value="inhaler">💨 Inhaler</option>
                    <option value="injection">💉 Injection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Time of Day
                  </label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                    className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-base focus:ring-2 focus:ring-sage-600"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-base focus:ring-2 focus:ring-sage-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Purpose / Condition
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Blood Pressure, Diabetes, Pain Relief"
                  className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-base focus:ring-2 focus:ring-sage-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Instructions for Senior
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take 1 tablet with a glass of water after breakfast."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-base focus:ring-2 focus:ring-sage-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="min-h-tap px-4 py-2 rounded-xl border border-zinc-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-tap px-6 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {editingMed ? 'Save Changes' : 'Add Medication'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
