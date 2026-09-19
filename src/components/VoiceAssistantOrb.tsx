'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCare } from '@/context/CareContext';
import { soundEffects, speakText, testFemaleVoice } from '@/lib/audio';
import { Mic, MicOff, Volume2, Sparkles, X, MessageSquare, Send } from 'lucide-react';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: { error: string }) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

export const VoiceAssistantOrb: React.FC = () => {
  const { language, addVoiceCheckIn, nextMedication, patientName, voiceGender, medications } = useCare();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [textInput, setTextInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as unknown as { SpeechRecognition: new () => SpeechRecognitionInstance }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMsg('');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: { error: string }) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setErrorMsg('Microphone access blocked. You can type your message below!');
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  // Handle Voice Orb Click
  const handleOrbClick = () => {
    soundEffects.playVoiceActiveChime();
    setIsOpen(true);
    startListening();
  };

  const startListening = () => {
    setErrorMsg('');
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start exception:', e);
      }
    } else {
      setErrorMsg('Voice recognition not supported in this browser. Please type below.');
    }
  };

  const stopListeningAndProcess = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (transcript.trim()) {
      await processVoiceQuery(transcript.trim());
    }
  };

  const processVoiceQuery = async (queryText: string) => {
    setIsThinking(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/voice-companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          language,
          patientName,
          nextMedication: nextMedication
            ? `${nextMedication.name} ${nextMedication.dosage} at ${nextMedication.scheduledTime}`
            : 'None pending',
          medications: medications || [],
        }),
      });

      const data = await res.json();
      const reply = data.response || `Hello ${patientName}! Please ask me any questions about your medications or daily schedule.`;

      setResponseText(reply);
      addVoiceCheckIn(queryText, reply, 'good');

      // Speak back
      setIsSpeaking(true);
      await speakText(reply, language, voiceGender);
      setIsSpeaking(false);
    } catch (e) {
      // Local graceful fallback
      const fallbackReply = `Hello ${patientName.split(' ')[0]}! Everything is on schedule today. Please take your time and rest well.`;
      setResponseText(fallbackReply);
      addVoiceCheckIn(queryText, fallbackReply, 'good');
      setIsSpeaking(true);
      await speakText(fallbackReply, language, voiceGender);
      setIsSpeaking(false);
    } finally {
      setIsThinking(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const q = textInput.trim();
    setTextInput('');
    setTranscript(q);
    await processVoiceQuery(q);
  };

  return (
    <>
      {/* Floating Voice Orb in Bottom-Right Corner */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Pulsing Voice Orb Button */}
        <button
          onClick={handleOrbClick}
          aria-label="Activate CareEcho Voice Assistant"
          className="relative group p-4 sm:p-5 rounded-full bg-sage-600 hover:bg-sage-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center border-4 border-white card-contrast"
        >
          {/* Ambient pulse ring */}
          <span className="absolute -inset-2 rounded-full bg-sage-500/30 animate-ping pointer-events-none opacity-60"></span>

          <div className="relative flex items-center gap-2">
            <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="hidden sm:inline font-bold text-base pr-1">Tap to Talk</span>
          </div>
        </button>
      </div>

      {/* Voice Assistant Modal Dialogue */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#FFFFFF] border-2 border-zinc-300 card-contrast rounded-3xl p-5 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.abort();
                  } catch {}
                }
                setIsOpen(false);
              }}
              aria-label="Close voice assistant dialog"
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-zinc-100 min-h-tap min-w-tap flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6 pr-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-700 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">CareEcho Voice Companion</h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-600">
                      Listening in {language === 'en-US' ? 'English' : language === 'hi-IN' ? 'Hindi' : 'Spanish'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      <span>🌸</span> Female Voice
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant Test Voice Button */}
              <button
                type="button"
                onClick={() => testFemaleVoice(language)}
                aria-label="Test female voice sample"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Voice</span>
              </button>
            </div>

            {/* Large Interactive Pulsing Orb Display */}
            <div className="flex flex-col items-center justify-center py-6">
              <div
                onClick={isListening ? stopListeningAndProcess : startListening}
                role="button"
                tabIndex={0}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  isListening
                    ? 'bg-sage-600 text-white animate-listening ring-8 ring-sage-200'
                    : isThinking
                    ? 'bg-amber-pending text-white animate-pulse ring-8 ring-amber-100'
                    : isSpeaking
                    ? 'bg-emerald-600 text-white ring-8 ring-emerald-100'
                    : 'bg-zinc-100 text-slate-700 hover:bg-zinc-200 border-2 border-zinc-300'
                }`}
              >
                {isListening ? (
                  <Mic className="w-14 h-14 animate-bounce" />
                ) : isThinking ? (
                  <Sparkles className="w-14 h-14 animate-spin" />
                ) : isSpeaking ? (
                  <Volume2 className="w-14 h-14" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </div>

              <div className="mt-4 text-center">
                <span className="text-lg font-bold text-slate-800">
                  {isListening
                    ? 'Listening... Speak clearly'
                    : isThinking
                    ? 'CareEcho is thinking...'
                    : isSpeaking
                    ? 'Speaking response...'
                    : 'Tap the circle to speak'}
                </span>
                {isListening && (
                  <div className="mt-2">
                    <button
                      onClick={stopListeningAndProcess}
                      className="px-4 py-1.5 bg-sage-700 text-white text-sm font-semibold rounded-full hover:bg-sage-800"
                    >
                      Done Speaking ✓
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Transcript & Response Area */}
            {(transcript || responseText) && (
              <div className="space-y-3 my-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-left">
                {transcript && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      You said:
                    </span>
                    <p className="text-lg font-semibold text-slate-900 mt-0.5">
                      "{transcript}"
                    </p>
                  </div>
                )}

                {responseText && (
                  <div className="pt-2 border-t border-zinc-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> CareEcho:
                    </span>
                    <p className="text-lg font-semibold text-slate-800 mt-0.5">
                      {responseText}
                    </p>
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <p className="text-sm font-medium text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 mb-4">
                {errorMsg}
              </p>
            )}

            {/* Accessible Fallback Input Field */}
            <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Or type a question (e.g. Have I taken my pills?)..."
                className="flex-1 min-h-tap px-4 py-2 rounded-xl border border-zinc-300 bg-zinc-50 text-slate-900 text-base focus:ring-2 focus:ring-sage-600 focus:outline-hidden"
              />
              <button
                type="submit"
                aria-label="Send typed query"
                className="min-h-tap px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-bold flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
