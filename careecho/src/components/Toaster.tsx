"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const KIND = {
  info: { icon: Info, cls: "border-line text-ink" },
  success: { icon: CheckCircle2, cls: "border-sage text-sage" },
  warn: { icon: AlertTriangle, cls: "border-amberw text-amberw" },
  error: { icon: XCircle, cls: "border-danger text-danger" },
} as const;

export default function Toaster() {
  const { toasts } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-[90] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => {
        const { icon: Icon, cls } = KIND[t.kind];
        return (
          <div
            key={t.id}
            className={cn(
              "card-surface pointer-events-auto flex max-w-xl animate-fadeUp items-center gap-3 border-2 px-5 py-3.5 text-lg font-semibold shadow-lift",
              cls
            )}
            role="status"
          >
            <Icon size={24} aria-hidden className="shrink-0" />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
