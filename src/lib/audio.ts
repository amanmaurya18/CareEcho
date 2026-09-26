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

// // Browser Web Speech API SpeechSynthesis Helper - Robust Multi-Language Synthesis

// Female voice name identifiers across Windows, macOS/iOS, Android, and Chrome/Edge
const FEMALE_VOICE_KEYWORDS = [
  // Windows / Edge Natural Voices & Indic Voices
  'jenny', 'aria', 'zira', 'michelle', 'ana', 'neerja', 'heera', 'swara',
  'elena', 'laura', 'sabrina', 'alva', 'sonia', 'shruti', 'asmita', 'dhwani',
  'sapna', 'sobhana', 'tanishaa', 'raavi', 'kalpana', 'ananya', 'sunita',
  // Apple / Safari / macOS / iOS
  'samantha', 'victoria', 'karen', 'ava', 'susan', 'allison', 'fiona', 'moira', 'tessa', 'nora',
  // Google / Android / Chrome
  'female', 'woman', 'girl',
];

const MALE_VOICE_KEYWORDS = [
  'david', 'mark', 'george', 'daniel', 'guy', 'richard', 'stefan', 'male', 'man', 'boy',
  'madhur', 'hemant', 'valluvar', 'mohan', 'niranjan', 'gagan', 'midhun', 'bashkar',
];

// Active pool to prevent Chromium V8 garbage collection of utterances
const activeUtterances = new Set<SpeechSynthesisUtterance>();

// Clean and sanitize text for natural speech synthesis
export function sanitizeTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Remove markdown formatting
    .replace(/[*_~`#]/g, '')
    // Remove Markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Replace smart/curved quotes and dashes with speech-friendly equivalents
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, ', ')
    .replace(/[•·]/g, ', ')
    // Remove Emojis and miscellaneous symbols that trip speech engines
    .replace(/([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF])/g, '')
    // Replace common medical abbreviations for clear pronunciation
    .replace(/\bmg\b/gi, 'milligrams')
    .replace(/\bml\b/gi, 'milliliters')
    .replace(/\btab\b/gi, 'tablet')
    .replace(/\bcap\b/gi, 'capsule')
    .replace(/\bbp\b/gi, 'blood pressure')
    .replace(/\bhr\b/gi, 'heart rate')
    // Normalize punctuation and whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Split text into natural, digestible sentence chunks without truncating
export function splitIntoSentences(text: string): string[] {
  const cleaned = sanitizeTextForSpeech(text);
  if (!cleaned) return [];

  // Split on sentence boundaries: period, exclamation, question mark, Indic danda, semicolon, or newlines
  const rawChunks = cleaned
    .split(/(?<=[.!?।;]|\n+)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawChunks.length === 0) return [cleaned];

  const result: string[] = [];
  for (const chunk of rawChunks) {
    // If a single chunk is still quite long (> 120 characters), break at commas or conjunctions
    if (chunk.length > 120 && chunk.includes(',')) {
      const subParts = chunk.split(/,\s*/);
      let currentSub = '';
      for (const part of subParts) {
        if (!part.trim()) continue;
        if (currentSub && (currentSub.length + part.length > 110)) {
          result.push(currentSub.trim());
          currentSub = part;
        } else {
          currentSub = currentSub ? `${currentSub}, ${part}` : part;
        }
      }
      if (currentSub.trim()) {
        result.push(currentSub.trim());
      }
    } else {
      result.push(chunk);
    }
  }

  return result.length > 0 ? result : [cleaned];
}

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
    }, 600);
  });
}

// Select best voice matching the target language, script, and gender
export function findBestVoice(
  voices: SpeechSynthesisVoice[],
  lang: string = 'en-US',
  gender: 'female' | 'male' = 'female',
  sampleSentence?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // Determine script of sentence
  const hasIndic = sampleSentence ? /[\u0900-\u0D7F]/.test(sampleSentence) : false;
  const isDevanagari = sampleSentence ? /[\u0900-\u097F]/.test(sampleSentence) : false;
  const isTamil = sampleSentence ? /[\u0B80-\u0BFF]/.test(sampleSentence) : false;
  const isTelugu = sampleSentence ? /[\u0C00-\u0C7F]/.test(sampleSentence) : false;
  const isBengali = sampleSentence ? /[\u0980-\u09FF]/.test(sampleSentence) : false;
  const isGujarati = sampleSentence ? /[\u0A80-\u0AFF]/.test(sampleSentence) : false;
  const isKannada = sampleSentence ? /[\u0C80-\u0CFF]/.test(sampleSentence) : false;
  const isMalayalam = sampleSentence ? /[\u0D00-\u0D7F]/.test(sampleSentence) : false;
  const isPunjabi = sampleSentence ? /[\u0A00-\u0A7F]/.test(sampleSentence) : false;

  let effectiveLang = lang.toLowerCase().replace('_', '-');

  // If text has NO Indic characters and is not Spanish, use an English voice for clear pronunciation
  if (!hasIndic && !effectiveLang.startsWith('es')) {
    effectiveLang = 'en-us';
  } else if (isDevanagari) {
    effectiveLang = 'hi-in';
  } else if (isTamil) {
    effectiveLang = 'ta-in';
  } else if (isTelugu) {
    effectiveLang = 'te-in';
  } else if (isBengali) {
    effectiveLang = 'bn-in';
  } else if (isGujarati) {
    effectiveLang = 'gu-in';
  } else if (isKannada) {
    effectiveLang = 'kn-in';
  } else if (isMalayalam) {
    effectiveLang = 'ml-in';
  } else if (isPunjabi) {
    effectiveLang = 'pa-in';
  }

  const langPrefix = effectiveLang.split('-')[0];

  // Specific keyword identifiers for Indian and global languages
  const languageKeywordsMap: Record<string, string[]> = {
    hi: ['hindi', 'hi-in', 'swara', 'heera', 'kalpana', 'madhur', 'google हिन्दी'],
    ta: ['tamil', 'ta-in', 'valluvar'],
    te: ['telugu', 'te-in', 'shruti', 'mohan'],
    bn: ['bengali', 'bn-in', 'bangla', 'tanishaa', 'bashkar'],
    mr: ['marathi', 'mr-in', 'asmita'],
    gu: ['gujarati', 'gu-in', 'dhwani', 'niranjan'],
    kn: ['kannada', 'kn-in', 'sapna', 'gagan'],
    ml: ['malayalam', 'ml-in', 'sobhana', 'midhun'],
    pa: ['punjabi', 'pa-in', 'raavi'],
    es: ['spanish', 'es-es', 'es-us', 'español', 'elena', 'laura', 'sabina'],
    en: ['english', 'en-us', 'en-gb', 'en-in', 'zira', 'jenny', 'aria', 'david', 'mark'],
  };

  const currentKeywords = languageKeywordsMap[langPrefix] || [langPrefix];

  // Filter voices that match the target language or keywords
  const matchingVoices = voices.filter((v) => {
    const vLang = v.lang.toLowerCase().replace('_', '-');
    const vName = v.name.toLowerCase();
    const vUri = v.voiceURI.toLowerCase();

    const matchesLangCode = vLang === effectiveLang || vLang.startsWith(langPrefix);
    const matchesKeyword = currentKeywords.some((kw) => vName.includes(kw) || vUri.includes(kw));

    return matchesLangCode || matchesKeyword;
  });

  if (matchingVoices.length > 0) {
    if (gender === 'female') {
      const femaleMatch = matchingVoices.find((v) => {
        const name = v.name.toLowerCase();
        const uri = v.voiceURI.toLowerCase();
        return (
          FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw) || uri.includes(kw)) &&
          !MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw) || uri.includes(kw))
        );
      });
      if (femaleMatch) return femaleMatch;

      const nonMaleMatch = matchingVoices.find((v) => {
        const name = v.name.toLowerCase();
        return !MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      });
      if (nonMaleMatch) return nonMaleMatch;
    } else {
      const maleMatch = matchingVoices.find((v) => {
        const name = v.name.toLowerCase();
        return MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      });
      if (maleMatch) return maleMatch;
    }

    return matchingVoices[0];
  }

  // Fallback: Pick best available English voice or default system voice
  // This guarantees speech NEVER crashes or goes silent if language pack is missing in OS
  const englishFemaleVoice = voices.find((v) => {
    const langMatch = v.lang.toLowerCase().startsWith('en');
    const name = v.name.toLowerCase();
    return langMatch && FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
  });
  if (englishFemaleVoice) return englishFemaleVoice;

  const englishVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (englishVoice) return englishVoice;

  return voices[0] || null;
}

// Backwards compatibility alias
export const findFemaleVoice = (voices: SpeechSynthesisVoice[], lang: string = 'en-US') =>
  findBestVoice(voices, lang, 'female');

// Speak a single sentence chunk reliably without premature truncation
function speakSentenceChunk(
  sentence: string,
  voice: SpeechSynthesisVoice | null,
  lang: string,
  gender: 'female' | 'male'
): Promise<void> {
  return new Promise((resolve) => {
    const trimmed = sentence.trim();
    if (!trimmed || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.rate = 0.90; // Gentle, clear cadence for elderly reassurance
    utterance.pitch = gender === 'female' ? 1.05 : 0.95;

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = lang;
    }

    // Pin utterance in global active pool to prevent Chromium GC cancellation
    activeUtterances.add(utterance);

    const cleanup = () => {
      activeUtterances.delete(utterance);
    };

    // Generous dynamic timeout based on length: never truncate normal sentences
    // (At rate 0.90, average 15 words/minute is ~15-20 characters per second)
    const timeoutMs = Math.max(16000, trimmed.length * 250);
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, timeoutMs);

    utterance.onend = () => {
      clearTimeout(timer);
      cleanup();
      resolve();
    };

    utterance.onerror = (e) => {
      clearTimeout(timer);
      cleanup();
      // 'canceled' or 'interrupted' can happen on user navigation or new click
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis sentence notice:', e.error);
      }
      resolve();
    };

    try {
      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {
      clearTimeout(timer);
      cleanup();
      resolve();
    }
  });
}

// Main speakText function: speaks all sentences completely without premature cutoff
export async function speakText(
  text: string,
  lang: string = 'en-US',
  gender: 'female' | 'male' = 'female'
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any prior speech cleanly and wait briefly for audio channel to clear
  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      // Allow Chromium's internal audio device to reset asynchronously
      await new Promise((r) => setTimeout(r, 60));
    }
    activeUtterances.clear();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {}

  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) return;

  const voices = await getAvailableVoices();

  // Speak every single sentence chunk sequentially with a clean inter-sentence buffer
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const selectedVoice = findBestVoice(voices, lang, gender, sentence);
    await speakSentenceChunk(sentence, selectedVoice, lang, gender);

    // Natural 80ms breathing pause between sentences to let Chromium audio pipe settle
    if (i < sentences.length - 1) {
      await new Promise((r) => setTimeout(r, 80));
    }
  }
}

// Quick helper to preview/test the warm voice across Indian and global languages
export async function testFemaleVoice(lang: string = 'en-US'): Promise<void> {
  const samples: Record<string, string> = {
    'hi-IN': 'नमस्ते! मैं आपका स्वास्थ्य साथी CareEcho हूँ। आपकी सेहत का ध्यान रखना मेरी प्राथमिकता है।',
    'ta-IN': 'வணக்கம்! நான் உங்கள் ஆரோக்கியத் தோழன் CareEcho. உங்கள் மருந்துகளை நினைவூட்டுவது எனது பணி.',
    'te-IN': 'నమస్కారం! నేను మీ ఆరోగ్య సహచరి CareEcho. మీ మందుల సమయాన్ని గుర్తుచేయడమే నా పని.',
    'bn-IN': 'নমস্কার! আমি আপনার স্বাস্থ্য সঙ্গী CareEcho। আপনার ওষুধ সময়মতো নেওয়া আমার দায়িত্ব।',
    'mr-IN': 'नमस्कार! मी तुमचा आरोग्य साथी CareEcho आहे. तुमच्या औषधांची काळजी घेणे हे माझे कर्तव्य आहे.',
    'gu-IN': 'નમસ્તે! હું તમારો સ્વાસ્થ્ય સાથી CareEcho છું. તમારી દવાઓનું ધ્યાન રાખવું મારી પ્રાથમિકતા છે.',
    'kn-IN': 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹವರ್ತಿ CareEcho. ನಿಮ್ಮ ಔಷಧಿಗಳನ್ನು ನೆನಪಿಸುವುದು ನನ್ನ ಕರ್ತವ್ಯ.',
    'ml-IN': 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ആരോഗ്യ സഹായിയായ CareEcho ആണ്. നിങ്ങളുടെ മരുന്നുകൾ ഓർമ്മിപ്പിക്കാൻ ഞാൻ തയ്യാറാണ്.',
    'pa-IN': 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਸਿਹਤ ਸਾਥੀ CareEcho ਹਾਂ। ਤੁਹਾਡੀ ਸਿਹਤ ਦਾ ਖਿਆਲ ਰੱਖਣਾ ਮੇਰਾ ਫਰਜ਼ ਹੈ।',
    'es-ES': '¡Hola! Soy CareEcho, su compañera de salud. Estoy aquí para ayudarle con sus medicamentos.',
    'en-US': 'Hello! I am CareEcho, your daily health companion. How are you feeling today?',
  };

  const sampleText = samples[lang] || samples['en-US'];
  await speakText(sampleText, lang, 'female');
}

