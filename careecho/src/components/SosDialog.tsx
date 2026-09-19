"use client";

import { useEffect } from "react";
import { Siren } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SosDialog({ open, onClose, onConfirm }: Props) {
  const { state } = useApp();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card-surface w-full max-w-lg animate-fadeUp border-danger p-8 text-center">
        <span
          aria-hidden
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-danger"
        >
          <Siren size={34} />
        </span>
        <h2 id="sos-title" className="text-3xl font-bold text-ink">
          Send emergency SOS?
        </h2>
        <p className="mt-3 text-xl text-soft">
          {state.settings.caregiverName} will be alerted on{" "}
          <strong className="text-ink">{state.settings.phone}</strong> right away.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onConfirm} className="btn-danger-outline flex-1 text-xl">
            Yes — Send SOS
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
