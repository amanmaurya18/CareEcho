"use client";

import { useEffect, useRef, useState } from "react";
import { Keyboard, Loader2, Mic, Sparkles, Volume2, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { chimeVoice } from "@/lib/audio";
import {
  getRecognitionCtor,
  speak,
  stopSpeaking,
  type SpeechRecognitionAlt,
} from "@/lib/speech";
import type { SupportedLang } from "@/lib/types";

type Phase = "idle" | "listening" | "thinking" | "speaking";

const LANGS: { code: SupportedLang; label: string; short: string }[] = [
  { code: "en-US", label: "English", short: "EN" },
  { code: "hi-IN", label: "हिन्दी", short: "हिं" },
  { code: "es-ES", label: "Español", short: "ES" },
];

/* ------------------------------------------------------------------ */
/* Floating voice check-in orb                                         */
/* ------------------------------------------------------------------ */

export default function VoiceAssistantOrb() {
  const { state, setVoiceLang, addCheckIn, pushToast, todayDoses, medById } = useApp();
  const [phase, setPhase] = useState<Phase>("idle");
  const [panelOpen, setPanelOpen] = useState(false);
  const [interim, setInterim] = useState("");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [demo, setDemo] = useState(false);
  const [supported, setSupported] = useState(true);
  const [typed, setTyped] = useState("");
  const recRef = useRef<SpeechRecognitionAlt | null>(null);
  const phaseRef = useRef<Phase>("idle");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    // voices often load async in Chrome
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
  }, []);

  const lang = state.voiceLang;

  /* ---- context hint so the companion can nudge about the next dose ---- */
  function buildContext(): string {
    const next = todayDoses.find((d) => d.status === "pending");
    if (!next) return "All of today's medicines are already taken.";
    const med = medById(next.medicationId);
    return `Next scheduled medicine: ${med?.name ?? ""} ${med?.dosage ?? ""} at ${next.scheduledAt.slice(
      11,
      16
    )}.`;
  }

  /* ---- send a transcript (voice or typed) to the companion API ---- */
  async function ask(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setTranscript(clean);
    setInterim("");
    setPhase("thinking");
    let response = "";
    let isDemo = false;
    try {
      const res = await fetch("/api/voice-companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: clean, language: lang, context: buildContext() }),
      });
      const data = (await res.json()) as { response?: string; demo?: boolean };
      response = data.response ?? "";
      isDemo = !!data.demo;
    } catch {
      /* network down — fall through to offline line */
    }
    if (!response) {
      response =
        lang === "hi-IN"
          ? "मैं अभी आपकी बात सुन रही हूँ। कृपया स्क्रीन पर दिखाई दे रही दवाइयों के बारे में पूछिए।"
          : lang === "es-ES"
            ? "Estoy aquí con usted. Pregúnteme por sus medicinas cuando quiera."
            : "I am right here with you. Ask me about your medicines, or how your day is going.";
      isDemo = true;
    }
    setReply(response);
    setDemo(isDemo);
    addCheckIn({ lang, transcript: clean, response });
    if (isDemo) pushToast("Demo Mode: scripted companion reply.", "info");

    setPhase("speaking");
    speak(response, lang, {
      rate: 0.9,
      onEnd: () => {
        if (phaseRef.current === "speaking") setPhase("idle");
      },
    });
  }

  /* ---- microphone flow ---- */
  function startListening() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      setPanelOpen(true);
      pushToast("Microphone not supported here — you can type instead.", "warn");
      return;
    }
    stopSpeaking();
    chimeVoice();
    setPanelOpen(true);
    setInterim("");
    setPhase("listening");

    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let gotFinal = false;
    rec.onresult = (ev) => {
      let interimText = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) {
          gotFinal = true;
          void ask(r[0].transcript);
        } else {
          interimText += r[0].transcript;
        }
      }
      if (!gotFinal) setInterim(interimText);
    };
    rec.onerror = (ev) => {
      const err = (ev as Event & { error?: string }).error;
      if (err === "not-allowed" || err === "service-not-allowed") {
        pushToast("Microphone permission blocked. Allow the mic, or type below.", "error");
        setSupported(false);
      } else if (err === "no-speech") {
        pushToast("I did not hear anything — tap the orb and try again.", "warn");
      }
      setPhase("idle");
    };
    rec.onend = () => {
      if (!gotFinal && phaseRef.current === "listening") setPhase("idle");
    };
    try {
      rec.start();
    } catch {
      setPhase("idle");
    }
  }

  function stopListening() {
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    setPhase("idle");
  }

  function closePanel() {
    stopListening();
    stopSpeaking();
    setPanelOpen(false);
    setPhase("idle");
  }

  const orbActive = phase === "listening";

  return (
    <>
      {/* ---------------- Conversation panel ---------------- */}
      {panelOpen && (
        <div
          className="fixed bottom-28 right-4 z-[70] w-[min(26rem,calc(100vw-2rem))] sm:right-6"
          role="dialog"
          aria-label="Voice companion"
        >
          <div className="card-surface animate-fadeUp border-2 p-5 shadow-lift">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Sparkles size={22} aria-hidden className="text-sage" />
                Voice Check-In
              </h2>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close voice companion"
                className="tap-target inline-flex items-center justify-center rounded-xl border border-line p-2 hover:border-ink"
              >
                <X size={22} aria-hidden />
              </button>
            </div>

            {/* language selector */}
            <div className="mt-4 flex gap-2" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setVoiceLang(l.code)}
                  aria-pressed={lang === l.code}
                  className={cn(
                    "tap-target flex-1 rounded-xl border-2 px-2 py-2 text-base font-bold transition",
                    lang === l.code
                      ? "border-sage bg-sage text-white"
                      : "border-line hover:border-sage"
                  )}
                >
                  {l.short}
                  <span className="sr-only"> — {l.label}</span>
                </button>
              ))}
            </div>

            <div aria-live="polite" className="mt-4 min-h-[7rem] space-y-3">
              {phase === "listening" && (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-lg text-amberw">
                  🎙️ Listening… speak now{interim ? `: “${interim}”` : ""}
                </p>
              )}
              {phase === "thinking" && (
                <p className="flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-lg text-soft">
                  <Loader2 size={20} className="animate-spin" aria-hidden /> Thinking…
                </p>
              )}
              {transcript && phase !== "listening" && (
                <p className="rounded-xl border border-line bg-zinc-50 px-4 py-3 text-lg text-soft">
                  <strong className="text-ink">You said:</strong> “{transcript}”
                </p>
              )}
              {reply && (
                <p className="rounded-xl bg-green-50 px-4 py-3 text-lg font-medium text-sage">
                  <strong>CareEcho:</strong> {reply}
                  {demo && (
                    <span className="mt-1 block text-sm font-normal text-soft">
                      Demo Mode: scripted reply
                    </span>
                  )}
                </p>
              )}
              {!reply && phase === "idle" && (
                <p className="px-1 text-lg text-soft">
                  Tap the big round button and say anything — “Did I take my morning
                  tablet?” or just “Hello!”
                </p>
              )}
            </div>

            {/* typing fallback (always available; required when mic unsupported) */}
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setTyped("");
                void ask(typed);
              }}
            >
              <label htmlFor="voice-typed" className="sr-only">
                Type a message instead of speaking
              </label>
              <input
                id="voice-typed"
                className="input-lg flex-1"
                placeholder={supported ? "Or type a message…" : "Type your message…"}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
              />
              <button type="submit" className="btn-primary px-4" aria-label="Send message">
                <Volume2 size={22} aria-hidden />
              </button>
            </form>
            {!supported && (
              <p className="mt-2 flex items-center gap-1.5 text-base text-amberw">
                <Keyboard size={16} aria-hidden /> Microphone unavailable in this browser —
                typing works just as well.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---------------- The orb ---------------- */}
      <button
        type="button"
        onClick={() => (orbActive ? stopListening() : startListening())}
        onDoubleClick={() => setPanelOpen(true)}
        aria-label={
          orbActive ? "Stop listening" : "Talk to the CareEcho voice companion"
        }
        className={cn(
          "fixed bottom-6 right-4 z-[75] flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lift transition-transform active:scale-95 sm:right-6",
          orbActive ? "bg-amberw" : "bg-sage hover:scale-105"
        )}
      >
        {orbActive && (
          <span
            aria-hidden
            className="absolute inset-0 animate-pulseRing rounded-full bg-amberw"
          />
        )}
        {!orbActive && phase === "idle" && (
          <span
            aria-hidden
            className="absolute inset-0 animate-pulseRing rounded-full bg-sage"
          />
        )}
        {phase === "thinking" || phase === "speaking" ? (
          <Loader2 size={40} className="relative animate-spin" aria-hidden />
        ) : (
          <Mic size={40} className="relative" aria-hidden />
        )}
        <span className="sr-only">Voice assistant</span>
      </button>
    </>
  );
}
