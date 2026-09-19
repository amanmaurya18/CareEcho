# CareEcho — Real-Time Multimodal Health Companion

> An accessible, warm-minimalist multimodal health companion for the elderly and their caregivers with real-time voice, prescription OCR vision, and caregiver alerts.

---

## 🌟 Overview

**CareEcho** is designed specifically to empower seniors to manage their daily medications with dignity, reassurance, and independence—while giving family caregivers peace of mind through real-time adherence streams and alert notifications.

### 👥 Dual-Experience Architecture
1. **Senior Companion (`/`)**: Designed with large typography (18px+ base), high-contrast accessibility mode, high-contrast color badges, offline sound synthesizers (Web Audio API), audio read-aloud (Web Speech API), and a conversational voice companion.
2. **Caregiver Monitoring Portal (`/caregiver`)**: A real-time monitoring hub with adherence scorecards, 7-day adherence tracking, live event streams, an SMS/WhatsApp notification simulator, and medication regimen management.
3. **Prescription & Medicine Scanner (`/scan`)**: A multimodal camera / file uploader powered by **Google Gemini 1.5 Flash** that automatically extracts medication names, dosages, timings, and directions from prescription slips or pill bottles with 1-tap schedule integration.

---

## 🚀 Key Features

### 1. Senior Companion
- **Current Dose Hero Banner**: Clearly highlights the immediate upcoming medicine, dosage, scheduled time, and meal instructions.
- **One-Tap Confirmation**: Single tap marks the medication as taken, playing a gentle harmonic chime and celebratory confetti.
- **"All Taken" Celebration State**: When all daily doses are completed, a reassuring completion banner congratulates the senior.
- **Read Aloud Audio**: Built-in Web Speech API reads medication names, dosages, and instructions aloud at a gentle, measured pace.
- **Interactive Voice Assistant Orb**: Floating voice companion allowing seniors to ask health questions, confirm their schedule, or check in via voice or text.
- **Emergency SOS**: Prominent 1-tap SOS button that sounds an audible alert, provides direct 911 dialing, and immediately notifies configured caregivers.
- **High-Contrast & Multi-Language**: Instant toggle between standard warm-minimalist aesthetic and high-contrast accessibility mode, with multi-language support (English, Hindi, and Spanish).

### 2. Prescription Scanner (Multimodal AI)
- **Camera & File Dropzone**: Accepts photos of handwritten/printed prescriptions or medication labels.
- **Gemini 1.5 Flash Vision OCR**: Extracts medication names, dosages, frequencies, times of day, and doctor instructions into structured JSON.
- **Instant Test Presets**: Built-in sample prescriptions (Cardiology Care Plan & Senior Wellness) for zero-setup demo testing without an API key.
- **Batch Add to Schedule**: Checkbox list allowing users to review extracted medications before seamlessly adding them to their daily schedule.

### 3. Caregiver Portal & Alert Simulator
- **Adherence Scorecard**: Real-time adherence rate percentage, perfect streak counter, and taken vs. pending dose counts.
- **Printable Schedule**: One-click "Print Today's Regimen" for family members, nurses, or refrigerator display.
- **Filtered Activity Feed**: Real-time stream with filter tabs for All Activities, Doses Taken, Voice Check-ins, and Emergency Alerts.
- **Alert Simulator**: Configure caregiver contact details and test simulated WhatsApp and SMS notifications for missed doses, daily syncs, and SOS signals with live message bubble previews.
- **Medication Regimen Manager**: Full CRUD management of daily medications, dosage forms (tablets, capsules, liquids, drops, inhalers, injections), timings, and instructions.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom accessibility tokens
- **AI / Multimodal**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini 1.5 Flash)
- **Audio & Speech**:
  - **Web Audio API**: 100% offline, procedural sound effect synthesizer (major triad success chords, alert tones, tap feedback)
  - **Web Speech API**: Browser-native SpeechRecognition and SpeechSynthesis
- **Icons & UI**: [Lucide React](https://lucide.dev/), [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18.17+ or Node.js 20+
- npm or yarn

### 1. Installation
```bash
git clone <repo-url>
cd CareEcho
npm install
```

### 2. Environment Variables (Optional)
Create a `.env.local` file in the project root if you want to use live Gemini API calls for OCR and voice chat:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
> **Note**: If `GEMINI_API_KEY` is not provided, CareEcho automatically uses realistic, zero-friction demo fallbacks so all features, OCR scans, and voice responses work out of the box.

### 3. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Building for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
CareEcho/
├── public/
│   └── samples/              # Sample prescription SVGs for instant demo OCR
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan-prescription/  # Gemini 1.5 Flash OCR route
│   │   │   ├── send-alert/         # Twilio/WhatsApp alert webhook simulator
│   │   │   └── voice-companion/    # Conversational health companion route
│   │   ├── caregiver/        # Caregiver Portal page
│   │   ├── scan/             # Prescription Scanner page
│   │   ├── globals.css       # Design system, high-contrast styles, animations
│   │   ├── layout.tsx        # Root layout with CareProvider
│   │   └── page.tsx          # Senior Companion daily schedule
│   ├── components/
│   │   ├── AlertSimulator.tsx       # WhatsApp/SMS simulator with preview
│   │   ├── CaregiverFeed.tsx        # Adherence scorecard & filtered live stream
│   │   ├── CurrentDoseBanner.tsx    # Hero dose banner & celebration state
│   │   ├── Header.tsx               # Accessible header, clock, battery, SOS
│   │   ├── MedicationCard.tsx       # Timeline card with form-specific icons
│   │   ├── MedicineManagerModal.tsx # Regimen CRUD modal with form selector
│   │   ├── Navigation.tsx           # Primary tab navigation
│   │   ├── PrescriptionUploader.tsx # Camera/upload dropzone & preset loader
│   │   ├── SosModal.tsx             # Emergency confirmation & 911 dialer
│   │   └── VoiceAssistantOrb.tsx    # Floating speech & chat dialog
│   ├── context/
│   │   └── CareContext.tsx          # Global state, persistence, audio triggers
│   └── lib/
│       ├── audio.ts                 # Offline Web Audio synth & speech synthesis
│       ├── mockData.ts              # Sample medications, logs, and prescriptions
│       └── types.ts                 # TypeScript interfaces
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ♿ Accessibility Considerations

- **Visual Clarity**: 18px base text size with high-contrast text ratios exceeding WCAG AAA standards.
- **Touch Targets**: Minimum 48px to 64px tap areas (`min-h-tap`, `min-h-tap-lg`, `min-h-tap-xl`) for seniors with tremors or limited dexterity.
- **Audio Redundancy**: Visual confirmations (chimes and confetti) accompanied by spoken voice readouts.
- **Fail-Safe Operation**: 100% functional offline or without external API keys via graceful procedural sound synthesis and fallback logic.
