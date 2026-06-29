// LLM + ASR client using Groq's OpenAI-compatible API.
// Free tier: 30 req/min, 14,400 req/day on llama-3.3-70b-versatile.
// Get a free key at https://console.groq.com

const GROQ_API_URL = 'https://api.groq.com/openai/v1';
const GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile';
const GROQ_ASR_MODEL = 'whisper-large-v3-turbo';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

export function getGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error('GROQ_API_KEY environment variable is not set. Get a free key at https://console.groq.com');
  }
  return key;
}

/**
 * Call Groq's chat completion API (OpenAI-compatible).
 * Returns the raw text content from the model.
 */
export async function groqChatCompletion(
  messages: GroqMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const apiKey = getGroqApiKey();

  const body: Record<string, unknown> = {
    model: GROQ_CHAT_MODEL,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 2000,
    response_format: { type: 'json_object' }, // Groq supports JSON mode for structured output
  };

  const res = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '(no error body)');
    throw new Error(`Groq API error ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as GroqChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned empty response');
  }
  return content;
}

/**
 * Transcribe audio using Groq's Whisper API.
 * Accepts base64-encoded audio (data URL or raw base64).
 */
export async function groqTranscribe(audioBase64: string): Promise<string> {
  const apiKey = getGroqApiKey();

  // Strip data URL prefix if present
  const base64Data = audioBase64.includes(',')
    ? audioBase64.split(',')[1]
    : audioBase64;

  // Groq's audio API expects multipart/form-data with a file upload
  const audioBuffer = Buffer.from(base64Data, 'base64');
  const blob = new Blob([audioBuffer], { type: 'audio/webm' });

  const formData = new FormData();
  formData.append('file', blob, 'audio.webm');
  formData.append('model', GROQ_ASR_MODEL);
  formData.append('response_format', 'json');

  const res = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '(no error body)');
    throw new Error(`Groq ASR error ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as { text?: string };
  if (!data.text) {
    throw new Error('Groq ASR returned empty transcript');
  }
  return data.text;
}
