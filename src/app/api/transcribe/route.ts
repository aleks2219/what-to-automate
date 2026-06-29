import { NextRequest, NextResponse } from 'next/server';
import { getZaiClient } from '@/lib/zai-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audio } = body as { audio: string; mimeType?: string };

    if (!audio || typeof audio !== 'string') {
      return NextResponse.json(
        { error: 'Audio base64 data is required.' },
        { status: 400 }
      );
    }

    // Strip data URL prefix if present (e.g., "data:audio/webm;base64,AAAA...")
    const base64Data = audio.includes(',') ? audio.split(',')[1] : audio;

    // Validate base64 length — minimum reasonable audio (~1 second) is ~5KB
    if (base64Data.length < 1000) {
      return NextResponse.json(
        { error: 'Audio recording too short. Please record at least 5 seconds.' },
        { status: 400 }
      );
    }

    // Cap at ~10MB base64 (~7MB raw) to protect the API
    if (base64Data.length > 14_000_000) {
      return NextResponse.json(
        { error: 'Audio recording too long. Please keep it under 60 seconds.' },
        { status: 400 }
      );
    }

    const zai = getZaiClient();

    const response = await zai.audio.asr.create({
      file_base64: base64Data,
    });

    const transcript = (response as { text?: string }).text?.trim();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Could not transcribe audio. Please try again or type your description.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      transcript,
      wordCount: transcript.split(/\s+/).length,
    });
  } catch (err: unknown) {
    console.error('Transcription error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Transcription failed: ${message}` },
      { status: 500 }
    );
  }
}
