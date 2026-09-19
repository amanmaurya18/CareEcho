import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Medication } from '@/lib/types';

interface VoiceCompanionRequestBody {
  query?: string;
  language?: string;
  patientName?: string;
  nextMedication?: string;
  medications?: Medication[];
}

export async function POST(req: NextRequest) {
  try {
    const body: VoiceCompanionRequestBody = await req.json().catch(() => ({}));
    const {
      query = '',
      language = 'en-US',
      patientName = 'Margaret',
      nextMedication = '',
      medications = [],
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    const firstName = patientName.split(' ')[0] || 'there';

    // Format active medication list for AI context
    const medsSummary = medications.length > 0
      ? medications.map((m, idx) =>
          `${idx + 1}. ${m.name} (${m.dosage}, ${m.form || 'tablet'}): Scheduled at ${m.scheduledTime} (${m.timeOfDay}). Status: ${m.status.toUpperCase()}. Instructions: "${m.instructions}". Condition/Purpose: "${m.purpose || 'Health maintenance'}".`
        ).join('\n')
      : `1. Upcoming dose: ${nextMedication || 'Daily health regimen'}`;

    // 1. Try Gemini Multimodal AI if API Key is available
    if (apiKey && query.trim()) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are CareEcho, a compassionate, warm, and natural personal health companion speaking directly to an elderly patient named ${patientName}.

PATIENT'S ACTIVE PRESCRIBED MEDICATIONS LIST:
${medsSummary}

USER QUERY: "${query}"
REQUESTED LANGUAGE: ${language}

CRITICAL INSTRUCTIONS:
1. FOCUS RULE (MEDICINE ONLY):
   - If the user asks about ANYTHING NOT related to their medications, prescriptions, daily pill schedule, or medical routine (such as weather, politics, sports, general trivia, math, jokes, news, or random conversation):
     Do NOT answer their off-topic question. Instead, warmly and politely direct them back to their medicines.
     Example natural response: "I am here specifically to help you with your medications and daily schedule, ${firstName}. Please ask me any questions about your pills, timings, or dosages!"
2. MEDICINE CHECK RULE:
   - When the user asks about medications:
     a) Always verify against the patient's active prescribed list above.
     b) If they ask about a medicine that IS on their list (e.g. Metformin, Lisinopril, timing, purpose, instructions, or whether they took it):
        Answer accurately and warmly based on their list details.
     c) If they ask about a medication that is NOT on their prescribed list:
        Clearly state that this medicine is not in their current schedule, remind them what they ARE taking if helpful, and advise them to consult their doctor or caregiver before taking it.
     d) If they ask general schedule questions ("What do I take next?", "Did I take all my pills?", "What is pending?"):
        Give a clear, accurate update on their pending or completed doses from the list.
3. CONVERSATIONAL TONE & HUMANITY:
   - Speak in a very warm, comforting, natural human tone — like a caring personal nurse speaking directly to them.
   - Do NOT sound robotic, repetitive, or like you are reading a rigid database.
   - Keep answers concise (1 to 2 clear sentences for elderly audio listening).
   - Respond in the requested language (${language}).
   - Do NOT use markdown symbols, asterisks, bullet points, or complex medical jargon.`;

        const result = await model.generateContent(prompt);
        const reply = result.response.text().trim();

        if (reply) {
          return NextResponse.json({
            response: reply,
            source: 'gemini-1.5-flash',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to intelligent dynamic responder:', geminiErr);
      }
    }

    // 2. Intelligent, Dynamic Natural Response Engine (Offline / Graceful Fallback)
    const reply = generateNaturalResponse({
      query,
      language,
      patientName: firstName,
      medications,
      nextMedication,
    });

    return NextResponse.json({
      response: reply,
      source: 'dynamic-natural-companion',
    });
  } catch (err) {
    console.error('Voice companion error:', err);
    return NextResponse.json({
      response: 'I am here to help you with your medications and daily schedule. Please feel free to ask me about your pills, timings, or dosages!',
      source: 'fallback',
    });
  }
}

/**
 * Intelligent dynamic responder that checks the patient's actual medicine list,
 * enforces the medicine-only domain rule, and generates warm, natural, non-robotic responses.
 */
function generateNaturalResponse({
  query,
  language,
  patientName,
  medications,
  nextMedication,
}: {
  query: string;
  language: string;
  patientName: string;
  medications: Medication[];
  nextMedication: string;
}): string {
  const q = query.trim().toLowerCase();
  const lang = language.toLowerCase();

  // --- A. GREETINGS ---
  const isGreeting =
    /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|greetings)\b/i.test(q) ||
    /^(नमस्ते|प्रणाम|हेलो|हाय)/.test(q) ||
    /^(hola|buenos días|buenas tardes|buenas noches)/i.test(q);

  if (isGreeting) {
    if (lang.startsWith('hi')) {
      return `नमस्ते ${patientName}! मैं आपकी दवाओं और दिनचर्या में मदद के लिए यहाँ हूँ। आज आप अपनी किस दवा या समय के बारे में जानना चाहते हैं?`;
    }
    if (lang.startsWith('es')) {
      return `¡Hola ${patientName}! Estoy aquí para ayudarle con sus medicamentos y horario diario. ¿Qué medicina o dosis le gustaría consultar hoy?`;
    }
    return `Hello ${patientName}! I am right here to help with your medications and daily schedule. What pill or timing would you like to check?`;
  }

  // --- B. CHECK IF QUERY IS ABOUT MEDICINES / HEALTH / SCHEDULE ---
  // List of common medication keywords
  const medicineKeywords = [
    'medicine', 'medication', 'pill', 'tablet', 'capsule', 'dose', 'dosage', 'prescription',
    'drug', 'syrup', 'drops', 'inhaler', 'injection', 'take', 'taken', 'taking', 'pending',
    'schedule', 'timing', 'time', 'next', 'upcoming', 'left', 'missed', 'regimen', 'doctor',
    'blood pressure', 'bp', 'sugar', 'diabetes', 'cholesterol', 'calcium', 'vitamin', 'sleep',
    'food', 'water', 'breakfast', 'lunch', 'dinner', 'meal', 'empty stomach', 'stomach',
    // Hindi keywords
    'दवा', 'दवाई', 'गोली', 'खुराक', 'समय', 'कब', 'लेना', 'ली', 'बची', 'सुबह', 'दोपहर', 'शाम', 'रात', 'बीपी', 'शुगर', 'खाना', 'पानी',
    // Spanish keywords
    'medicina', 'medicamento', 'pastilla', 'píldora', 'dosis', 'horario', 'cuándo', 'tomar', 'tomé', 'pendiente', 'mañana', 'tarde', 'noche', 'presión', 'azúcar', 'comida', 'agua'
  ];

  // Transliteration & alias mapping for Hindi/Spanish medicine names
  const nameAliases: Record<string, string[]> = {
    metformin: ['मेटफॉर्मिन', 'मेटफोर्मिन', 'metformina'],
    lisinopril: ['लिसिनोप्रिल', 'लिसिनोप्रिन', 'lisinoprilo'],
    atorvastatin: ['एटोरवास्टेटिन', 'अटोर्वास्टैटिन', 'atorvastatina'],
    melatonin: ['मेलाटोनिन', 'melatonina'],
    calcium: ['कैल्शियम', 'calcio'],
    vitamin: ['विटामिन', 'vitamina'],
  };

  const matchesMed = (m: Medication) => {
    const medLower = m.name.toLowerCase();
    if (q.includes(medLower)) return true;
    if (m.purpose && q.includes(m.purpose.toLowerCase())) return true;
    for (const [key, aliases] of Object.entries(nameAliases)) {
      if (medLower.includes(key)) {
        if (aliases.some((alias) => q.includes(alias))) return true;
      }
    }
    return false;
  };

  // Check if user mentions any actual medicine name from the patient's list
  const hasMedNameInQuery = medications.some(matchesMed);

  // Common unprescribed drug names to detect when user asks about an unknown drug
  const commonOtherDrugs = [
    'aspirin', 'ibuprofen', 'advil', 'tylenol', 'paracetamol', 'crocin', 'panadol',
    'amoxicillin', 'antibiotic', 'cough syrup', 'combiflam', 'allegra', 'cetirizine', 'omeprazole', 'xanax'
  ];
  const mentionedOtherDrug = commonOtherDrugs.find((drug) => q.includes(drug));

  const isMedicineRelated =
    hasMedNameInQuery ||
    Boolean(mentionedOtherDrug) ||
    medicineKeywords.some((kw) => q.includes(kw));

  // --- C. OFF-TOPIC REDIRECTION ---
  // If the query has nothing to do with medicine or schedule, guide them back warmly.
  if (!isMedicineRelated) {
    if (lang.startsWith('hi')) {
      const hiRedirects = [
        `मैं केवल आपकी दवाओं और स्वास्थ्य दिनचर्या में सहायता के लिए हूँ, ${patientName}। कृपया मुझसे अपनी दवाओं, खुराक या समय के बारे में कोई भी प्रश्न पूछें!`,
        `मैं आपकी दवाइयों की साथी CareEcho हूँ। अपनी किसी भी दवा, खुराक या समय-सारणी के बारे में निसंकोच पूछें!`,
      ];
      return hiRedirects[Math.floor(Math.random() * hiRedirects.length)];
    }

    if (lang.startsWith('es')) {
      const esRedirects = [
        `Estoy aquí específicamente para ayudarle con sus medicamentos y horario diario, ${patientName}. ¡Por favor, hágame cualquier pregunta sobre sus medicinas o dosis!`,
        `Como su compañero de salud CareEcho, estoy dedicado a sus medicamentos. Por favor, consúlteme sobre sus pastillas, horarios o instrucciones médicas.`,
      ];
      return esRedirects[Math.floor(Math.random() * esRedirects.length)];
    }

    const enRedirects = [
      `I am here specifically to help you with your medications and daily schedule, ${patientName}. Please ask me any questions about your pills, timings, or dosages!`,
      `I focus entirely on keeping your medications on track, ${patientName}. Feel free to ask me anything about your pills, schedule, or instructions!`,
      `As your CareEcho companion, I am dedicated to your prescriptions and daily routine. Please ask me about any medicine, dosage, or timing!`,
    ];
    return enRedirects[Math.floor(Math.random() * enRedirects.length)];
  }

  // --- D. CHECK AGAINST THE MEDICINE LIST ---

  // 1. Did the user ask about an unknown drug not in their list?
  if (mentionedOtherDrug && !hasMedNameInQuery) {
    const activeNames = medications.map((m) => m.name).join(', ');
    const drugCap = mentionedOtherDrug.charAt(0).toUpperCase() + mentionedOtherDrug.slice(1);

    if (lang.startsWith('hi')) {
      return `मैंने आपकी दवाओं की सूची देखी है, और ${drugCap} आपकी वर्तमान निर्धारित दवाओं में शामिल नहीं है। आपकी निर्धारित दवाएं हैं: ${activeNames}। कृपया इसे लेने से पहले अपने डॉक्टर से सलाह लें।`;
    }
    if (lang.startsWith('es')) {
      return `He revisado su lista actual y ${drugCap} no está entre sus medicamentos recetados. Sus medicinas activas son: ${activeNames}. Por favor consulte a su médico antes de tomarla.`;
    }
    return `I checked your active prescription list, and ${drugCap} is not listed in your scheduled medications. Your active medicines are ${activeNames}. Please consult your doctor or caregiver before taking anything new.`;
  }

  // 2. Did the user ask about a specific medicine from their list?
  const matchedMed = medications.find(matchesMed);

  if (matchedMed) {
    const isAskingTiming = q.includes('when') || q.includes('time') || q.includes('schedule') || q.includes('कब') || q.includes('समय') || q.includes('cuándo') || q.includes('hora');
    const isAskingPurpose = q.includes('why') || q.includes('what for') || q.includes('purpose') || q.includes('किसलिए') || q.includes('काम') || q.includes('para qué') || q.includes('por qué');
    const isAskingTaken = q.includes('did i take') || q.includes('have i taken') || q.includes('taken') || q.includes('status') || q.includes('ली') || q.includes('ले ली') || q.includes('ya tomé');
    const isAskingFood = q.includes('food') || q.includes('water') || q.includes('meal') || q.includes('breakfast') || q.includes('dinner') || q.includes('खाना') || q.includes('पानी') || q.includes('comida') || q.includes('agua');

    // Hindi responses for specific med
    if (lang.startsWith('hi')) {
      if (isAskingTaken) {
        return matchedMed.status === 'taken'
          ? `हाँ ${patientName}, आप आज की ${matchedMed.name} खुराक ले चुके हैं! बहुत बढ़िया।`
          : `नहीं ${patientName}, आपकी ${matchedMed.name} ${matchedMed.dosage} अभी बाकी है। इसका समय ${matchedMed.scheduledTime} है।`;
      }
      if (isAskingTiming) {
        return `आपकी ${matchedMed.name} ${matchedMed.dosage} का समय ${matchedMed.scheduledTime} (${matchedMed.timeOfDay}) है। ${matchedMed.instructions}`;
      }
      if (isAskingPurpose) {
        return `${matchedMed.name} आपकी ${matchedMed.purpose || 'सेहत'} के लिए निर्धारित है। इसे ${matchedMed.instructions} लेना है।`;
      }
      return `${matchedMed.name} (${matchedMed.dosage}) का समय ${matchedMed.scheduledTime} है। निर्देश: ${matchedMed.instructions}। वर्तमान स्थिति: ${matchedMed.status === 'taken' ? 'ली जा चुकी है' : 'बाकी है'}।`;
    }

    // Spanish responses for specific med
    if (lang.startsWith('es')) {
      if (isAskingTaken) {
        return matchedMed.status === 'taken'
          ? `¡Sí, ${patientName}! Ya ha tomado su dosis de ${matchedMed.name} de hoy. Excelente trabajo.`
          : `Aún no, ${patientName}. Su ${matchedMed.name} ${matchedMed.dosage} está pendiente para las ${matchedMed.scheduledTime}.`;
      }
      if (isAskingTiming) {
        return `Su ${matchedMed.name} ${matchedMed.dosage} está programado para las ${matchedMed.scheduledTime} (${matchedMed.timeOfDay}). ${matchedMed.instructions}`;
      }
      if (isAskingPurpose) {
        return `${matchedMed.name} está recetado para ${matchedMed.purpose || 'su salud'}. Tome ${matchedMed.dosage}: ${matchedMed.instructions}.`;
      }
      return `${matchedMed.name} (${matchedMed.dosage}) está programado para las ${matchedMed.scheduledTime}. Instrucciones: ${matchedMed.instructions}.`;
    }

    // English responses for specific med
    if (isAskingTaken) {
      return matchedMed.status === 'taken'
        ? `Yes, ${patientName}, you've already taken your ${matchedMed.name} for today! Great job staying on track.`
        : `Not yet, ${patientName}. Your ${matchedMed.name} ${matchedMed.dosage} is still pending for ${matchedMed.scheduledTime}. Remember: ${matchedMed.instructions}`;
    }
    if (isAskingTiming) {
      return `Your ${matchedMed.name} ${matchedMed.dosage} is scheduled for ${matchedMed.scheduledTime} in the ${matchedMed.timeOfDay}. ${matchedMed.instructions} (Status: ${matchedMed.status}).`;
    }
    if (isAskingPurpose) {
      return `${matchedMed.name} is prescribed for ${matchedMed.purpose || 'your ongoing health care'}. You take ${matchedMed.dosage} — ${matchedMed.instructions}.`;
    }
    if (isAskingFood) {
      return `For ${matchedMed.name} ${matchedMed.dosage}: ${matchedMed.instructions} Scheduled at ${matchedMed.scheduledTime}.`;
    }
    return `${matchedMed.name} ${matchedMed.dosage} is scheduled for ${matchedMed.scheduledTime} (${matchedMed.timeOfDay}). Instructions: ${matchedMed.instructions} (Currently ${matchedMed.status}).`;
  }

  // 3. Asking about upcoming / next dose
  const isNextQuery = q.includes('next') || q.includes('upcoming') || q.includes('अगली') || q.includes('próximo') || q.includes('siguiente');
  if (isNextQuery) {
    const pendingMeds = medications.filter((m) => m.status === 'pending');
    if (pendingMeds.length === 0) {
      if (lang.startsWith('hi')) return `बहुत खूब ${patientName}! आपने आज की सभी निर्धारित दवाएं ले ली हैं। आराम करें और खूब पानी पिएं।`;
      if (lang.startsWith('es')) return `¡Excelente trabajo ${patientName}! Ya ha tomado todos sus medicamentos programados para hoy. Descanse y manténgase hidratado.`;
      return `Wonderful job ${patientName}! You have already taken all of your scheduled medications for today. Rest well and stay hydrated.`;
    }

    const next = pendingMeds[0];
    if (lang.startsWith('hi')) return `आपकी अगली दवा ${next.name} ${next.dosage} है, जो ${next.scheduledTime} (${next.timeOfDay}) के लिए निर्धारित है। ${next.instructions}`;
    if (lang.startsWith('es')) return `Su próximo medicamento es ${next.name} ${next.dosage} a las ${next.scheduledTime} (${next.timeOfDay}). ${next.instructions}`;
    return `Your next upcoming medicine is ${next.name} ${next.dosage} scheduled for ${next.scheduledTime} (${next.timeOfDay}). ${next.instructions}`;
  }

  // 4. Asking about pending / remaining doses
  const isPendingQuery = q.includes('pending') || q.includes('left') || q.includes('remaining') || q.includes('बाकी') || q.includes('pendiente') || q.includes('queda');
  if (isPendingQuery) {
    const pending = medications.filter((m) => m.status === 'pending');
    if (lang.startsWith('hi')) {
      if (pending.length === 0) return `आपकी कोई भी दवा बाकी नहीं है! आज की सभी खुराक पूरी हो चुकी हैं।`;
      const list = pending.map((m) => `${m.name} (${m.scheduledTime})`).join(', ');
      return `आज आपकी ${pending.length} दवाएं बाकी हैं: ${list}।`;
    }
    if (lang.startsWith('es')) {
      if (pending.length === 0) return `¡No tiene medicamentos pendientes! Todas sus dosis de hoy están completadas.`;
      const list = pending.map((m) => `${m.name} a las ${m.scheduledTime}`).join(', ');
      return `Tiene ${pending.length} medicamento${pending.length > 1 ? 's' : ''} pendiente${pending.length > 1 ? 's' : ''} hoy: ${list}.`;
    }
    if (pending.length === 0) {
      return `You have zero pending medications! All doses for today are completely marked as taken.`;
    }
    const list = pending.map((m) => `${m.name} at ${m.scheduledTime}`).join(', ');
    return `You have ${pending.length} pending medication${pending.length > 1 ? 's' : ''} left today: ${list}.`;
  }

  // 5. Asking about already taken doses
  const isTakenQuery = q.includes('taken') || q.includes('completed') || q.includes('ली') || q.includes('tomé') || q.includes('tomado');
  if (isTakenQuery) {
    const taken = medications.filter((m) => m.status === 'taken');
    if (lang.startsWith('hi')) {
      if (taken.length === 0) return `आपने आज अभी तक कोई दवा नहीं ली है। आपकी पहली दवा ${medications[0]?.name || nextMedication} है।`;
      const list = taken.map((m) => m.name).join(', ');
      return `आपने आज ${list} ले ली है। बहुत बढ़िया!`;
    }
    if (lang.startsWith('es')) {
      if (taken.length === 0) return `Aún no ha registrado ninguna dosis como tomada hoy. Su primer medicamento es ${medications[0]?.name || nextMedication}.`;
      const list = taken.map((m) => m.name).join(', ');
      return `Ya ha tomado ${list} hoy. ¡Buen trabajo!`;
    }
    if (taken.length === 0) {
      return `You haven't logged any doses as taken yet today. Your first scheduled dose is ${medications[0]?.name || nextMedication}.`;
    }
    const list = taken.map((m) => m.name).join(', ');
    return `You've already taken ${list} today. Keep up the wonderful routine!`;
  }

  // 6. Asking for general schedule overview or all medicines
  if (medications.length > 0) {
    const pendingCount = medications.filter((m) => m.status === 'pending').length;
    const medNames = medications.map((m) => `${m.name} (${m.scheduledTime})`).join(', ');

    if (lang.startsWith('hi')) {
      return `आपकी वर्तमान दवाएं हैं: ${medNames}। आज आपकी ${pendingCount} खुराक बाकी हैं। आप किसी भी विशेष दवा के बारे में पूछ सकते हैं!`;
    }
    if (lang.startsWith('es')) {
      return `Sus medicamentos actuales son: ${medNames}. Le quedan ${pendingCount} dosis pendientes hoy. ¡Consúlteme sobre cualquiera de ellos!`;
    }
    return `Your active prescriptions are: ${medNames}. You currently have ${pendingCount} pending dose${pendingCount !== 1 ? 's' : ''} for today. Feel free to ask about any specific pill!`;
  }

  // Fallback default
  return `I am here to assist with your medications, ${patientName}. Please ask me about your pill timings, dosages, or how to take them!`;
}
