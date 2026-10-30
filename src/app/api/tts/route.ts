import { NextRequest, NextResponse } from 'next/server';

const LANG_CODE_MAP: Record<string, string> = {
  'hi-IN': 'hi',
  'ta-IN': 'ta',
  'te-IN': 'te',
  'bn-IN': 'bn',
  'mr-IN': 'mr',
  'gu-IN': 'gu',
  'kn-IN': 'kn',
  'ml-IN': 'ml',
  'pa-IN': 'pa',
  'es-ES': 'es',
  'en-US': 'en',
  hi: 'hi',
  ta: 'ta',
  te: 'te',
  bn: 'bn',
  mr: 'mr',
  gu: 'gu',
  kn: 'kn',
  ml: 'ml',
  pa: 'pa',
  es: 'es',
  en: 'en',
};

// Split text into natural chunks <= maxLen (Google TTS limit is ~180-200 chars)
function splitTextIntoTtsChunks(text: string, maxLen = 150): string[] {
  if (!text) return [];
  if (text.length <= maxLen) return [text];

  const sentences = text.split(/(?<=[.!?।;,\n])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    if (!current) {
      if (s.length > maxLen) {
        // Split extra-long sentence by space
        const words = s.split(/\s+/);
        for (const w of words) {
          if (!current) {
            current = w;
          } else if (current.length + w.length + 1 <= maxLen) {
            current += ' ' + w;
          } else {
            chunks.push(current);
            current = w;
          }
        }
      } else {
        current = s;
      }
    } else if (current.length + s.length + 1 <= maxLen) {
      current += ' ' + s;
    } else {
      chunks.push(current);
      current = s;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

async function fetchChunkAudio(chunk: string, targetLang: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    chunk
  )}&tl=${encodeURIComponent(targetLang)}&client=tw-ob`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Google TTS request failed with status ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text') || '';
    const lang = searchParams.get('lang') || 'en-US';

    if (!text.trim()) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const targetLang = LANG_CODE_MAP[lang] || lang.split(/[-_]/)[0] || 'en';
    const chunks = splitTextIntoTtsChunks(text.trim());

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No speakable text' }, { status: 400 });
    }

    const buffers: Buffer[] = [];
    for (const chunk of chunks) {
      const buf = await fetchChunkAudio(chunk, targetLang);
      buffers.push(buf);
    }

    const combinedBuffer = Buffer.concat(buffers);

    return new NextResponse(combinedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('TTS GET error:', error);
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text || '';
    const lang = body.lang || 'en-US';

    if (!text.trim()) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const targetLang = LANG_CODE_MAP[lang] || lang.split(/[-_]/)[0] || 'en';
    const chunks = splitTextIntoTtsChunks(text.trim());

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No speakable text' }, { status: 400 });
    }

    const buffers: Buffer[] = [];
    for (const chunk of chunks) {
      const buf = await fetchChunkAudio(chunk, targetLang);
      buffers.push(buf);
    }

    const combinedBuffer = Buffer.concat(buffers);

    return new NextResponse(combinedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('TTS POST error:', error);
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
  }
}
