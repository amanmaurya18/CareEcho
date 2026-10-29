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

// Browser Web Speech API SpeechSynthesis Helper - Robust Multi-Language Synthesis

// Female voice name identifiers across Windows, macOS/iOS, Android, and Chrome/Edge
const FEMALE_VOICE_KEYWORDS = [
  // Windows / Edge Natural Voices & Indic Voices
  'jenny', 'aria', 'zira', 'michelle', 'ana', 'neerja', 'heera', 'swara',
  'elena', 'laura', 'sabrina', 'alva', 'sonia', 'shruti', 'asmita', 'dhwani',
  'sapna', 'sobhana', 'tanishaa', 'raavi', 'kalpana', 'ananya', 'sunita', 'pallavi', 'aarohi', 'elvira', 'lekha', 'mónica', 'monica', 'paulina',
  // Apple / Safari / macOS / iOS
  'samantha', 'victoria', 'karen', 'ava', 'susan', 'allison', 'fiona', 'moira', 'tessa', 'nora',
  // Google / Android / Chrome
  'female', 'woman', 'girl',
];

const MALE_VOICE_KEYWORDS = [
  'david', 'mark', 'george', 'daniel', 'guy', 'richard', 'stefan', 'male', 'man', 'boy',
  'madhur', 'hemant', 'valluvar', 'mohan', 'niranjan', 'gagan', 'midhun', 'bashkar', 'ojas', 'alvaro', 'jorge', 'manohara',
];

// Active pool to prevent Chromium V8 garbage collection of utterances during playback
const activeUtterances = new Set<SpeechSynthesisUtterance>();

// Global keep-alive timer to prevent Chromium 15-second speech pause bug
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

function startKeepAlive() {
  stopKeepAlive();
  keepAliveTimer = setInterval(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      stopKeepAlive();
    }
  }, 3500);
}

function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

// Global voice cache for instant synchronous retrieval
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  } catch {}
}

// Clean and sanitize text for natural speech synthesis
export function sanitizeTextForSpeech(text: string, lang: string = 'en-US'): string {
  if (!text) return '';
  let cleaned = text
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
    .replace(/([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF])/g, '');

  const langPrefix = lang.toLowerCase().split(/[-_]/)[0];

  // Localized medical units for speech synthesis
  if (langPrefix === 'hi') {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' मिलीग्राम ')
      .replace(/\bml\b/gi, ' मिलीलीटर ')
      .replace(/\btab\b/gi, ' गोली ')
      .replace(/\bcap\b/gi, ' कैप्सूल ')
      .replace(/\bbp\b/gi, ' बीपी ')
      .replace(/\bhr\b/gi, ' हृदय गति ');
  } else if (langPrefix === 'es') {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' miligramos ')
      .replace(/\bml\b/gi, ' mililitros ')
      .replace(/\btab\b/gi, ' tableta ')
      .replace(/\bcap\b/gi, ' cápsula ')
      .replace(/\bbp\b/gi, ' presión arterial ')
      .replace(/\bhr\b/gi, ' frecuencia cardíaca ');
  } else if (langPrefix === 'ta') {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' மில்லிகிராம் ')
      .replace(/\bml\b/gi, ' மில்லிலிட்டர் ')
      .replace(/\btab\b/gi, ' மாத்திரை ')
      .replace(/\bcap\b/gi, ' காப்ஸ்யூல் ')
      .replace(/\bbp\b/gi, ' இரத்த அழுத்தம் ');
  } else if (langPrefix === 'te') {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' మిల్లీగ్రాములు ')
      .replace(/\bml\b/gi, ' మిల్లీలీటర్లు ')
      .replace(/\btab\b/gi, ' టాబ్లెట్ ')
      .replace(/\bcap\b/gi, ' క్యాప్సూల్ ')
      .replace(/\bbp\b/gi, ' రక్తపోటు ');
  } else if (langPrefix === 'bn') {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' মিলিগ্রাম ')
      .replace(/\bml\b/gi, ' মিলিলিটার ')
      .replace(/\btab\b/gi, ' ট্যাবলেট ')
      .replace(/\bcap\b/gi, ' ক্যাপসুল ')
      .replace(/\bbp\b/gi, ' রক্তচাপ ');
  } else if (langPrefix === 'mr') {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' मिलीग्रॅम ')
      .replace(/\bml\b/gi, ' मिलीलीटर ')
      .replace(/\btab\b/gi, ' गोळी ')
      .replace(/\bcap\b/gi, ' कॅप्सूल ')
      .replace(/\bbp\b/gi, ' रक्तदाब ');
  } else if (langPrefix === 'gu') {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' મિલીગ્રામ ')
      .replace(/\bml\b/gi, ' મિલીલીટર ')
      .replace(/\btab\b/gi, ' ગોળી ')
      .replace(/\bcap\b/gi, ' કેપ્સ્યુલ ')
      .replace(/\bbp\b/gi, ' બ્લડ પ્રેશર ');
  } else if (langPrefix === 'kn') {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' ಮಿಲಿಗ್ರಾಂ ')
      .replace(/\bml\b/gi, ' ಮಿಲಿಲೀಟರ್ ')
      .replace(/\btab\b/gi, ' ಮಾತ್ರೆ ')
      .replace(/\bcap\b/gi, ' ಕ್ಯಾಪ್ಸುಲ್ ')
      .replace(/\bbp\b/gi, ' ರಕ್ತದೊತ್ತಡ ');
  } else if (langPrefix === 'ml') {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' മില്ലിഗ്രാം ')
      .replace(/\bml\b/gi, ' മില്ലിലിറ്റർ ')
      .replace(/\btab\b/gi, ' ഗുളിക ')
      .replace(/\bcap\b/gi, ' കാപ്സ്യൂൾ ')
      .replace(/\bbp\b/gi, ' രക്തസമ്മർദ്ദം ');
  } else if (langPrefix === 'pa') {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' ਮਿਲੀਗ੍ਰਾਮ ')
      .replace(/\bml\b/gi, ' ਮਿਲੀਲੀਟਰ ')
      .replace(/\btab\b/gi, ' ਗੋਲੀ ')
      .replace(/\bcap\b/gi, ' ਕੈਪਸੂਲ ')
      .replace(/\bbp\b/gi, ' ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ');
  } else {
    cleaned = cleaned
      .replace(/\bmg\b/gi, ' milligrams ')
      .replace(/\bml\b/gi, ' milliliters ')
      .replace(/\btab\b/gi, ' tablet ')
      .replace(/\bcap\b/gi, ' capsule ')
      .replace(/\bbp\b/gi, ' blood pressure ')
      .replace(/\bhr\b/gi, ' heart rate ');
  }

  return cleaned.replace(/\s+/g, ' ').trim();
}

// Split large text into natural, digestible chunks without truncating
export function splitIntoSentences(text: string, lang: string = 'en-US'): string[] {
  const cleaned = sanitizeTextForSpeech(text, lang);
  if (!cleaned) return [];

  // If text is short or medium length (<= 300 characters), never chop it
  if (cleaned.length <= 300) {
    return [cleaned];
  }

  // Split on sentence boundaries: period, exclamation, question mark, Indic danda, or newlines
  const rawChunks = cleaned
    .split(/(?<=[.!?।;]|\n+)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawChunks.length === 0) return [cleaned];

  const result: string[] = [];
  let currentGroup = '';

  for (const chunk of rawChunks) {
    if (!currentGroup) {
      currentGroup = chunk;
    } else if (currentGroup.length + chunk.length < 240) {
      currentGroup = `${currentGroup} ${chunk}`;
    } else {
      result.push(currentGroup.trim());
      currentGroup = chunk;
    }
  }

  if (currentGroup.trim()) {
    result.push(currentGroup.trim());
  }

  return result.length > 0 ? result : [cleaned];
}

// Helper to reliably fetch voices even if asynchronously loaded by the browser
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  if (cachedVoices && cachedVoices.length > 0) {
    return Promise.resolve(cachedVoices);
  }

  const immediate = window.speechSynthesis.getVoices();
  if (immediate.length > 0) {
    cachedVoices = immediate;
    return Promise.resolve(immediate);
  }

  return new Promise((resolve) => {
    let resolved = false;
    const handleVoicesChanged = () => {
      if (resolved) return;
      resolved = true;
      cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(cachedVoices);
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Short safety timeout so user-gesture permission is preserved
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cachedVoices = window.speechSynthesis.getVoices();
        resolve(cachedVoices);
      }
    }, 250);
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

  const normalizedLang = lang.toLowerCase().replace('_', '-');
  const langPrefix = normalizedLang.split('-')[0];

  // Specific keyword identifiers for Indian and global languages
  const languageKeywordsMap: Record<string, string[]> = {
    hi: ['hindi', 'hi-in', 'hi_in', 'swara', 'heera', 'kalpana', 'madhur', 'lekha', 'google हिन्दी'],
    ta: ['tamil', 'ta-in', 'ta_in', 'valluvar', 'pallavi', 'google தமிழ்'],
    te: ['telugu', 'te-in', 'te_in', 'shruti', 'mohan', 'google తెలుగు'],
    bn: ['bengali', 'bn-in', 'bn_in', 'bangla', 'tanishaa', 'bashkar', 'google বাংলা'],
    mr: ['marathi', 'mr-in', 'mr_in', 'asmita', 'aarohi', 'manohara', 'google मराठी'],
    gu: ['gujarati', 'gu-in', 'gu_in', 'dhwani', 'niranjan', 'google ગુજરાતી'],
    kn: ['kannada', 'kn-in', 'kn_in', 'sapna', 'gagan', 'google ಕನ್ನಡ'],
    ml: ['malayalam', 'ml-in', 'ml_in', 'sobhana', 'midhun', 'google മലയാളം'],
    pa: ['punjabi', 'pa-in', 'pa_in', 'raavi', 'ojas', 'gurmukhi', 'google ਪੰਜਾਬੀ'],
    es: ['spanish', 'es-es', 'es-us', 'es_es', 'es_us', 'español', 'elena', 'laura', 'sabina', 'elvira', 'alvaro', 'mónica', 'monica', 'paulina', 'jorge', 'google español'],
    en: ['english', 'en-us', 'en-gb', 'en-in', 'en_us', 'en_gb', 'en_in', 'zira', 'jenny', 'aria', 'david', 'mark', 'samantha', 'karen', 'george', 'google us english'],
  };

  const currentKeywords = languageKeywordsMap[langPrefix] || [langPrefix];

  // 1. Direct match on language code or keywords
  const matchingVoices = voices.filter((v) => {
    const vLang = v.lang.toLowerCase().replace('_', '-');
    const vName = v.name.toLowerCase();
    const vUri = (v.voiceURI || '').toLowerCase();

    const matchesLangCode = vLang === normalizedLang || vLang.startsWith(langPrefix);
    const matchesKeyword = currentKeywords.some((kw) => vName.includes(kw) || vUri.includes(kw));

    return matchesLangCode || matchesKeyword;
  });

  if (matchingVoices.length > 0) {
    if (gender === 'female') {
      const femaleMatch = matchingVoices.find((v) => {
        const name = v.name.toLowerCase();
        const uri = (v.voiceURI || '').toLowerCase();
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

  // CRITICAL: If the target language is NOT English, NEVER return an English fallback voice!
  // Assigning an English voice causes non-English text to fail or sound like distorted English.
  // Returning null allows the browser engine to use its native/cloud synthesizer for utterance.lang!
  if (langPrefix !== 'en') {
    return null;
  }

  // 2. Fallback for English: English female or default system voice
  const englishFemaleVoice = voices.find((v) => {
    const langMatch = v.lang.toLowerCase().startsWith('en');
    const name = v.name.toLowerCase();
    return langMatch && FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
  });
  if (englishFemaleVoice) return englishFemaleVoice;

  const defaultVoice = voices.find((v) => v.default);
  if (defaultVoice) return defaultVoice;

  const englishVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (englishVoice) return englishVoice;

  return voices[0] || null;
}

// Backwards compatibility alias
export const findFemaleVoice = (voices: SpeechSynthesisVoice[], lang: string = 'en-US') =>
  findBestVoice(voices, lang, 'female');

// Speak a single text chunk completely without truncation
function speakChunk(
  textToSpeak: string,
  voice: SpeechSynthesisVoice | null,
  lang: string,
  gender: 'female' | 'male'
): Promise<void> {
  return new Promise((resolve) => {
    const trimmed = textToSpeak.trim();
    if (!trimmed || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.rate = 0.90; // Gentle, clear cadence for elderly reassurance
    utterance.pitch = gender === 'female' ? 1.05 : 0.95;

    // Always ensure utterance.lang is explicitly set to the requested language
    utterance.lang = lang;

    if (voice) {
      const voiceLangPrefix = (voice.lang || '').toLowerCase().split(/[-_]/)[0];
      const targetLangPrefix = lang.toLowerCase().split(/[-_]/)[0];
      // Only set voice if it matches the target language prefix
      if (voiceLangPrefix === targetLangPrefix || !voiceLangPrefix) {
        utterance.voice = voice;
        if (voice.lang) {
          utterance.lang = voice.lang;
        }
      }
    }

    // Pin utterance in global active pool to prevent Chromium GC cancellation
    activeUtterances.add(utterance);
    startKeepAlive();

    let finished = false;
    const cleanup = () => {
      if (finished) return;
      finished = true;
      activeUtterances.delete(utterance);
      stopKeepAlive();
    };

    // Generous dynamic timeout based on length: never truncate normal sentences
    const timeoutMs = Math.max(14000, trimmed.length * 160);
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
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis notice:', e.error);
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

// Main speakText function: speaks all content completely without premature cutoff
export async function speakText(
  text: string,
  lang: string = 'en-US',
  gender: 'female' | 'male' = 'female'
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const cleaned = sanitizeTextForSpeech(text, lang);
  if (!cleaned) return;

  // Cancel any prior speech cleanly
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

  const voices = await getAvailableVoices();
  const selectedVoice = findBestVoice(voices, lang, gender, cleaned);

  // If text is standard size (<= 300 chars, covering all reminders and answers),
  // speak as ONE single complete utterance to prevent Chromium inter-sentence drop/stalls!
  if (cleaned.length <= 300) {
    await speakChunk(cleaned, selectedVoice, lang, gender);
    return;
  }

  // Only for very long texts (> 300 chars), split into large chunk paragraphs
  const chunks = splitIntoSentences(cleaned, lang);
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    await speakChunk(chunk, selectedVoice, lang, gender);
    if (i < chunks.length - 1) {
      await new Promise((r) => setTimeout(r, 80));
    }
  }
}

// Quick helper to preview/test the warm voice across Indian and global languages
export async function testVoice(lang: string = 'en-US', gender: 'female' | 'male' = 'female'): Promise<void> {
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
  await speakText(sampleText, lang, gender);
}

export const testFemaleVoice = (lang: string = 'en-US') => testVoice(lang, 'female');

