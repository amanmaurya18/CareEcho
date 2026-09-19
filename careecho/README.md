# CareEcho — Real-Time Multimodal Health Companion

> Warm Minimalism UI for elderly users + a full caregiver dashboard. Zero-config: works out of the box in **Demo Mode**, upgrades automatically when a Gemini key is present.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Optional environment (everything degrades gracefully without it)

Copy `.env.example` to `.env.local` and fill in what you have:

```bash
GEMINI_API_KEY=...        # real prescription OCR (Gemini 1.5 Flash) + AI voice companion
TWILIO_ACCOUNT_SID=...    # real WhatsApp/SMS caregiver alerts (otherwise simulated)
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

Without any keys the app returns realistic simulated data and shows a
"Demo Mode" toast — it never crashes.

## Routes

| Route              | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| `/`                | Senior companion: live clock, next-dose hero, SOS, voice orb |
| `/scan`            | Prescription scanner (camera / drag-drop / 2 sample presets) |
| `/caregiver`       | Adherence scorecard, alert simulator, medicine manager      |
| `/api/scan-prescription` | Gemini 1.5 Flash OCR (structured JSON) + failsafe     |
| `/api/voice-companion`   | Warm 1–2 sentence TTS-ready replies + scripted tree   |
| `/api/send-alert`        | Simulated Twilio/WhatsApp dispatch + event log        |

## Design system

- Background `#FBFBFA`, ink `#0F172A`, sage `#2D6A4F`, amber `#D97706`
- Base font ≥ 18px, tap targets ≥ 48px, WCAG AAA contrast
- **High-contrast mode** toggle (top-right) flips CSS variables to pure
  black/white with 2px borders.
- Status language: green = taken, amber = pending/due, red = missed/SOS.
