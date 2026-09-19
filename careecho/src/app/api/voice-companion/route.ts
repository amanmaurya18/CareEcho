import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 20;

type Lang = "en-US" | "hi-IN" | "es-ES";

const PERSONA =
  "You are CareEcho, a warm, patient voice companion for an elderly person. " +
  "Reply in 1-2 short, simple, reassuring sentences suitable for text-to-speech. " +
  "Use the same language as the user's message. Never give medical diagnoses; " +
  "gently encourage them to rest, hydrate, take medicines on time, or talk to family/doctor.";

/* ------------------------------------------------------------------ */
/* Scripted conversational tree — zero-key fallback                    */
/* ------------------------------------------------------------------ */

interface Branch {
  keywords: string[];
  replies: string[];
}

const TREES: Record<Lang, { branches: Branch[]; greeting: (h: number) => string; fallback: string[] }> = {
  "en-US": {
    greeting: (h) =>
      h < 12
        ? "Good morning! Did you sleep well? Remember to take your morning tablets after breakfast."
        : h < 17
          ? "Good afternoon! Have you had lunch and your afternoon capsule?"
          : "Good evening! I hope you had a comfortable day. Your night tablet is due at half past nine.",
    branches: [
      {
        keywords: ["medicine", "tablet", "pill", "dose", "took", "take"],
        replies: [
          "Your tablets are shown on the big card on screen. Press the green Taken button after each dose, and I will remember it for you.",
          "You are doing well with your medicines. If you are not sure about a dose, it is safest to ask your daughter Anita.",
        ],
      },
      {
        keywords: ["pain", "hurt", "ache", "headache", "dizzy", "unwell", "sick"],
        replies: [
          "I am sorry you are not feeling well. Please sit down and sip some water. If it continues, shall we send a message to Anita?",
          "Rest for a little while. If the feeling does not pass, press the red SOS button and your family will be alerted right away.",
        ],
      },
      {
        keywords: ["breakfast", "lunch", "dinner", "food", "eat", "hungry", "water", "thirsty"],
        replies: [
          "Please eat something light and drink a full glass of water. Most of your tablets work best after food.",
          "Good idea — a small meal now will keep your energy steady. Take your tablets after eating.",
        ],
      },
      {
        keywords: ["doctor", "hospital", "appointment", "clinic"],
        replies: [
          "Your next check-up details are with Anita. Would you like me to send her a reminder message?",
          "If you feel you need the doctor soon, press SOS or ask me to alert your caregiver.",
        ],
      },
      {
        keywords: ["lonely", "alone", "sad", "family", "daughter", "son", "grand"],
        replies: [
          "You are loved and never alone — your family checks your CareEcho every day. Anita was just looking at your good adherence score.",
          "Shall I send a little hello message to Anita? She enjoys hearing from you.",
        ],
      },
      {
        keywords: ["time", "date", "day"],
        replies: ["The current time and date are always shown at the top of your screen, in big letters."],
      },
      {
        keywords: ["hello", "hi", "good morning", "good evening", "namaste"],
        replies: [], // handled by greeting
      },
    ],
    fallback: [
      "I am here with you. Could you say that once more, slowly?",
      "Tell me how you are feeling, or ask me about your medicines — I am listening.",
    ],
  },
  "hi-IN": {
    greeting: (h) =>
      h < 12
        ? "सुप्रभात! क्या आपकी नींद अच्छी हुई? नाश्ते के बाद सुबह की गोलियाँ लेना न भूलें।"
        : h < 17
          ? "नमस्ते! क्या आपने दोपहर का भोजन और अपनी कैप्सूल ले ली?"
          : "शुभ संध्या! आशा है आपका दिन अच्छा रहा। रात की गोली साढ़े नौ बजे लेनी है।",
    branches: [
      {
        keywords: ["दवा", "गोली", "टेबलेट", "medicine"],
        replies: [
          "आपकी दवाइयाँ स्क्रीन पर बड़े कार्ड में दिख रही हैं। हर खुराक के बाद हरे बटन को दबाएँ, मैं याद रखूँगी।",
          "आप दवाइयाँ बहुत अच्छे से ले रहे हैं। कोई संदेह हो तो बेटी अनीता से पूछ लीजिए।",
        ],
      },
      {
        keywords: ["दर्द", "सिरदर्द", "चक्कर", "तबीयत", "pain"],
        replies: [
          "कृपया बैठ जाएँ और थोड़ा पानी पिएँ। तकलीफ बनी रहे तो क्या हम अनीता को संदेश भेज दें?",
          "थोड़ा आराम कीजिए। अगर ठीक न लगे तो लाल SOS बटन दबाइए, परिवार को तुरंत सूचना चली जाएगी।",
        ],
      },
      {
        keywords: ["खाना", "नाश्ता", "भोजन", "पानी", "food", "water"],
        replies: [
          "हल्का खाना खाइए और एक पूरा गिलास पानी पीजिए। ज़्यादातर दवाइयाँ खाने के बाद लेनी हैं।",
          "बहुत अच्छा। खाने के बाद अपनी गोलियाँ लेना न भूलें।",
        ],
      },
      {
        keywords: ["डॉक्टर", "अस्पताल", "doctor"],
        replies: [
          "आपके अगले चेक-अप की जानकारी अनीता के पास है। क्या मैं उन्हें याद दिला दूँ?",
          "अगर डॉक्टर से मिलना ज़रूरी लगे तो SOS दबाइए या मुझसे कहिए।",
        ],
      },
      {
        keywords: ["अकेला", "उदास", "परिवार", "बेटी", "family"],
        replies: [
          "आप कभी अकेले नहीं हैं — परिवार हर दिन आपका CareEcho देखता है। अनीता आपका अच्छा स्कोर देखकर खुश हुई थीं।",
          "क्या मैं अनीता को आपका प्रणाम भेज दूँ?",
        ],
      },
      {
        keywords: ["नमस्ते", "प्रणाम", "hello"],
        replies: [],
      },
    ],
    fallback: [
      "मैं आपके साथ हूँ। क्या आप धीरे से दोबारा कहेंगे?",
      "मुझे बताइए आप कैसा महसूस कर रहे हैं, या दवाइयों के बारे में पूछिए — मैं सुन रही हूँ।",
    ],
  },
  "es-ES": {
    greeting: (h) =>
      h < 12
        ? "¡Buenos días! ¿Durmió bien? Recuerde tomar sus pastillas de la mañana después del desayuno."
        : h < 17
          ? "¡Buenas tardes! ¿Ya almorzó y tomó su cápsula de la tarde?"
          : "¡Buenas noches! Espero que haya tenido un día tranquilo. Su pastilla nocturna es a las nueve y media.",
    branches: [
      {
        keywords: ["medicina", "pastilla", "medicamento", "dosis"],
        replies: [
          "Sus medicinas aparecen en la tarjeta grande de la pantalla. Pulse el botón verde después de cada dosis y yo lo recordaré.",
          "Lo está haciendo muy bien con sus medicinas. Si tiene dudas, pregunte a su hija Anita.",
        ],
      },
      {
        keywords: ["dolor", "duele", "mareo", "enfermo"],
        replies: [
          "Siento que no se encuentre bien. Siéntese y beba un poco de agua. ¿Avisamos a Anita?",
          "Descanse un rato. Si sigue mal, pulse el botón rojo SOS y su familia recibirá el aviso.",
        ],
      },
      {
        keywords: ["comida", "desayuno", "almuerzo", "agua", "comer"],
        replies: [
          "Coma algo ligero y beba un vaso grande de agua. Casi todas sus pastillas se toman después de comer.",
          "Muy buena idea. No olvide sus pastillas después de la comida.",
        ],
      },
      {
        keywords: ["doctor", "hospital", "médico", "cita"],
        replies: [
          "Anita tiene los datos de su próxima cita. ¿Le envío un recordatorio?",
          "Si cree que necesita al médico pronto, pulse SOS o pídame que avise a su cuidadora.",
        ],
      },
      {
        keywords: ["solo", "sola", "triste", "familia", "hija"],
        replies: [
          "Su familia la quiere y revisa CareEcho todos los días. Anita vio su buena puntuación de esta semana.",
          "¿Le envío un saludo a Anita? Le encanta saber de usted.",
        ],
      },
      {
        keywords: ["hola", "buenos días", "buenas tardes"],
        replies: [],
      },
    ],
    fallback: [
      "Estoy aquí con usted. ¿Puede repetirlo más despacio?",
      "Cuénteme cómo se siente o pregúnteme por sus medicinas — la escucho.",
    ],
  },
};

function scriptedReply(transcript: string, lang: Lang): string {
  const tree = TREES[lang] ?? TREES["en-US"];
  const t = transcript.toLowerCase();
  const hour = new Date().getHours();

  for (const b of tree.branches) {
    if (b.keywords.some((k) => t.includes(k))) {
      if (b.replies.length === 0) return tree.greeting(hour);
      return b.replies[Math.floor(Math.random() * b.replies.length)];
    }
  }
  // empty-ish transcripts get the time-of-day greeting
  if (t.trim().length < 3) return tree.greeting(hour);
  return tree.fallback[Math.floor(Math.random() * tree.fallback.length)];
}

/* ------------------------------------------------------------------ */
/* Route handler                                                       */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      transcript?: string;
      language?: string;
      context?: string;
    };
    const transcript = (body.transcript ?? "").toString().slice(0, 500);
    const lang = (["en-US", "hi-IN", "es-ES"].includes(body.language ?? "")
      ? body.language
      : "en-US") as Lang;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || transcript.trim().length === 0) {
      return NextResponse.json({
        ok: true,
        demo: true,
        language: lang,
        response: scriptedReply(transcript, lang),
      });
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: PERSONA }] },
          contents: [
            {
              parts: [
                {
                  text:
                    (body.context ? `Care context: ${body.context}. ` : "") +
                    `The senior says: "${transcript}"`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 120 },
        }),
      });
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text =
        data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
      if (!text) throw new Error("Empty Gemini reply");
      return NextResponse.json({ ok: true, demo: false, language: lang, response: text });
    } catch (err) {
      console.warn("[voice-companion] Gemini failed, falling back:", err);
      return NextResponse.json({
        ok: true,
        demo: true,
        language: lang,
        response: scriptedReply(transcript, lang),
      });
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Send JSON { transcript, language }." },
      { status: 400 }
    );
  }
}
