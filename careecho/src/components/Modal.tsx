"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card-surface my-8 w-full max-w-2xl animate-fadeUp p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-3xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="tap-target inline-flex items-center justify-center rounded-xl border border-line p-2.5 hover:border-ink"
          >
            <X size={24} aria-hidden />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
