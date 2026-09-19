import { NextResponse } from "next/server";
import type { ScannedMedicine } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM_PROMPT =
  "You are a medical prescription parser. Extract medication names, dosage, frequency, time of day (Morning/Afternoon/Evening/Night), and specific instructions (e.g., after food). Respond ONLY with valid JSON following this schema: { medicines: [{ name: string, dosage: string, frequency: string, time: string, instructions: string }] }";

/* ------------------------------------------------------------------ */
/* Simulated parses — used when GEMINI_API_KEY is absent (Demo Mode)   */
/* ------------------------------------------------------------------ */

const SAMPLE_A: ScannedMedicine[] = [
  {
    name: "Amlodipine",
    dosage: "5 mg",
    frequency: "Once daily",
    time: "Morning",
    instructions: "After breakfast, with water. Monitor blood pressure weekly.",
  },
  {
    name: "Metformin",
    dosage: "500 mg",
    frequency: "Twice daily",
    time: "Morning",
    instructions: "After food (morning and evening doses).",
  },
  {
    name: "Atorvastatin",
    dosage: "10 mg",
    frequency: "Once daily",
    time: "Night",
    instructions: "At bedtime.",
  },
];

const SAMPLE_B: ScannedMedicine[] = [
  {
    name: "Pantoprazole",
    dosage: "40 mg",
    frequency: "Once daily",
    time: "Morning",
    instructions: "Empty stomach, 30 minutes before breakfast.",
  },
  {
    name: "Telmisartan",
    dosage: "40 mg",
    frequency: "Once daily",
    time: "Morning",
    instructions: "After breakfast. Avoid high-salt food.",
  },
  {
    name: "Calcium + Vitamin D3",
    dosage: "500 mg / 60000 IU",
    frequency: "Once daily",
    time: "Afternoon",
    instructions: "After lunch.",
  },
  {
    name: "Gabapentin",
    dosage: "100 mg",
    frequency: "Once daily",
    time: "Night",
    instructions: "At bedtime. May cause drowsiness — avoid driving.",
  },
];

const GENERIC_SIM: ScannedMedicine[] = [
  {
    name: "Paracetamol",
    dosage: "650 mg",
    frequency: "Twice daily",
    time: "Morning",
    instructions: "After food. Do not exceed 2 tablets in 24 hours.",
  },
  {
    name: "Vitamin B12",
    dosage: "1500 mcg",
    frequency: "Once daily",
    time: "Morning",
    instructions: "After breakfast.",
  },
];

function simulatedParse(sampleId?: string | null): ScannedMedicine[] {
  if (sampleId === "rx-sample-1") return SAMPLE_A;
  if (sampleId === "rx-sample-2") return SAMPLE_B;
  return GENERIC_SIM;
}

/* ------------------------------------------------------------------ */
/* Live Gemini path                                                    */
/* ------------------------------------------------------------------ */

async function geminiParse(
  base64: string,
  mimeType: string,
  apiKey: string
): Promise<ScannedMedicine[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          parts: [
            { text: "Extract every medication from this prescription image." },
            { inline_data: { mime_type: mimeType, data: base64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini response did not contain JSON");
  const parsed = JSON.parse(jsonMatch[0]) as { medicines?: ScannedMedicine[] };
  if (!Array.isArray(parsed.medicines)) throw new Error("Unexpected JSON shape");
  return parsed.medicines.map((m) => ({
    name: String(m.name ?? "Unknown medicine"),
    dosage: String(m.dosage ?? ""),
    frequency: String(m.frequency ?? "Once daily"),
    time: String(m.time ?? "Morning"),
    instructions: String(m.instructions ?? ""),
  }));
}

/* ------------------------------------------------------------------ */
/* Route handler                                                       */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  try {
    let base64: string | null = null;
    let mimeType = "image/png";
    let sampleId: string | null = null;

    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      sampleId = (form.get("sampleId") as string) ?? null;
      if (file instanceof File) {
        const buf = Buffer.from(await file.arrayBuffer());
        base64 = buf.toString("base64");
        mimeType = file.type || "image/png";
      }
    } else {
      const body = (await req.json().catch(() => ({}))) as {
        imageBase64?: string;
        mimeType?: string;
        sampleId?: string;
      };
      base64 = body.imageBase64 ?? null;
      mimeType = body.mimeType ?? "image/png";
      sampleId = body.sampleId ?? null;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // FAILSAFE: demo mode when no key, no image, or Gemini errors out.
    if (!apiKey || !base64) {
      return NextResponse.json({
        ok: true,
        demo: true,
        demoReason: !apiKey ? "no-api-key" : "no-image",
        medicines: simulatedParse(sampleId),
      });
    }

    try {
      const medicines = await geminiParse(base64, mimeType, apiKey);
      if (medicines.length === 0) throw new Error("Empty extraction");
      return NextResponse.json({ ok: true, demo: false, medicines });
    } catch (err) {
      console.warn("[scan-prescription] Gemini failed, falling back:", err);
      return NextResponse.json({
        ok: true,
        demo: true,
        demoReason: "gemini-error",
        medicines: simulatedParse(sampleId),
      });
    }
  } catch (err) {
    console.error("[scan-prescription] bad request:", err);
    return NextResponse.json(
      { ok: false, error: "Malformed request. Send FormData 'file' or JSON { imageBase64 }." },
      { status: 400 }
    );
  }
}
