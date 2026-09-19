// Web Audio API Sound Synthesizer - 100% offline, zero external asset dependencies

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Gentle, positive major triad chord for "Mark as Taken"
  playSuccessChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.65);
    });
  }

  // Friendly ascending chime for voice assistant activation
  playVoiceActiveChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18); // E5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  // Emergency SOS alert tone (distinctive two-tone attention chime)
  playSosAlert() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.25, 0.5].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, now + offset);
      osc.frequency.setValueAtTime(880, now + offset + 0.1);

      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.25, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.22);
    });
  }

  // Continuous ringing alarm tone for overdue / missed medications
  private alarmInterval: NodeJS.Timeout | null = null;

  startAlarm() {
    this.stopAlarm();
    const playBeep = () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Two-tone medical reminder chime (A5 880Hz -> C6 1046.5Hz)
      [0, 0.2].forEach((offset, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(index === 0 ? 880 : 1046.5, now + offset);

        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(0.22, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });
    };

    playBeep();
    this.alarmInterval = setInterval(playBeep, 1200);
  }

  stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  // Subtle tap feedback
  playTap() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export const soundEffects = new SoundEffects();

// Browser Web Speech API SpeechSynthesis Helper - Female Voice Priority

// Female voice name identifiers across Windows, macOS/iOS, Android, and Chrome/Edge
const FEMALE_VOICE_KEYWORDS = [
  // Windows / Edge Natural Voices
  'jenny', 'aria', 'zira', 'michelle', 'ana', 'neerja', 'heera', 'swara',
  'elena', 'laura', 'sabrina', 'alva', 'sonia',
  // Apple / Safari / macOS / iOS
  'samantha', 'victoria', 'karen', 'ava', 'susan', 'allison', 'fiona', 'moira', 'tessa', 'nora',
  // Google / Android / Chrome
  'female', 'woman', 'girl',
];

const MALE_VOICE_KEYWORDS = [
  'david', 'mark', 'george', 'daniel', 'guy', 'richard', 'stefan', 'male', 'man', 'boy',
];

// Helper to reliably fetch voices even if asynchronously loaded by the browser
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) {
      resolve(immediate);
      return;
    }

    // Wait for voiceschanged event if initially empty
    const handleVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Safety timeout in case voiceschanged does not trigger
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 400);
  });
}

// Select best female voice matching language
export function findFemaleVoice(voices: SpeechSynthesisVoice[], lang: string = 'en-US'): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const langPrefix = lang.slice(0, 2).toLowerCase();

  // 1. Language match with explicit female keywords
  const langFemale = voices.find((v) => {
    const name = v.name.toLowerCase();
    const uri = v.voiceURI.toLowerCase();
    const matchesLang = v.lang.toLowerCase().startsWith(langPrefix);
    const hasFemaleKw = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw) || uri.includes(kw));
    const hasMaleKw = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw) || uri.includes(kw));
    return matchesLang && hasFemaleKw && !hasMaleKw;
  });
  if (langFemale) return langFemale;

  // 2. Any voice in target language that is NOT explicitly male
  const langNonMale = voices.find((v) => {
    const name = v.name.toLowerCase();
    const uri = v.voiceURI.toLowerCase();
    const matchesLang = v.lang.toLowerCase().startsWith(langPrefix);
    const hasMaleKw = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw) || uri.includes(kw));
    return matchesLang && !hasMaleKw;
  });
  if (langNonMale) return langNonMale;

  // 3. Fallback: Any female voice in any language
  const anyFemale = voices.find((v) => {
    const name = v.name.toLowerCase();
    const uri = v.voiceURI.toLowerCase();
    return FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw) || uri.includes(kw));
  });
  if (anyFemale) return anyFemale;

  // 4. Fallback to first available voice
  return voices[0] || null;
}

export async function speakText(
  text: string,
  lang: string = 'en-US',
  gender: 'female' | 'male' = 'female'
): Promise<void> {
  return new Promise(async (resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    // Cancel any pending speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.90; // Gentle, clear cadence for elderly reassurance
    utterance.pitch = gender === 'female' ? 1.15 : 0.95; // Warm feminine pitch

    const voices = await getAvailableVoices();
    const selectedVoice = gender === 'female' ? findFemaleVoice(voices, lang) : null;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

// Quick helper to preview/test the warm female voice
export async function testFemaleVoice(lang: string = 'en-US'): Promise<void> {
  let sampleText = "Hello! I am CareEcho, your daily health companion. How are you feeling today?";
  if (lang.startsWith('hi')) {
    sampleText = "नमस्ते! मैं आपका स्वास्थ्य साथी CareEcho हूँ। आपकी सेहत का ध्यान रखना मेरी प्राथमिकता है।";
  } else if (lang.startsWith('es')) {
    sampleText = "¡Hola! Soy CareEcho, su compañera de salud. Estoy aquí para ayudarle con sus medicamentos.";
  }
  await speakText(sampleText, lang, 'female');
}

