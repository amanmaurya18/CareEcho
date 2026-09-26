'use client';

import React, { useState, useEffect } from 'react';
import { useCare } from '@/context/CareContext';
import { TimeOfDay, MedicineForm } from '@/lib/types';
import {
  Pill,
  Clock,
  X,
  Check,
  Sparkles,
  Camera,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Droplets,
  Wind,
  Syringe,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

const COMMON_MEDICATIONS = [
  { name: 'Metformin', dosage: '500mg', form: 'tablet' as MedicineForm, purpose: 'Blood Sugar' },
  { name: 'Amlodipine', dosage: '5mg', form: 'tablet' as MedicineForm, purpose: 'Blood Pressure' },
  { name: 'Aspirin', dosage: '81mg', form: 'tablet' as MedicineForm, purpose: 'Heart Health' },
  { name: 'Atorvastatin', dosage: '20mg', form: 'tablet' as MedicineForm, purpose: 'Cholesterol' },
  { name: 'Vitamin D3', dosage: '1000 IU', form: 'capsule' as MedicineForm, purpose: 'Bone Health' },
  { name: 'Paracetamol', dosage: '650mg', form: 'tablet' as MedicineForm, purpose: 'Pain Relief' },
];

const PRESET_TIMES: Record<TimeOfDay, string> = {
  Morning: '08:00 AM',
  Afternoon: '01:00 PM',
  Evening: '07:30 PM',
  Night: '10:00 PM',
};

const INSTRUCTION_PRESETS = [
  'Take with a full glass of water after food.',
  'Take 30 minutes before meals on an empty stomach.',
  'Take with or right after lunch.',
  'Take at bedtime with water.',
  'Do not crush or chew. Swallow whole.',
];

const PILL_COLORS = ['#2D6A4F', '#40916C', '#D97706', '#4F46E5', '#DC2626', '#0284C7', '#7C3AED'];

export const AddMedicineModal: React.FC = () => {
  const {
    isAddMedicineOpen,
    closeAddMedicine,
    editingMedication,
    addMedication,
    updateMedication,
    patientName,
  } = useCare();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [frequency, setFrequency] = useState('Once daily');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('Morning');
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');
  const [instructions, setInstructions] = useState('Take with a full glass of water after food.');
  const [purpose, setPurpose] = useState('');
  const [pillColor, setPillColor] = useState('#2D6A4F');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state when opening or switching editing medication
  useEffect(() => {
    if (editingMedication) {
      setName(editingMedication.name);
      setDosage(editingMedication.dosage);
      setForm(editingMedication.form);
      setFrequency(editingMedication.frequency);
      setTimeOfDay(editingMedication.timeOfDay);
      setScheduledTime(editingMedication.scheduledTime);
      setInstructions(editingMedication.instructions);
      setPurpose(editingMedication.purpose || '');
      setPillColor(editingMedication.pillColor || '#2D6A4F');
    } else {
      setName('');
      setDosage('');
      setForm('tablet');
      setFrequency('Once daily');
      setTimeOfDay('Morning');
      setScheduledTime('08:00 AM');
      setInstructions('Take with a full glass of water after food.');
      setPurpose('');
      setPillColor('#2D6A4F');
    }
    setValidationError(null);
  }, [editingMedication, isAddMedicineOpen]);

  if (!isAddMedicineOpen) return null;

  const handleTimeOfDayChange = (newTime: TimeOfDay) => {
    setTimeOfDay(newTime);
    setScheduledTime(PRESET_TIMES[newTime]);
  };

  const handleSelectQuickMed = (med: typeof COMMON_MEDICATIONS[0]) => {
    setName(med.name);
    setDosage(med.dosage);
    setForm(med.form);
    setPurpose(med.purpose);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Please enter a medicine name.');
      return;
    }
    if (!dosage.trim()) {
      setValidationError('Please enter a dosage (e.g. 500mg, 1 tablet).');
      return;
    }

    if (editingMedication) {
      updateMedication({
        ...editingMedication,
        name: name.trim(),
        dosage: dosage.trim(),
        form,
        frequency,
        timeOfDay,
        scheduledTime: scheduledTime.trim() || PRESET_TIMES[timeOfDay],
        instructions: instructions.trim() || 'Take with water.',
        purpose: purpose.trim() || 'General health maintenance',
        pillColor,
      });
    } else {
      addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        form,
        frequency,
        timeOfDay,
        scheduledTime: scheduledTime.trim() || PRESET_TIMES[timeOfDay],
        instructions: instructions.trim() || 'Take with water after food.',
        status: 'pending',
        purpose: purpose.trim() || 'General health maintenance',
        pillColor,
      });
    }

    closeAddMedicine();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-med-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-xl bg-[#FFFFFF] border-2 border-zinc-200 card-contrast rounded-3xl p-4 sm:p-8 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closeAddMedicine}
          aria-label="Close dialog"
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-zinc-100 min-h-tap min-w-tap flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 sm:gap-3.5 mb-4 sm:mb-5 pr-8 sm:pr-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sage-100 border border-sage-200 text-sage-700 flex items-center justify-center shadow-xs shrink-0">
            <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-sage-600" />
          </div>
          <div>
            <h2 id="add-med-title" className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {editingMedication ? 'Edit Medication' : 'Add New Medication'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {editingMedication
                ? 'Update medication details and schedule'
                : `Enter your prescription details for ${patientName.split(' ')[0]}`}
            </p>
          </div>
        </div>

        {/* Quick Prescription Scanner Banner */}
        {!editingMedication && (
          <div className="mb-4 sm:mb-5 p-3 rounded-2xl bg-sage-50 border border-sage-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-sage-600 shrink-0" />
              <span className="text-slate-700 font-medium">
                Have a doctor&apos;s slip or medicine box?
              </span>
            </div>
            <Link
              href="/scan"
              onClick={closeAddMedicine}
              className="text-sage-700 hover:text-sage-800 font-bold underline whitespace-nowrap self-end sm:self-auto"
            >
              Scan with AI Camera →
            </Link>
          </div>
        )}

        {/* Validation Alert */}
        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Quick Common Presets (only on new med) */}
          {!editingMedication && (
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_MEDICATIONS.map((med) => (
                  <button
                    key={med.name}
                    type="button"
                    onClick={() => handleSelectQuickMed(med)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-sage-100 hover:text-sage-800 text-slate-700 text-xs font-semibold border border-zinc-200 transition-colors"
                  >
                    + {med.name} {med.dosage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Row 1: Name and Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Medication Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Metformin or Amlodipine"
                className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-sm sm:text-base font-semibold focus:ring-2 focus:ring-sage-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Dosage & Strength <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500mg, 1 tablet, 10ml"
                className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-sm sm:text-base font-semibold focus:ring-2 focus:ring-sage-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Form & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Medicine Form
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as MedicineForm)}
                className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-sm sm:text-base font-semibold focus:ring-2 focus:ring-sage-600 focus:outline-none"
              >
                <option value="tablet">💊 Tablet / Pill</option>
                <option value="capsule">💊 Capsule</option>
                <option value="liquid">🧪 Liquid / Syrup</option>
                <option value="drops">💧 Drops (Eye / Ear)</option>
                <option value="inhaler">💨 Inhaler / Spray</option>
                <option value="injection">💉 Injection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-sm sm:text-base font-semibold focus:ring-2 focus:ring-sage-600 focus:outline-none"
              >
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Every 8 hours">Every 8 hours</option>
                <option value="Every other day">Every other day</option>
                <option value="As needed (PRN)">As needed (PRN)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Time of Day Slots */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              Time of Day Schedule
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleTimeOfDayChange('Morning')}
                className={`p-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 transition-all ${
                  timeOfDay === 'Morning'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                    : 'border-zinc-200 text-slate-600 hover:bg-zinc-50'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span>Morning</span>
                <span className="text-[10px] text-slate-500 font-normal">8:00 AM</span>
              </button>

              <button
                type="button"
                onClick={() => handleTimeOfDayChange('Afternoon')}
                className={`p-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 transition-all ${
                  timeOfDay === 'Afternoon'
                    ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs'
                    : 'border-zinc-200 text-slate-600 hover:bg-zinc-50'
                }`}
              >
                <CloudSun className="w-5 h-5 text-orange-500" />
                <span>Afternoon</span>
                <span className="text-[10px] text-slate-500 font-normal">1:00 PM</span>
              </button>

              <button
                type="button"
                onClick={() => handleTimeOfDayChange('Evening')}
                className={`p-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 transition-all ${
                  timeOfDay === 'Evening'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-xs'
                    : 'border-zinc-200 text-slate-600 hover:bg-zinc-50'
                }`}
              >
                <Sunset className="w-5 h-5 text-indigo-500" />
                <span>Evening</span>
                <span className="text-[10px] text-slate-500 font-normal">7:30 PM</span>
              </button>

              <button
                type="button"
                onClick={() => handleTimeOfDayChange('Night')}
                className={`p-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 transition-all ${
                  timeOfDay === 'Night'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-xs'
                    : 'border-zinc-200 text-slate-600 hover:bg-zinc-50'
                }`}
              >
                <Moon className="w-5 h-5 text-blue-500" />
                <span>Bedtime</span>
                <span className="text-[10px] text-slate-500 font-normal">10:00 PM</span>
              </button>
            </div>
          </div>

          {/* Row 4: Exact Scheduled Time & Health Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Exact Dose Time (e.g. 08:00 AM)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  placeholder="08:00 AM"
                  className="w-full min-h-tap pl-10 pr-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-sm sm:text-base font-semibold focus:ring-2 focus:ring-sage-600 focus:outline-none"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Health Purpose / Condition
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Blood Pressure, Diabetes"
                className="w-full min-h-tap px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-slate-900 text-sm sm:text-base font-semibold focus:ring-2 focus:ring-sage-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 5: Instructions */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
              Instructions for Senior (Spoken in Voice Alarms)
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take 1 tablet with a full glass of water after food."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-slate-900 text-sm font-medium focus:ring-2 focus:ring-sage-600 focus:outline-none"
            />
            {/* Quick Instruction Chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {INSTRUCTION_PRESETS.slice(0, 3).map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => setInstructions(text)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-slate-600 font-medium transition-colors"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* Row 6: Visual Pill Color Tag */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
              Visual Color Identifier
            </label>
            <div className="flex items-center gap-2">
              {PILL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPillColor(color)}
                  aria-label={`Select color ${color}`}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    pillColor === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-110'
                  }`}
                >
                  {pillColor === color && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 sm:pt-4 border-t border-zinc-100 grid grid-cols-2 sm:flex sm:justify-end items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={closeAddMedicine}
              className="min-h-tap px-4 sm:px-5 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="min-h-tap px-4 sm:px-6 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs sm:text-base rounded-xl shadow-md shadow-sage-600/20 flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span className="truncate">{editingMedication ? 'Save Changes' : 'Add Medication'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AddMedicineModal;
