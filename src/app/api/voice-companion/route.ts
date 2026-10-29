import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Medication, SupportedLanguage } from '@/lib/types';
import {
  translateInstruction,
  translatePurpose,
  translateTimeOfDay,
  translateForm,
} from '@/lib/translations';

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
    const currentLang = (language as SupportedLanguage) || 'en-US';

    // Format active medication list for AI context in the requested language
    const medsSummary = medications.length > 0
      ? medications.map((m, idx) =>
          `${idx + 1}. ${m.name} (${m.dosage}, ${translateForm(m.form, currentLang)}): Scheduled at ${m.scheduledTime} (${translateTimeOfDay(m.timeOfDay, currentLang)}). Status: ${m.status === 'taken' ? 'TAKEN' : 'PENDING'}. Instructions: "${translateInstruction(m.instructions, currentLang)}". Condition/Purpose: "${translatePurpose(m.purpose, currentLang) || 'Health maintenance'}".`
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
   - Do NOT use markdown symbols, asterisks, bullet points, or complex medical jargon.
4. STRICT SINGLE LANGUAGE MANDATE (CRITICAL):
   - You MUST formulate your entire response 100% in the requested language: ${language}.
   - NEVER output mixed-language text like "निर्देश: Take with a full glass of water after food" or "Instrucciones: Take 1 tablet".
   - Every single word and instruction MUST be purely in ${language}.`;

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

  const targetLang: SupportedLanguage =
    lang.startsWith('hi') ? 'hi-IN' :
    lang.startsWith('es') ? 'es-ES' :
    lang.startsWith('ta') ? 'ta-IN' :
    lang.startsWith('te') ? 'te-IN' :
    lang.startsWith('bn') ? 'bn-IN' :
    lang.startsWith('mr') ? 'mr-IN' :
    lang.startsWith('gu') ? 'gu-IN' :
    lang.startsWith('kn') ? 'kn-IN' :
    lang.startsWith('ml') ? 'ml-IN' :
    lang.startsWith('pa') ? 'pa-IN' : 'en-US';

  // --- A. GREETINGS ---
  const isGreeting =
    /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|greetings)\b/i.test(q) ||
    /^(नमस्ते|प्रणाम|हेलो|हाय)/.test(q) ||
    /^(hola|buenos días|buenas tardes|buenas noches)/i.test(q);

  if (isGreeting) {
    if (lang.startsWith('hi')) {
      return `नमस्ते ${patientName}! मैं आपकी दवाओं और दिनचर्या में मदद के लिए यहाँ हूँ। आज आप अपनी किस दवा या समय के बारे में जानना चाहते हैं?`;
    }
    if (lang.startsWith('ta')) {
      return `வணக்கம் ${patientName}! நான் உங்கள் மருந்துகளுக்கும் தினசரி அட்டவணைக்கும் உதவ இங்கே இருக்கிறேன். இன்று நீங்கள் எதைப் பற்றி தெரிந்துகொள்ள விரும்புகிறீர்கள்?`;
    }
    if (lang.startsWith('te')) {
      return `నమస్కారం ${patientName}! మీ మందులు మరియు రోజువారీ షెడ్యూల్‌లో సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. ఈరోజు మీరు ఏ మందు గురించి తెలుసుకోవాలనుకుంటున్నారు?`;
    }
    if (lang.startsWith('bn')) {
      return `নমস্কার ${patientName}! আমি আপনার ওষুধ এবং দৈনন্দিন রুটিনে সাহায্য করার জন্য এখানে আছি। আজ আপনি কোন ওষুধ সম্পর্কে জানতে চান?`;
    }
    if (lang.startsWith('mr')) {
      return `नमस्कार ${patientName}! मी तुमच्या औषधांमध्ये आणि दैनंदिन दिनचर्येत मदत करण्यासाठी येथे आहे. आज तुम्हाला कोणत्या औषधाबद्दल जाणून घ्यायचे आहे?`;
    }
    if (lang.startsWith('gu')) {
      return `નમસ્તે ${patientName}! હું તમારી દવાઓ અને દિનચર્યામાં મદદ કરવા માટે અહીં છું. આજે તમે કઈ દવા વિશે જાણવા માંગો છો?`;
    }
    if (lang.startsWith('kn')) {
      return `ನಮಸ್ಕಾರ ${patientName}! ನಿಮ್ಮ ಔಷಧಿಗಳು ಮತ್ತು ದಿನಚರಿಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ಇಂದು ನೀವು ಯಾವ ಔಷಧಿಯ ಬಗ್ಗೆ ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?`;
    }
    if (lang.startsWith('ml')) {
      return `നമസ്കാരം ${patientName}! നിങ്ങളുടെ മരുന്നുകളിലും ദിനചര്യകളിലും സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. ഇന്ന് ഏത് മരുന്നിനെക്കുറിച്ചാണ് അറിയേണ്ടത്?`;
    }
    if (lang.startsWith('pa')) {
      return `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ${patientName}! ਮੈਂ ਤੁਹਾਡੀ ਦਵਾਈਆਂ ਅਤੇ ਰੋਜ਼ਾਨਾ ਰੁਟੀਨ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ। ਅੱਜ ਤੁਸੀਂ ਕਿਸ ਦਵਾਈ ਬਾਰੇ ਪੁੱਛਣਾ ਚਾਹੁੰਦੇ ਹੋ?`;
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
    const redirectMap: Record<SupportedLanguage, string> = {
      'hi-IN': `मैं केवल आपकी दवाओं और स्वास्थ्य दिनचर्या में सहायता के लिए हूँ, ${patientName}। अपनी किसी भी दवा, खुराक या समय के बारे में पूछें!`,
      'es-ES': `Estoy aquí específicamente para ayudarle con sus medicamentos y horario diario, ${patientName}. ¡Por favor hágame cualquier pregunta sobre sus medicinas o dosis!`,
      'ta-IN': `நான் உங்கள் மருந்துகளுக்கும் தினசரி அட்டவணைக்கும் உதவ இங்கே இருக்கிறேன், ${patientName}. உங்கள் மருந்துகள் மற்றும் நேரம் பற்றி கேளுங்கள்!`,
      'te-IN': `నేను మీ మందులు మరియు రోజువారీ షెడ్యూల్ కోసం మాత్రమే ఇక్కడ ఉన్నాను, ${patientName}. మీ మందుల వివరాలు లేదా సమయం అడగండి!`,
      'bn-IN': `আমি কেবল আপনার ওষুধ ও স্বাস্থ্য রুটিনে সাহায্য করার জন্য আছি, ${patientName}। আপনার ওষুধের মাত্রা বা সময়সূচী সম্পর্কে প্রশ্ন করুন!`,
      'mr-IN': `मी फक्त तुमच्या औषधांच्या मदतीसाठी येथे आहे, ${patientName}. तुमच्या गोळ्या, खुराक किंवा वेळेबद्दल निसंकोच विचारा!`,
      'gu-IN': `હું ફક્ત તમારી દવાઓ અને સ્વાસ્થ્ય નિયમ માટે અહીં છું, ${patientName}. તમારી દવાઓ, માત્રા અથવા સમય વિશે પૂછો!`,
      'kn-IN': `ನಾನು ನಿಮ್ಮ ಔಷಧಿಗಳ ಸಹಾಯಕ್ಕಾಗಿ ಇಲ್ಲಿದ್ದೇನೆ, ${patientName}. ನಿಮ್ಮ ಔಷಧಿ ವೇಳಾಪಟ್ಟಿ ಅಥವಾ ಸಮಯದ ಬಗ್ಗೆ ಕೇಳಿ!`,
      'ml-IN': `നിങ്ങളുടെ മരുന്നുകളിലും ദിനചര്യകളിലും സഹായിക്കാനാണ് ഞാൻ ഇവിടെയുള്ളത്, ${patientName}. മരുന്നുകളുടെ സമയത്തെക്കുറിച്ചും അളവിനെക്കുറിച്ചും ചോദിക്കൂ!`,
      'pa-IN': `ਮੈਂ ਸਿਰਫ਼ ਤੁਹਾਡੀ ਦਵਾਈਆਂ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ, ${patientName}। ਆਪਣੀ ਦਵਾਈ, ਖੁਰਾਕ ਜਾਂ ਸਮੇਂ ਬਾਰੇ ਪੁੱਛੋ!`,
      'en-US': `I am here specifically to help you with your medications and daily schedule, ${patientName}. Please ask me any questions about your pills, timings, or dosages!`,
    };

    return redirectMap[targetLang] || redirectMap['en-US'];
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
    const isAskingTiming = q.includes('when') || q.includes('time') || q.includes('schedule') || q.includes('कब') || q.includes('समय') || q.includes('cuándo') || q.includes('hora') || q.includes('நேரம்') || q.includes('సమయం');
    const isAskingPurpose = q.includes('why') || q.includes('what for') || q.includes('purpose') || q.includes('किसलिए') || q.includes('काम') || q.includes('para qué') || q.includes('por qué');
    const isAskingTaken = q.includes('did i take') || q.includes('have i taken') || q.includes('taken') || q.includes('status') || q.includes('ली') || q.includes('ले ली') || q.includes('ya tomé');
    const isAskingFood = q.includes('food') || q.includes('water') || q.includes('meal') || q.includes('breakfast') || q.includes('dinner') || q.includes('खाना') || q.includes('पानी') || q.includes('comida') || q.includes('agua');

    const localizedInstructions = translateInstruction(matchedMed.instructions, targetLang);
    const localizedTimeOfDay = translateTimeOfDay(matchedMed.timeOfDay, targetLang);
    const localizedPurpose = translatePurpose(matchedMed.purpose, targetLang);

    // Hindi responses for specific med
    if (lang.startsWith('hi')) {
      if (isAskingTaken) {
        return matchedMed.status === 'taken'
          ? `हाँ ${patientName}, आप आज की ${matchedMed.name} खुराक ले चुके हैं! बहुत बढ़िया।`
          : `नहीं ${patientName}, आपकी ${matchedMed.name} ${matchedMed.dosage} अभी बाकी है। इसका समय ${matchedMed.scheduledTime} है।`;
      }
      if (isAskingTiming) {
        return `आपकी ${matchedMed.name} ${matchedMed.dosage} का समय ${matchedMed.scheduledTime} (${localizedTimeOfDay}) है। ${localizedInstructions}`;
      }
      if (isAskingPurpose) {
        return `${matchedMed.name} आपकी ${localizedPurpose || 'सेहत'} के लिए निर्धारित है। निर्देश: ${localizedInstructions}`;
      }
      return `${matchedMed.name} (${matchedMed.dosage}) का समय ${matchedMed.scheduledTime} है। निर्देश: ${localizedInstructions}। वर्तमान स्थिति: ${matchedMed.status === 'taken' ? 'ली जा चुकी है' : 'बाकी है'}।`;
    }

    // Spanish responses for specific med
    if (lang.startsWith('es')) {
      if (isAskingTaken) {
        return matchedMed.status === 'taken'
          ? `¡Sí, ${patientName}! Ya ha tomado su dosis de ${matchedMed.name} de hoy. Excelente trabajo.`
          : `Aún no, ${patientName}. Su ${matchedMed.name} ${matchedMed.dosage} está pendiente para las ${matchedMed.scheduledTime}.`;
      }
      if (isAskingTiming) {
        return `Su ${matchedMed.name} ${matchedMed.dosage} está programado para las ${matchedMed.scheduledTime} (${localizedTimeOfDay}). ${localizedInstructions}`;
      }
      if (isAskingPurpose) {
        return `${matchedMed.name} está recetado para ${localizedPurpose || 'su salud'}. Instrucciones: ${localizedInstructions}`;
      }
      return `${matchedMed.name} (${matchedMed.dosage}) está programado para las ${matchedMed.scheduledTime}. Instrucciones: ${localizedInstructions}.`;
    }

    // English responses for specific med
    if (isAskingTaken) {
      return matchedMed.status === 'taken'
        ? `Yes, ${patientName}, you've already taken your ${matchedMed.name} for today! Great job staying on track.`
        : `Not yet, ${patientName}. Your ${matchedMed.name} ${matchedMed.dosage} is still pending for ${matchedMed.scheduledTime}. Remember: ${localizedInstructions}`;
    }
    if (isAskingTiming) {
      return `Your ${matchedMed.name} ${matchedMed.dosage} is scheduled for ${matchedMed.scheduledTime} in the ${localizedTimeOfDay}. ${localizedInstructions} (Status: ${matchedMed.status}).`;
    }
    if (isAskingPurpose) {
      return `${matchedMed.name} is prescribed for ${localizedPurpose || 'your ongoing health care'}. You take ${matchedMed.dosage} — ${localizedInstructions}.`;
    }
    if (isAskingFood) {
      return `For ${matchedMed.name} ${matchedMed.dosage}: ${localizedInstructions} Scheduled at ${matchedMed.scheduledTime}.`;
    }
    return `${matchedMed.name} ${matchedMed.dosage} is scheduled for ${matchedMed.scheduledTime} (${localizedTimeOfDay}). Instructions: ${localizedInstructions} (Currently ${matchedMed.status}).`;
  }

  // 3. Asking about upcoming / next dose
  const isNextQuery = q.includes('next') || q.includes('upcoming') || q.includes('अगली') || q.includes('próximo') || q.includes('siguiente') || q.includes('அடுத்த') || q.includes('తదుపరి') || q.includes('পরবর্তী') || q.includes('पुढील') || q.includes('આગામી') || q.includes('ಮುಂದಿನ') || q.includes('അടുത്ത') || q.includes('ਅਗਲੀ');
  if (isNextQuery) {
    const pendingMeds = medications.filter((m) => m.status === 'pending');
    if (pendingMeds.length === 0) {
      const allDoneMap: Record<SupportedLanguage, string> = {
        'hi-IN': `बहुत खूब ${patientName}! आपने आज की सभी निर्धारित दवाएं ले ली हैं। आराम करें और खूब पानी पिएं।`,
        'es-ES': `¡Excelente trabajo ${patientName}! Ya ha tomado todos sus medicamentos programados para hoy. Descanse bien e hidrátese.`,
        'ta-IN': `அருமை ${patientName}! இன்றைய அனைத்து மருந்துகளையும் எடுத்துவிட்டீர்கள். நன்றாக ஓய்வெடுக்கவும்.`,
        'te-IN': `అద్భుతం ${patientName}! నేటి అన్ని మందులు తీసుకోబడ్డాయి. విశ్రాంతి తీసుకోండి.`,
        'bn-IN': `চমৎকার ${patientName}! আজকের সব ওষুধ খাওয়া সম্পন্ন হয়েছে। বিশ্রাম নিন।`,
        'mr-IN': `छान ${patientName}! आजची सर्व औषधे घेतली गेली आहेत. विश्रांती घ्या.`,
        'gu-IN': `ખૂબ સરસ ${patientName}! આજની બધી દવાઓ લેવાઈ ગઈ છે. આરામ કરો.`,
        'kn-IN': `ಅದ್ಭುತ ${patientName}! ಇಂದಿನ ಎಲ್ಲಾ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ. ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.`,
        'ml-IN': `വളരെ നല്ലത് ${patientName}! ഇന്നത്തെ എല്ലാ മരുന്നുകളും കഴിച്ചു കഴിഞ്ഞു. വിശ്രമിക്കുക.`,
        'pa-IN': `ਬਹੁਤ ਵਧੀਆ ${patientName}! ਅੱਜ ਦੀਆਂ ਸਾਰੀਆਂ ਦਵਾਈਆਂ ਲਈਆਂ ਜਾ ਚੁੱਕੀਆਂ ਹਨ। ਆਰਾਮ ਕਰੋ।`,
        'en-US': `Wonderful job ${patientName}! You have already taken all of your scheduled medications for today. Rest well and stay hydrated.`,
      };
      return allDoneMap[targetLang] || allDoneMap['en-US'];
    }

    const next = pendingMeds[0];
    const nextInst = translateInstruction(next.instructions, targetLang);
    const nextSlot = translateTimeOfDay(next.timeOfDay, targetLang);

    const nextMap: Record<SupportedLanguage, string> = {
      'hi-IN': `आपकी अगली दवा ${next.name} ${next.dosage} है, जो ${next.scheduledTime} (${nextSlot}) के लिए निर्धारित है। निर्देश: ${nextInst}`,
      'es-ES': `Su próximo medicamento es ${next.name} ${next.dosage} a las ${next.scheduledTime} (${nextSlot}). Instrucciones: ${nextInst}`,
      'ta-IN': `உங்கள் அடுத்த மருந்து ${next.name} ${next.dosage}, நேரம் ${next.scheduledTime} (${nextSlot}). குறிப்பு: ${nextInst}`,
      'te-IN': `మీ తదుపరి మందు ${next.name} ${next.dosage}, సమయం ${next.scheduledTime} (${nextSlot}). సూచన: ${nextInst}`,
      'bn-IN': `আপনার পরবর্তী ওষুধ ${next.name} ${next.dosage}, সময় ${next.scheduledTime} (${nextSlot})। নির্দেশ: ${nextInst}`,
      'mr-IN': `तुमचे पुढील औषध ${next.name} ${next.dosage} आहे, वेळ ${next.scheduledTime} (${nextSlot}). सूचना: ${nextInst}`,
      'gu-IN': `તમારી આગામી દવા ${next.name} ${next.dosage} છે, સમય ${next.scheduledTime} (${nextSlot}). સૂચના: ${nextInst}`,
      'kn-IN': `ನಿಮ್ಮ ಮುಂದಿನ ಔಷಧಿ ${next.name} ${next.dosage}, ಸಮಯ ${next.scheduledTime} (${nextSlot}). ಸೂಚನೆ: ${nextInst}`,
      'ml-IN': `നിങ്ങളുടെ അടുത്ത മരുന്ന് ${next.name} ${next.dosage}, സമയം ${next.scheduledTime} (${nextSlot}). നിർദ്ദേശം: ${nextInst}`,
      'pa-IN': `ਤੁਹਾਡੀ ਅਗਲੀ ਦਵਾਈ ${next.name} ${next.dosage} ਹੈ, ਸਮਾਂ ${next.scheduledTime} (${nextSlot})। ਹਦਾਇਤ: ${nextInst}`,
      'en-US': `Your next upcoming medicine is ${next.name} ${next.dosage} scheduled for ${next.scheduledTime} (${nextSlot}). Directions: ${nextInst}`,
    };

    return nextMap[targetLang] || nextMap['en-US'];
  }

  // 4. Asking about pending / remaining doses
  const isPendingQuery = q.includes('pending') || q.includes('left') || q.includes('remaining') || q.includes('बाकी') || q.includes('pendiente') || q.includes('queda') || q.includes('மீதி') || q.includes('మిగిలిన');
  if (isPendingQuery) {
    const pending = medications.filter((m) => m.status === 'pending');
    if (pending.length === 0) {
      if (lang.startsWith('hi')) return `आपकी कोई भी दवा बाकी नहीं है! आज की सभी खुराक पूरी हो चुकी हैं।`;
      if (lang.startsWith('es')) return `¡No tiene medicamentos pendientes! Todas sus dosis de hoy están completadas.`;
      return `You have zero pending medications! All doses for today are completely marked as taken.`;
    }
    const list = pending.map((m) => `${m.name} (${m.scheduledTime})`).join(', ');
    if (lang.startsWith('hi')) return `आज आपकी ${pending.length} दवाएं बाकी हैं: ${list}।`;
    if (lang.startsWith('es')) return `Tiene ${pending.length} medicamento${pending.length > 1 ? 's' : ''} pendiente${pending.length > 1 ? 's' : ''} hoy: ${list}.`;
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
