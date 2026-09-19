"use client";

/* ------------------------------------------------------------------ */
/* Speech helpers: recognition (mic → text) and synthesis (text → voice)*/
/* All browser-native; every function feature-detects first.           */
/* ------------------------------------------------------------------ */

import type { SupportedLang } from "./types";

/* ---------------- SpeechRecognition typing shim ------------------- */

interface SpeechRecognitionAltEvent extends Event {
  readonly resultIndex: number;
  readonly results: {
    readonly length: number;
    [index: number]: {
      readonly isFinal: boolean;
      readonly length: number;
      [index: number]: { readonly transcript: string; readonly confidence: number };
    };
  };
}

interface SpeechRecognitionAlt extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: SpeechRecognitionAltEvent) => void) | null;
  onerror: ((ev: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionAlt;

export function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (
    (w.SpeechRecognition as SpeechRecognitionCtor | undefined) ??
    (w.webkitSpeechRecognition as SpeechRecognitionCtor | undefined) ??
    null
  );
}

export type { SpeechRecognitionAlt };

/* ---------------- Synthesis ---------------------------------------- */

export function speak(
  text: string,
  lang: SupportedLang = "en-US",
  opts?: { rate?: number; onEnd?: () => void }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts?.onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = opts?.rate ?? 0.92; // slightly slow & reassuring for seniors
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const match =
      voices.find((v) => v.lang === lang) ??
      voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (match) u.voice = match;
    if (opts?.onEnd) u.onend = () => opts.onEnd?.();
    window.speechSynthesis.speak(u);
  } catch {
    opts?.onEnd?.();
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }
}
