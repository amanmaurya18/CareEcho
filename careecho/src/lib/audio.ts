"use client";

/* ------------------------------------------------------------------ */
/* Tiny Web Audio chimes — no assets, no dependencies.                 */
/* Each helper degrades silently if AudioContext is unavailable.       */
/* ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  startAt: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.12
) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + startAt;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** Warm two-note "done" chime for Mark-as-Taken. */
export function chimeTaken() {
  tone(523.25, 0, 0.22, "sine", 0.14); // C5
  tone(783.99, 0.14, 0.32, "sine", 0.14); // G5
}

/** Soft single blip when the voice orb starts/stops listening. */
export function chimeVoice() {
  tone(659.25, 0, 0.16, "sine", 0.1); // E5
}

/** Three-beat attention chime for missed dose / alerts. */
export function chimeAlert() {
  tone(880, 0, 0.16, "triangle", 0.12);
  tone(880, 0.22, 0.16, "triangle", 0.12);
  tone(659.25, 0.44, 0.3, "triangle", 0.12);
}

/** Urgent low-high sweep for SOS confirmation. */
export function chimeSos() {
  tone(392, 0, 0.25, "square", 0.08); // G4
  tone(523.25, 0.2, 0.25, "square", 0.08); // C5
  tone(784, 0.4, 0.45, "square", 0.08); // G5
}
