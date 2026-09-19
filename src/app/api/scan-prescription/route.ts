import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SAMPLE_PRESCRIPTION_1, SAMPLE_PRESCRIPTION_2 } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { image } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // FAILSAFE: If no GEMINI_API_KEY is provided, return realistic simulated parsed prescription
    if (!apiKey) {
      console.log('CareEcho: No GEMINI_API_KEY found. Using high-fidelity demo fallback.');
      
      // Select sample 1 or 2
      const isAlt = image && typeof image === 'string' && image.length % 2 === 0;
      const demoResult = isAlt ? SAMPLE_PRESCRIPTION_2 : SAMPLE_PRESCRIPTION_1;

      return NextResponse.json({
        ...demoResult,
        isDemo: true,
        message: 'Demo Mode: Sample prescription extracted with zero-friction fallback.',
      });
    }

    // If API key is present and image is provided
    if (image && typeof image === 'string') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a medical prescription parser. Extract medication names, dosage, frequency, time of day (Morning/Afternoon/Evening/Night), and specific instructions (e.g., after food). Respond ONLY with valid JSON following this schema: { "medicines": [{ "name": "string", "dosage": "string", "frequency": "string", "time": "string", "instructions": "string" }], "doctorName": "string", "clinicName": "string", "notes": "string" }`;

      // Extract base64 data without prefix
      const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
      const mimeType = image.includes('image/png')
        ? 'image/png'
        : image.includes('image/webp')
        ? 'image/webp'
        : 'image/jpeg';

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
      ]);

      const responseText = result.response.text();
      // Clean JSON backticks if present
      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      return NextResponse.json({
        ...parsed,
        isDemo: false,
      });
    }

    // Default fallback
    return NextResponse.json({
      ...SAMPLE_PRESCRIPTION_1,
      isDemo: true,
      message: 'Demo Mode: Sample prescription extracted.',
    });
  } catch (error) {
    console.error('Prescription OCR error:', error);
    // Graceful fallback on any error so app never crashes
    return NextResponse.json({
      ...SAMPLE_PRESCRIPTION_1,
      isDemo: true,
      error: 'OCR parsing fallback engaged.',
    });
  }
}
