"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Contrast, HeartPulse, ScanLine, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

const TABS = [
  { href: "/", label: "Companion", icon: HeartPulse },
  { href: "/scan", label: "Scan Rx", icon: ScanLine },
  { href: "/caregiver", label: "Caregiver", icon: UserRound },
];

export default function TopNav() {
  const pathname = usePathname();
  const { state, setHighContrast } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-1 py-1 text-xl font-bold tracking-tight"
        >
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-white"
          >
            <HeartPulse size={22} />
          </span>
          Care<span className="text-sage">Echo</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {TABS.map((t) => {
            const active =
              t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "tap-target inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-base font-semibold transition sm:px-4 sm:text-lg",
                  active
                    ? "bg-ink text-white"
                    : "border border-line text-ink hover:border-ink"
                )}
              >
                <Icon size={20} aria-hidden />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ")[0]}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setHighContrast(!state.highContrast)}
            aria-pressed={state.highContrast}
            title="High-contrast mode"
            className={cn(
              "tap-target inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-base font-semibold transition",
              state.highContrast
                ? "border-ink bg-ink text-white"
                : "border-line hover:border-ink"
            )}
          >
            <Contrast size={20} aria-hidden />
            <span className="sr-only sm:not-sr-only">
              {state.highContrast ? "Contrast: On" : "Contrast"}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
